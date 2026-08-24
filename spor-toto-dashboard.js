(() => {
  const DATA_URL = "./data/spor_toto_bulteni.json";
  const STYLE_ID = "spor-toto-pro-style-v4";
  const VERSION = "20260824-spor-toto-pro-v4";

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const text = (value, fallback = "—") => {
    const result = String(value ?? "").trim();
    return result && result !== "null" && result !== "undefined" ? result : fallback;
  };

  const number = (value) => {
    const parsed = Number(String(value ?? "").replace("%", "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatPct = (value) => {
    const parsed = number(value);
    return parsed === null ? "—" : `%${parsed.toFixed(parsed % 1 ? 1 : 0)}`;
  };

  const formatOdd = (value) => {
    const parsed = number(value);
    return parsed && parsed > 1 ? parsed.toFixed(2) : "—";
  };

  const normalizeLegacy = (payload) => {
    if (payload?.engine_version && Array.isArray(payload?.matches)) return payload;
    const matches = (Array.isArray(payload?.matches) ? payload.matches : []).map((item, index) => {
      const odds = {
        "1": number(item.one ?? item.oneOdd),
        X: number(item.draw ?? item.drawOdd),
        "2": number(item.two ?? item.twoOdd),
      };
      const rows = Object.entries(odds).filter(([, odd]) => odd && odd > 1);
      const inverseTotal = rows.reduce((sum, [, odd]) => sum + (1 / odd), 0);
      const probabilities = Object.fromEntries(["1", "X", "2"].map((option) => [
        option,
        odds[option] && inverseTotal ? Number((((1 / odds[option]) / inverseTotal) * 100).toFixed(1)) : null,
      ]));
      const ranked = ["1", "X", "2"].sort((a, b) => (probabilities[b] || 0) - (probabilities[a] || 0));
      const primary = ["1", "X", "2"].includes(String(item.decision || "").toUpperCase())
        ? String(item.decision).toUpperCase() : ranked[0];
      const gap = Number(((probabilities[ranked[0]] || 0) - (probabilities[ranked[1]] || 0)).toFixed(1));
      const confidence = number(item.confidence ?? item.confidence_score) ?? Math.round(probabilities[primary] || 0);
      return {
        ...item,
        no: item.no || index + 1,
        decision: primary,
        selected_options: [primary],
        selection: primary,
        probabilities,
        market_probabilities: probabilities,
        confidence,
        confidence_score: confidence,
        probability_gap: gap,
        risk: item.risk || (gap >= 15 ? "Orta" : "Yüksek"),
        risk_level: item.risk_level || (gap >= 15 ? "Orta" : "Yüksek"),
        classification: item.classification || "Piyasa Bazlı Geçiş",
        coupon_role: item.coupon_role || "Tek",
        column_multiplier: 1,
        data_completeness: number(item.data_completeness) ?? 35,
        reasons: Array.isArray(item.reasons) && item.reasons.length
          ? item.reasons
          : ["PRO Spor Toto verisi yeniden üretilene kadar marjı temizlenmiş 1-X-2 piyasa olasılığı kullanılıyor."],
        form: item.form || { home: { recent: [] }, away: { recent: [] } },
        h2h: Array.isArray(item.h2h) ? item.h2h : [],
        squad: item.squad || { available: false, home: [], away: [], note: "Doğrulanmış eksik/kadro verisi bulunmuyor." },
      };
    });
    return {
      ...payload,
      source: payload?.source || "1-X-2 piyasa verisi",
      bulletin_note: payload?.bulletin_note || "Bu alan Futbol Laboratuvarı 15 maçlık 1-X-2 analiz çalışma listesidir.",
      engine_version: "legacy-market-fallback",
      matches,
      coupon: payload?.coupon || {
        total_columns: matches.reduce((total, item) => total * Math.max(1, number(item.column_multiplier) || 1), matches.length ? 1 : 0),
        double_count: matches.filter((item) => number(item.column_multiplier) === 2).length,
        average_confidence: matches.length ? Math.round(matches.reduce((sum, item) => sum + (number(item.confidence) || 0), 0) / matches.length) : 0,
        average_data_completeness: matches.length ? Math.round(matches.reduce((sum, item) => sum + (number(item.data_completeness) || 0), 0) / matches.length) : 0,
      },
    };
  };

  const readJson = async () => {
    const separator = DATA_URL.includes("?") ? "&" : "?";
    const response = await fetch(`${DATA_URL}${separator}v=${VERSION}-${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Spor Toto verisi ${response.status}`);
    return normalizeLegacy(await response.json());
  };

  const formDots = (recent) => {
    const rows = Array.isArray(recent) ? recent.slice(-5) : [];
    if (!rows.length) return '<span class="st-form-empty">veri yok</span>';
    return rows.map((result) => {
      const code = String(result || "").toUpperCase();
      const klass = code === "W" ? "win" : code === "D" ? "draw" : code === "L" ? "loss" : "neutral";
      const label = code === "W" ? "G" : code === "D" ? "B" : code === "L" ? "M" : "?";
      return `<span class="st-form-dot ${klass}" title="${label}">${label}</span>`;
    }).join("");
  };

  const selectedClass = (item, option) => (Array.isArray(item.selected_options) && item.selected_options.includes(option)) ? "is-selected" : "";
  const riskClass = (value) => String(value || "").toLocaleLowerCase("tr-TR").replace("ü", "u");

  const tableRow = (item, index) => `
    <div class="st-row" data-st-index="${index}">
      <div class="st-no">${escapeHtml(item.no || index + 1)}</div>
      <div class="st-match">
        <small>${escapeHtml(text(item.date, ""))} · ${escapeHtml(text(item.time, "--:--"))} · ${escapeHtml(text(item.league, "Lig"))}</small>
        <strong>${escapeHtml(text(item.home, "Ev sahibi"))} <span>–</span> ${escapeHtml(text(item.away, "Deplasman"))}</strong>
        <em>${escapeHtml(text(item.coupon_role || item.classification, "Analiz"))}</em>
      </div>
      <div class="st-form"><div>${formDots(item.form?.home?.recent)}</div><div>${formDots(item.form?.away?.recent)}</div></div>
      ${["1", "X", "2"].map((option) => `
        <div class="st-pick ${selectedClass(item, option)}">
          <b>${option}</b>
          <span>${formatPct(item.probabilities?.[option])}</span>
          <small>${formatOdd(option === "1" ? item.oneOdd ?? item.one : option === "X" ? item.drawOdd ?? item.draw : item.twoOdd ?? item.two)}</small>
        </div>`).join("")}
      <div class="st-confidence"><b>${escapeHtml(text(item.confidence, "—"))}</b><span>/100</span><small>veri ${escapeHtml(text(item.data_completeness, "—"))}</small></div>
      <div class="st-risk"><span class="risk-${riskClass(item.risk)}">${escapeHtml(text(item.risk, "—"))}</span></div>
      <div class="st-action"><button type="button" data-st-detail="${index}">İncele</button></div>
    </div>`;

  const mobileCard = (item, index) => `
    <article class="st-mobile-card">
      <header><span>#${escapeHtml(item.no || index + 1)}</span><div><small>${escapeHtml(text(item.date, ""))} · ${escapeHtml(text(item.time, "--:--"))}</small><strong>${escapeHtml(text(item.home, "Ev sahibi"))} – ${escapeHtml(text(item.away, "Deplasman"))}</strong><em>${escapeHtml(text(item.league, "Lig"))}</em></div></header>
      <div class="st-mobile-picks">
        ${["1", "X", "2"].map((option) => `<div class="${selectedClass(item, option)}"><b>${option}</b><span>${formatPct(item.probabilities?.[option])}</span><small>${formatOdd(option === "1" ? item.oneOdd ?? item.one : option === "X" ? item.drawOdd ?? item.draw : item.twoOdd ?? item.two)}</small></div>`).join("")}
      </div>
      <div class="st-mobile-meta"><span><b>${escapeHtml(text(item.selection || item.decision, "—"))}</b> seçim</span><span><b>${escapeHtml(text(item.confidence, "—"))}/100</b> güven</span><span class="risk-${riskClass(item.risk)}">${escapeHtml(text(item.risk, "—"))} risk</span></div>
      <div class="st-mobile-form"><span>Ev ${formDots(item.form?.home?.recent)}</span><span>Dep ${formDots(item.form?.away?.recent)}</span></div>
      <button class="st-mobile-detail" type="button" data-st-detail="${index}">Maç analizini aç</button>
    </article>`;

  const formSummary = (profile, fallback) => {
    if (!profile || !number(profile.sample)) return `${fallback}: yeterli sonuç hafızası yok.`;
    return `${fallback}: ${profile.sample} maç · ${profile.wins}G ${profile.draws}B ${profile.losses}M · PPM ${number(profile.ppg)?.toFixed(2) || "0.00"} · Gol ${number(profile.goals_for_avg)?.toFixed(2) || "0.00"}/${number(profile.goals_against_avg)?.toFixed(2) || "0.00"}`;
  };

  const oddsMovement = (item) => ["1", "X", "2"].map((option) => {
    const current = number(option === "1" ? item.oneOdd ?? item.one : option === "X" ? item.drawOdd ?? item.draw : item.twoOdd ?? item.two);
    const opening = number(option === "1" ? item.opening_odds?.one : option === "X" ? item.opening_odds?.draw : item.opening_odds?.two);
    if (!opening || !current) return `${option}: ${formatOdd(current)} (açılış oranı yok)`;
    const delta = Number((current - opening).toFixed(2));
    return `${option}: ${opening.toFixed(2)} → ${current.toFixed(2)} (${delta > 0 ? "+" : ""}${delta.toFixed(2)})`;
  });

  const openDrawer = (item) => {
    let drawer = document.querySelector("#st-pro-drawer");
    if (!drawer) {
      drawer = document.createElement("div");
      drawer.id = "st-pro-drawer";
      drawer.className = "st-drawer";
      document.body.appendChild(drawer);
    }
    const reasons = Array.isArray(item.reasons) ? item.reasons : [];
    const h2h = Array.isArray(item.h2h) ? item.h2h : [];
    const squadHome = Array.isArray(item.squad?.home) ? item.squad.home : [];
    const squadAway = Array.isArray(item.squad?.away) ? item.squad.away : [];
    drawer.innerHTML = `
      <div class="st-drawer-backdrop" data-st-close></div>
      <aside class="st-drawer-panel" role="dialog" aria-modal="true" aria-label="Spor Toto maç analizi">
        <header><div><small>${escapeHtml(text(item.date, ""))} · ${escapeHtml(text(item.time, ""))}</small><h3>${escapeHtml(text(item.home, "Ev sahibi"))} – ${escapeHtml(text(item.away, "Deplasman"))}</h3><p>${escapeHtml(text(item.classification, "1-X-2 analizi"))} · ${escapeHtml(text(item.selection, item.decision))}</p></div><button type="button" data-st-close aria-label="Kapat">×</button></header>
        <section><h4>1-X-2 olasılıkları</h4><div class="st-drawer-probs">${["1", "X", "2"].map((option) => `<div class="${selectedClass(item, option)}"><b>${option}</b><strong>${formatPct(item.probabilities?.[option])}</strong><span>Oran ${formatOdd(option === "1" ? item.one : option === "X" ? item.draw : item.two)}</span></div>`).join("")}</div></section>
        <section><h4>Karar gerekçesi</h4><ul>${(reasons.length ? reasons : ["Gerekçe verisi bekleniyor."]).map((row) => `<li>${escapeHtml(row)}</li>`).join("")}</ul></section>
        <section><h4>Gerçek form hafızası</h4><p>${escapeHtml(formSummary(item.form?.home, item.home))}</p><p>${escapeHtml(formSummary(item.form?.away, item.away))}</p></section>
        <section><h4>İkili rekabet</h4>${h2h.length ? `<ul>${h2h.map((row) => `<li>${escapeHtml(text(row.date, ""))} · ${escapeHtml(text(row.home, ""))} ${escapeHtml(text(row.score, "-"))} ${escapeHtml(text(row.away, ""))}</li>`).join("")}</ul>` : "<p>Doğrulanmış H2H örneği bulunamadı; veri uydurulmadı.</p>"}</section>
        <section><h4>Oran hareketi</h4><ul>${oddsMovement(item).map((row) => `<li>${escapeHtml(row)}</li>`).join("")}</ul></section>
        <section><h4>Eksik / kadro</h4>${item.squad?.available ? `<p><b>${escapeHtml(item.home)}:</b> ${escapeHtml(squadHome.join(", ") || "kayıt yok")}</p><p><b>${escapeHtml(item.away)}:</b> ${escapeHtml(squadAway.join(", ") || "kayıt yok")}</p>` : `<p>${escapeHtml(text(item.squad?.note, "Doğrulanmış eksik/kadro verisi bulunmuyor."))}</p>`}</section>
        <footer><span>Model ${escapeHtml(text(item.model_version, "1-X-2"))}</span><span>Veri kapsama ${escapeHtml(text(item.data_completeness, "—"))}/100</span><span>Güven ${escapeHtml(text(item.confidence, "—"))}/100</span></footer>
      </aside>`;
    drawer.classList.add("is-open");
    drawer.querySelectorAll("[data-st-close]").forEach((button) => button.addEventListener("click", () => drawer.classList.remove("is-open")));
  };

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #spor-toto-performansi{overflow:visible!important}.st-pro-shell{display:grid;gap:16px;margin-top:18px}.st-pro-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:16px;padding:20px;border:1px solid rgba(255,191,46,.24);border-radius:24px;background:radial-gradient(circle at 10% 0%,rgba(57,255,136,.12),transparent 34%),radial-gradient(circle at 90% 0%,rgba(255,191,46,.14),transparent 34%),linear-gradient(180deg,rgba(5,15,33,.98),rgba(3,8,23,.98));box-shadow:0 24px 64px rgba(0,0,0,.28)}.st-pro-hero h3{margin:5px 0;color:#fff7d6;font-size:clamp(27px,3vw,42px)}.st-pro-hero p{margin:0;color:#aebbd0;line-height:1.55}.st-pro-kicker{display:inline-flex;padding:7px 11px;border:1px solid rgba(57,255,136,.3);border-radius:999px;color:#c8ffdd;background:rgba(57,255,136,.08);font-size:11px;font-weight:900;letter-spacing:.06em}.st-pro-note{margin-top:12px!important;padding:10px 12px;border-radius:14px;background:rgba(255,191,46,.07);border:1px solid rgba(255,191,46,.16);font-size:12px!important;color:#ffe6a0!important}.st-pro-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.st-pro-metric{padding:13px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.04)}.st-pro-metric span{display:block;color:#9aecff;font-size:10px;font-weight:900;text-transform:uppercase}.st-pro-metric strong{display:block;margin-top:5px;color:#fff7d6;font-size:22px}.st-table{border:1px solid rgba(255,191,46,.2);border-radius:22px;overflow:hidden;background:linear-gradient(180deg,rgba(5,15,33,.96),rgba(3,8,23,.98));box-shadow:0 20px 50px rgba(0,0,0,.24)}.st-head,.st-row{display:grid;grid-template-columns:46px minmax(240px,1fr) 128px 76px 76px 76px 92px 82px 86px}.st-head{background:linear-gradient(90deg,rgba(255,191,46,.19),rgba(57,255,136,.08),rgba(3,8,23,.96));color:#c8ffdd;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.05em}.st-head>span,.st-row>div{padding:10px;border-right:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);min-width:0}.st-row{background:rgba(255,255,255,.018);align-items:stretch}.st-row:nth-child(odd){background:rgba(255,191,46,.02)}.st-no{display:flex;align-items:center;justify-content:center;color:#39ff88;font-weight:1000}.st-match{display:grid;align-content:center;gap:3px}.st-match small{color:#74839a;font-size:10px}.st-match strong{color:#f8fbff;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.st-match strong span{color:#74839a}.st-match em{color:#ffe08a;font-size:10px;font-style:normal}.st-form{display:grid;align-content:center;gap:5px}.st-form>div{display:flex;gap:3px;align-items:center}.st-form-dot{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:999px;font-size:8px;font-weight:1000;background:rgba(255,255,255,.08);color:#d7e4f5}.st-form-dot.win{background:rgba(57,255,136,.16);color:#8cffb8}.st-form-dot.draw{background:rgba(255,191,46,.16);color:#ffe08a}.st-form-dot.loss{background:rgba(255,84,112,.15);color:#ff9aaa}.st-form-empty{font-size:10px;color:#74839a}.st-pick{display:grid;place-content:center;text-align:center;gap:2px}.st-pick b{font-size:15px;color:#d7e4f5}.st-pick span{font-size:11px;color:#9aecff}.st-pick small{font-size:9px;color:#74839a}.st-pick.is-selected{background:linear-gradient(180deg,rgba(57,255,136,.13),rgba(255,191,46,.07));box-shadow:inset 0 0 0 1px rgba(57,255,136,.24)}.st-pick.is-selected b{color:#8cffb8}.st-confidence{display:grid;place-content:center;text-align:center}.st-confidence b{color:#ffe08a;font-size:15px}.st-confidence span,.st-confidence small{color:#74839a;font-size:9px}.st-risk,.st-action{display:flex;align-items:center;justify-content:center}.st-risk span,.st-mobile-meta>span{padding:6px 8px;border-radius:999px;font-size:10px;font-weight:900}.risk-dusuk{background:rgba(57,255,136,.12);color:#8cffb8}.risk-orta{background:rgba(255,191,46,.13);color:#ffe08a}.risk-yuksek{background:rgba(255,84,112,.13);color:#ff9aaa}.st-action button,.st-mobile-detail{border:1px solid rgba(154,236,255,.24);border-radius:999px;background:rgba(154,236,255,.08);color:#e9fcff;font-size:10px;font-weight:900;padding:8px 10px;cursor:pointer}.st-mobile-list{display:none}.st-empty{padding:28px;border:1px dashed rgba(255,191,46,.25);border-radius:18px;color:#aebbd0;text-align:center}.st-drawer{position:fixed;inset:0;z-index:99999;display:none}.st-drawer.is-open{display:block}.st-drawer-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(3px)}.st-drawer-panel{position:absolute;right:0;top:0;bottom:0;width:min(560px,94vw);overflow:auto;padding:20px;background:linear-gradient(180deg,#071522,#030817);box-shadow:-30px 0 70px rgba(0,0,0,.45);color:#dce8f7}.st-drawer-panel>header{display:flex;justify-content:space-between;gap:15px;align-items:flex-start;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.09)}.st-drawer-panel header h3{margin:4px 0;color:#fff7d6}.st-drawer-panel header p,.st-drawer-panel header small{margin:0;color:#9eacc0}.st-drawer-panel header button{border:0;background:rgba(255,255,255,.08);color:white;width:36px;height:36px;border-radius:999px;font-size:24px;cursor:pointer}.st-drawer-panel section{padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08)}.st-drawer-panel h4{margin:0 0 9px;color:#ffe08a}.st-drawer-panel p,.st-drawer-panel li{color:#b7c5d8;font-size:12px;line-height:1.55}.st-drawer-probs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.st-drawer-probs>div{display:grid;gap:3px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.035)}.st-drawer-probs>div.is-selected{border-color:rgba(57,255,136,.35);background:rgba(57,255,136,.08)}.st-drawer-probs b{color:#9aecff}.st-drawer-probs strong{color:#fff7d6;font-size:19px}.st-drawer-probs span{color:#74839a;font-size:10px}.st-drawer-panel footer{display:flex;flex-wrap:wrap;gap:7px;padding-top:14px}.st-drawer-panel footer span{padding:7px 9px;border-radius:999px;background:rgba(255,255,255,.05);color:#9aecff;font-size:10px}.st-mobile-card{display:grid;gap:12px;padding:14px;border:1px solid rgba(255,191,46,.17);border-radius:18px;background:linear-gradient(180deg,rgba(5,15,33,.96),rgba(3,8,23,.98))}.st-mobile-card header{display:grid;grid-template-columns:32px 1fr;gap:9px}.st-mobile-card header>span{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9px;background:rgba(57,255,136,.1);color:#8cffb8;font-weight:1000}.st-mobile-card header div{display:grid;gap:2px}.st-mobile-card header small,.st-mobile-card header em{color:#74839a;font-size:10px;font-style:normal}.st-mobile-card header strong{color:#f8fbff;font-size:13px}.st-mobile-picks{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.st-mobile-picks>div{display:grid;gap:2px;text-align:center;padding:10px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.03)}.st-mobile-picks>div.is-selected{border-color:rgba(57,255,136,.34);background:rgba(57,255,136,.08)}.st-mobile-picks b{color:#d7e4f5}.st-mobile-picks span{color:#9aecff;font-size:12px}.st-mobile-picks small{color:#74839a;font-size:9px}.st-mobile-meta{display:flex;flex-wrap:wrap;gap:6px}.st-mobile-meta>span{background:rgba(255,255,255,.05);color:#aebbd0}.st-mobile-meta b{color:#ffe08a}.st-mobile-form{display:grid;gap:5px;color:#74839a;font-size:10px}.st-mobile-form>span{display:flex;align-items:center;gap:4px}.st-mobile-detail{width:100%;min-height:38px}.st-source{display:flex;flex-wrap:wrap;gap:7px}.st-source span{padding:7px 9px;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:rgba(255,255,255,.035);color:#9aecff;font-size:10px;font-weight:800}
      @media(max-width:1100px){.st-pro-hero{grid-template-columns:1fr}.st-table{overflow-x:auto}.st-head,.st-row{min-width:1030px}}
      @media(max-width:820px){.st-table{display:none}.st-mobile-list{display:grid;gap:10px}.st-pro-shell{gap:12px}.st-pro-hero{padding:15px;border-radius:19px}.st-pro-metrics{grid-template-columns:repeat(2,1fr)}.st-pro-metric strong{font-size:19px}.st-pro-hero h3{font-size:27px}}
      @media(max-width:480px){.st-pro-metrics{grid-template-columns:1fr 1fr}.st-pro-metric{padding:10px}.st-pro-note{font-size:11px!important}.st-drawer-panel{width:100vw}.st-drawer-probs{gap:5px}.st-drawer-probs>div{padding:9px}}
    `;
    document.head.appendChild(style);
  };

  const bind = (root, matches) => {
    root.querySelectorAll("[data-st-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.stDetail);
        if (Number.isInteger(index) && matches[index]) openDrawer(matches[index]);
      });
    });
  };

  const render = (payload) => {
    const section = document.querySelector("#spor-toto-performansi");
    const grid = document.querySelector("#spor-toto-grid");
    const summary = document.querySelector("#spor-toto-summary");
    if (!section || !grid) return;
    injectStyle();
    grid.classList.remove("spor-grid");
    grid.classList.add("spor-toto-pro-ready");
    grid.style.display = "block";
    grid.style.width = "100%";
    grid.style.maxWidth = "100%";
    if (summary) { summary.innerHTML = ""; summary.style.display = "none"; }

    const heading = section.querySelector(".section-heading");
    if (heading) {
      const eyebrow = heading.querySelector(".eyebrow");
      const title = heading.querySelector("h2");
      const paragraph = heading.querySelector("p:not(.eyebrow)");
      if (eyebrow) eyebrow.textContent = "Spor Toto · PRO 1-X-2";
      if (title) title.textContent = "15 maçlık 1-X-2 karar merkezi";
      if (paragraph) paragraph.textContent = "PRO 13, güncel 1-X-2 oranları ve doğrulanmış sonuç hafızası birlikte kullanılır. Eksik veri uydurulmaz.";
    }

    const matches = Array.isArray(payload?.matches) ? payload.matches : [];
    const coupon = payload?.coupon || {};
    const bankoCount = matches.filter((item) => String(item.classification || "").includes("Banko")).length;
    const doubleCount = number(coupon.double_count) ?? matches.filter((item) => (item.selected_options || []).length === 2).length;
    const totalColumns = number(coupon.total_columns) ?? matches.reduce((total, item) => total * Math.max(1, number(item.column_multiplier) || 1), matches.length ? 1 : 0);
    const avgConfidence = number(coupon.average_confidence) ?? (matches.length ? Math.round(matches.reduce((sum, item) => sum + (number(item.confidence) || 0), 0) / matches.length) : 0);
    const generated = payload?.generated_at ? new Date(payload.generated_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }) : "—";

    grid.innerHTML = `
      <div class="st-pro-shell">
        <section class="st-pro-hero">
          <div>
            <span class="st-pro-kicker">🏆 Futbol Laboratuvarı Spor Toto PRO</span>
            <h3>1-X-2 kupon karar ekranı</h3>
            <p>Her maçta model olasılığı, güncel oran, güven, risk ve gerçek sonuç hafızası birlikte okunur. Çifte şanslar belirsizliği azaltmak için otomatik seçilir.</p>
            <p class="st-pro-note">${escapeHtml(text(payload?.bulletin_note, "Bu alan Futbol Laboratuvarı analiz çalışma listesidir."))}</p>
            <div class="st-source"><span>${escapeHtml(text(payload?.engine_version, "1-X-2"))}</span><span>${escapeHtml(text(payload?.source, "Veri kaynağı"))}</span><span>Güncelleme ${escapeHtml(generated)}</span></div>
          </div>
          <div class="st-pro-metrics">
            <div class="st-pro-metric"><span>Maç</span><strong>${matches.length}</strong></div>
            <div class="st-pro-metric"><span>Toplam Kolon</span><strong>${totalColumns || 0}</strong></div>
            <div class="st-pro-metric"><span>Banko Adayı</span><strong>${bankoCount}</strong></div>
            <div class="st-pro-metric"><span>Çifte Şans</span><strong>${doubleCount}</strong></div>
            <div class="st-pro-metric"><span>Ort. Güven</span><strong>${avgConfidence || "—"}/100</strong></div>
            <div class="st-pro-metric"><span>Veri Kapsama</span><strong>${escapeHtml(text(coupon.average_data_completeness, "—"))}/100</strong></div>
          </div>
        </section>
        ${matches.length ? `
        <div class="st-table">
          <div class="st-head"><span>No</span><span>Maç</span><span>Gerçek Form</span><span>1</span><span>X</span><span>2</span><span>Güven</span><span>Risk</span><span>Detay</span></div>
          <div>${matches.map(tableRow).join("")}</div>
        </div>
        <div class="st-mobile-list">${matches.map(mobileCard).join("")}</div>` : `<div class="st-empty">Güncel, tam 1-X-2 oranlı uygun maç bekleniyor. Boş veri yerine uydurma maç gösterilmez.</div>`}
      </div>`;
    bind(grid, matches);
  };

  const showError = (message) => {
    const grid = document.querySelector("#spor-toto-grid");
    if (!grid) return;
    injectStyle();
    grid.classList.remove("spor-grid");
    grid.innerHTML = `<div class="st-empty"><strong>Spor Toto verisi yüklenemedi.</strong><br>${escapeHtml(message)}<br>Sayfayı yenileyerek tekrar deneyebilirsin.</div>`;
  };

  const run = async () => {
    try { render(await readJson()); }
    catch (error) { showError(error?.message || "Bilinmeyen veri hatası"); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
  window.setTimeout(run, 2500);
})();
