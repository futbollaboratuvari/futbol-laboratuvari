(() => {
  const COUNT_KEY = "fl_premium_count";
  const HISTORY_KEY = "fl_premium_robot_queue";
  const LAST_KEY = "fl_last_premium_robot_analysis";
  const PLAN_KEY = "fl_selected_membership_plan";
  const PLAN_COUNT_KEY = "fl_premium_count_plan";

  const safe = (v) => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");

  const isFounder = () => localStorage.getItem("fl_premium_beta_access") === "1";

  const count = () => {
    if (isFounder()) return "Sınırsız";
    const n = Number(localStorage.getItem(COUNT_KEY));
    if (Number.isFinite(n)) return n;
    localStorage.setItem(COUNT_KEY, "20");
    return 20;
  };

  const readJson = (key, fallback) => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "");
      return data || fallback;
    } catch {
      return fallback;
    }
  };

  const history = () => {
    const data = readJson(HISTORY_KEY, []);
    return Array.isArray(data) ? data.slice(0, 6) : [];
  };

  const lastAnalysis = () => readJson(LAST_KEY, null);
  const selectedPlan = () => readJson(PLAN_KEY, null);
  const unlocked = () => isFounder();
  const packageName = () => {
    if (isFounder()) return "Kurucu Beta";
    const plan = selectedPlan();
    return plan?.name ? `${plan.name} Ön İzleme` : "Ön İzleme";
  };

  const planLimit = () => {
    const id = String(selectedPlan()?.id || "");
    if (id === "starter") return 10;
    if (id === "pro") return 40;
    if (id === "vip") return 120;
    return 20;
  };

  const activePlanId = () => String(selectedPlan()?.id || "beta");
  const syncCountWithPlan = () => {
    if (isFounder()) return "Sınırsız";
    const id = activePlanId();
    if (localStorage.getItem(PLAN_COUNT_KEY) !== id) {
      localStorage.setItem(PLAN_COUNT_KEY, id);
      localStorage.setItem(COUNT_KEY, String(planLimit()));
    }
    return count();
  };

  const score = (analysis) => {
    const percent = Number(analysis?.percent || 0);
    if (percent > 0) return Math.max(1, Math.min(99, percent));
    const grade = String(analysis?.grade || "").toLowerCase();
    if (grade.includes("güç")) return 68;
    if (grade.includes("orta")) return 57;
    if (grade.includes("risk")) return 45;
    return 50;
  };

  const risk = (analysis) => {
    const market = String(analysis?.market || "");
    const s = score(analysis);
    if (market.includes("İY/MS")) return { text: "Yüksek Risk", cls: "risk" };
    if (market.includes("1Y/2Y")) return { text: "Orta-Yüksek", cls: "warn" };
    if (s >= 64) return { text: "Dengeli", cls: "ok" };
    if (s >= 55) return { text: "Kontrollü", cls: "warn" };
    return { text: "Riskli", cls: "risk" };
  };

  const premiumComment = (analysis) => {
    if (!analysis) return "Maç ve seçenek seçildiğinde robot premium analiz özetini burada oluşturur.";
    const market = String(analysis.market || "");
    if (market.includes("İY/MS")) return "Bu seçim ilk yarı ile maç sonu senaryosunu birlikte okur. Oran yüksek olsa da yön değişimi riski fazladır; tek başına banko kabul edilmemelidir.";
    if (market.includes("1Y/2Y KG")) return "Bu seçim iki devrede gol davranışını birlikte ölçer. Robot iki zaman dilimindeki tempo ve gol ihtimalini ayrı değerlendirir.";
    if (market.includes("KG %")) return "Bu yüzde, KG tarafındaki olasılığı okunur hale getirir. Değer yükseldikçe sinyal güçlenir; yine de canlı kadro ve oran değişimi takip edilmelidir.";
    if (market.includes("KG")) return "KG marketinde iki takımın skor üretme ve gol yeme alışkanlığı birlikte okunur. Robot form ve oran işaretini beraber değerlendirir.";
    return "Robot seçilen seçenek için oran, arşiv ve maç bilgilerini birleştirerek ön analiz sonucu oluşturdu.";
  };

  const style = () => {
    if (document.getElementById("premium-state-style")) return;
    const s = document.createElement("style");
    s.id = "premium-state-style";
    s.textContent = `.premium-state-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 14px}.premium-state-card{padding:12px;border:1px solid rgba(57,255,136,.18);border-radius:16px;background:rgba(57,255,136,.06)}.premium-state-card span{display:block;color:#8fa0b5;font-size:11px;font-weight:900;text-transform:uppercase}.premium-state-card strong{display:block;margin-top:5px;color:#f8fbff;font-size:18px}.premium-value-card,.premium-teaser,.premium-plan-box,.premium-paywall{margin:0 0 12px;padding:14px;border:1px solid rgba(255,159,28,.26);border-radius:18px;background:linear-gradient(135deg,rgba(255,159,28,.12),rgba(57,255,136,.06))}.premium-value-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.premium-value-top h4,.premium-teaser h4,.premium-plan-box h4,.premium-paywall h4{margin:0;color:#ffe08a}.premium-risk{padding:6px 9px;border-radius:999px;font-size:11px;font-weight:950}.premium-risk.ok{background:rgba(57,255,136,.15);color:#c8ffdd}.premium-risk.warn{background:rgba(255,224,138,.14);color:#ffe08a}.premium-risk.risk{background:rgba(255,79,79,.14);color:#ffb3b3}.premium-score{margin-top:12px}.premium-score-line{height:9px;border-radius:999px;background:rgba(255,255,255,.10);overflow:hidden}.premium-score-line i{display:block;height:100%;background:linear-gradient(90deg,#39ff88,#ff9f1c)}.premium-score-meta{display:flex;justify-content:space-between;margin-top:6px;color:#aebbd0;font-size:12px}.premium-comment,.premium-teaser p,.premium-paywall p{margin:12px 0 0;color:#d7e4f5;font-size:13px;line-height:1.55}.premium-feature-list{display:grid;gap:7px;margin-top:10px}.premium-feature-list span{padding:8px 10px;border-radius:11px;background:rgba(0,0,0,.18);color:#d7e4f5;font-size:12px}.premium-plan-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}.premium-plan{padding:10px;border:1px solid rgba(255,255,255,.10);border-radius:13px;background:rgba(255,255,255,.04)}.premium-plan strong{display:block;color:#f8fbff}.premium-plan small{display:block;color:#8fa0b5;margin-top:4px}.premium-plan.selected{border-color:rgba(57,255,136,.45);background:rgba(57,255,136,.10)}.premium-preview-blur{position:relative;margin-top:10px;padding:11px;border-radius:14px;background:rgba(0,0,0,.20);border:1px solid rgba(255,255,255,.08);overflow:hidden}.premium-preview-blur .blurred{filter:blur(3px);opacity:.62;user-select:none}.premium-preview-lock{position:absolute;inset:auto 12px 12px 12px;padding:9px;border-radius:12px;background:rgba(3,8,23,.86);border:1px solid rgba(255,159,28,.24);color:#ffe08a;font-size:12px;font-weight:950;text-align:center}.premium-cta-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.premium-cta{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 13px;border-radius:12px;text-decoration:none;font-weight:950;font-size:12px}.premium-cta.primary{background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c}.premium-cta.secondary{border:1px solid rgba(255,255,255,.14);color:#f8fbff;background:rgba(255,255,255,.05)}.premium-history-mini{margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(0,0,0,.16)}.premium-history-mini h4{margin:0 0 8px;color:#ffe08a;font-size:13px}.premium-history-mini div{padding:8px;border-radius:10px;background:rgba(255,255,255,.035);color:#d7e4f5;font-size:12px;margin-top:6px}@media(max-width:900px){.premium-plan-grid{grid-template-columns:1fr}}@media(max-width:760px){.premium-state-grid{grid-template-columns:1fr}.premium-value-top{display:grid}}`;
    document.head.appendChild(s);
  };

  const stateGrid = () => `<div class="premium-state-grid"><div class="premium-state-card"><span>Paket</span><strong>${safe(packageName())}</strong></div><div class="premium-state-card"><span>Kalan Kullanım</span><strong>${unlocked() ? syncCountWithPlan() : "Kilitli"}</strong></div><div class="premium-state-card"><span>Robot</span><strong>Premium</strong></div></div>`;

  const teaserBox = () => `<div class="premium-teaser"><h4>Bu alanda kullanıcı ne alır?</h4><p>Maç arama, seçenek seçimi, robot güven puanı, risk seviyesi, oran/olasılık ve premium yorum tek panelde hazırlanır.</p><div class="premium-feature-list"><span>🎯 Takım adına göre hızlı maç bulma</span><span>🧠 Seçilen seçeneğe özel robot yorumu</span><span>📊 Güven puanı ve risk etiketi</span><span>🗂️ Son analiz geçmişi</span></div></div>`;

  const paywallBox = () => {
    const plan = selectedPlan();
    const selectedText = plan?.name ? `<p>Seçili üyelik paketi: <strong>${safe(plan.name)}</strong></p>` : "";
    return unlocked() ? "" : `<div class="premium-paywall"><h4>Ön izleme modu</h4><p>Tam robot analizi, güven puanı, oran yorumu ve özel notlar erişim açılınca görünür.</p>${selectedText}<div class="premium-preview-blur"><div class="blurred"><div class="premium-score"><div class="premium-score-line"><i style="width:72%"></i></div><div class="premium-score-meta"><span>Robot güven puanı</span><strong>%72</strong></div></div><p class="premium-comment">Seçilen maçta tempo, KG ihtimali ve oran dengesi premium robot tarafından karşılaştırıldı.</p></div><div class="premium-preview-lock">🔒 Tam analiz kilitli</div></div><div class="premium-cta-row"><a class="premium-cta primary" href="#membership-payment-panel">Üyelik alanına git</a><a class="premium-cta secondary" href="#premium-analysis-panel">Kod ile aç</a></div></div>`;
  };

  const planBox = () => {
    const plan = selectedPlan();
    const name = String(plan?.name || "");
    return `<div class="premium-plan-box"><h4>Üyelik paketleri</h4><div class="premium-plan-grid"><div class="premium-plan ${name.includes("Gold") ? "selected" : ""}"><strong>Gold</strong><small>10 özel analiz hakkı</small></div><div class="premium-plan ${name.includes("Diamond") ? "selected" : ""}"><strong>Diamond</strong><small>40 özel analiz hakkı</small></div><div class="premium-plan ${name.includes("Premium") ? "selected" : ""}"><strong>Premium</strong><small>120 özel analiz hakkı</small></div></div></div>`;
  };

  const valueCard = (analysis) => {
    if (!analysis) return `<div class="premium-value-card"><div class="premium-value-top"><h4>Premium sonuç hazır bekliyor</h4><span class="premium-risk warn">Bekliyor</span></div><p class="premium-comment">${premiumComment(null)}</p></div>`;
    const r = risk(analysis);
    const s = score(analysis);
    return `<div class="premium-value-card"><div class="premium-value-top"><h4>${safe(analysis.grade || "Robot")} sinyal</h4><span class="premium-risk ${r.cls}">${r.text}</span></div><div class="premium-score"><div class="premium-score-line"><i style="width:${s}%"></i></div><div class="premium-score-meta"><span>Robot güven puanı</span><strong>%${s}</strong></div></div><p class="premium-comment">${safe(premiumComment(analysis))}</p></div>`;
  };

  const historyBox = () => {
    const list = history();
    return `<div class="premium-history-mini"><h4>Son Analizler</h4>${list.length ? list.map((x) => `<div><b>${safe(x?.match?.home)} - ${safe(x?.match?.away)}</b><br>${safe(x?.market)} ${x?.percent ? `· %${x.percent}` : ""}</div>`).join("") : `<div>Henüz analiz yok.</div>`}</div>`;
  };

  const render = () => {
    style();
    const shell = document.getElementById("premium-analysis-panel");
    if (!shell) return;
    const head = shell.querySelector(".premium-head");
    if (head && !shell.querySelector(".premium-state-grid")) head.insertAdjacentHTML("afterend", stateGrid());
    const stateCards = shell.querySelectorAll(".premium-state-card strong");
    if (stateCards[0]) stateCards[0].textContent = packageName();
    if (stateCards[1]) stateCards[1].textContent = unlocked() ? String(syncCountWithPlan()) : "Kilitli";
    const out = shell.querySelector("[data-premium-output]");
    if (!out) return;
    out.querySelector(".premium-value-card")?.remove();
    out.querySelector(".premium-paywall")?.remove();
    out.querySelector(".premium-teaser")?.remove();
    out.querySelector(".premium-plan-box")?.remove();
    out.querySelector(".premium-history-mini")?.remove();
    out.insertAdjacentHTML("afterbegin", valueCard(lastAnalysis()));
    out.insertAdjacentHTML("beforeend", paywallBox());
    out.insertAdjacentHTML("beforeend", teaserBox());
    out.insertAdjacentHTML("beforeend", planBox());
    out.insertAdjacentHTML("beforeend", historyBox());
  };

  document.addEventListener("click", (e) => {
    if (!e.target.closest?.("#premium-analysis-panel [data-premium-analyze]")) return;
    const before = localStorage.getItem(LAST_KEY) || "";
    setTimeout(() => {
      const after = localStorage.getItem(LAST_KEY) || "";
      if (!isFounder() && after && after !== before) localStorage.setItem(COUNT_KEY, String(Math.max(0, Number(count()) - 1)));
      render();
    }, 900);
  });

  window.addEventListener("storage", render);
  window.addEventListener("load", () => {
    setTimeout(render, 1100);
    setInterval(render, 3000);
  });
})();
