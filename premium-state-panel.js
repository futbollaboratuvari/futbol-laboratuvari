(() => {
  const COUNT_KEY = "fl_premium_count";
  const HISTORY_KEY = "fl_premium_robot_queue";
  const LAST_KEY = "fl_last_premium_robot_analysis";
  const PLAN_KEY = "fl_selected_membership_plan";
  const PLAN_COUNT_KEY = "fl_premium_count_plan";
  const MEMBER_KEY = "fl_premium_membership";

  const safe = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const readJson = (key, fallback) => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "");
      return data || fallback;
    } catch {
      return fallback;
    }
  };

  const accessLevel = () => String(localStorage.getItem("fl_premium_access_level") || "");
  const isFounder = () => accessLevel() === "founder";
  const isTrial = () => accessLevel() === "trial";
  const selectedPlan = () => readJson(PLAN_KEY, null);
  const member = () => readJson(MEMBER_KEY, {});
  const lastAnalysis = () => readJson(LAST_KEY, null);
  const history = () => {
    const data = readJson(HISTORY_KEY, []);
    return Array.isArray(data) ? data.slice(0, 6) : [];
  };

  const planLimit = () => {
    const id = String(selectedPlan()?.id || "");
    if (id === "starter") return 10;
    if (id === "pro") return 40;
    if (id === "vip") return 120;
    return 20;
  };

  const activePlanId = () => String(selectedPlan()?.id || "preview");
  const syncCountWithPlan = () => {
    if (isFounder()) return "Sınırsız";
    if (isTrial()) return member()?.remainingAnalysisCount ?? planLimit();
    const id = activePlanId();
    if (localStorage.getItem(PLAN_COUNT_KEY) !== id) {
      localStorage.setItem(PLAN_COUNT_KEY, id);
      localStorage.setItem(COUNT_KEY, String(planLimit()));
    }
    return Number(localStorage.getItem(COUNT_KEY) || planLimit());
  };

  const packageName = () => {
    if (isFounder()) return "Kurucu Beta";
    if (isTrial() && member()?.planName) return member().planName;
    const plan = selectedPlan();
    return plan?.name ? `${plan.name} Ön İzleme` : "Ön İzleme";
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

  const premiumComment = (analysis) => {
    if (!analysis) return "Maç ve seçenek seçildiğinde robot premium analiz özetini burada oluşturur.";
    return "Robot seçilen seçenek için oran, maç bilgisi ve güven dengesini birlikte değerlendirir.";
  };

  const style = () => {
    if (document.getElementById("premium-state-style")) return;
    const styleTag = document.createElement("style");
    styleTag.id = "premium-state-style";
    styleTag.textContent = `
      .premium-state-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 14px}
      .premium-state-card{padding:12px;border:1px solid rgba(57,255,136,.18);border-radius:16px;background:rgba(57,255,136,.06)}
      .premium-state-card span{display:block;color:#8fa0b5;font-size:11px;font-weight:900;text-transform:uppercase}
      .premium-state-card strong{display:block;margin-top:5px;color:#f8fbff;font-size:18px}
      .premium-value-card,.premium-teaser,.premium-plan-box,.premium-paywall,.premium-history-mini{margin:0 0 12px;padding:14px;border:1px solid rgba(255,159,28,.26);border-radius:18px;background:linear-gradient(135deg,rgba(255,159,28,.12),rgba(57,255,136,.06))}
      .premium-value-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.premium-value-top h4,.premium-teaser h4,.premium-plan-box h4,.premium-paywall h4,.premium-history-mini h4{margin:0;color:#ffe08a}
      .premium-risk{padding:6px 9px;border-radius:999px;font-size:11px;font-weight:950;background:rgba(255,224,138,.14);color:#ffe08a}
      .premium-score{margin-top:12px}.premium-score-line{height:9px;border-radius:999px;background:rgba(255,255,255,.10);overflow:hidden}.premium-score-line i{display:block;height:100%;background:linear-gradient(90deg,#39ff88,#ff9f1c)}
      .premium-score-meta{display:flex;justify-content:space-between;margin-top:6px;color:#aebbd0;font-size:12px}.premium-comment,.premium-teaser p,.premium-paywall p{margin:12px 0 0;color:#d7e4f5;font-size:13px;line-height:1.55}
      .premium-feature-list{display:grid;gap:7px;margin-top:10px}.premium-feature-list span,.premium-history-mini div{padding:8px 10px;border-radius:11px;background:rgba(0,0,0,.18);color:#d7e4f5;font-size:12px;margin-top:6px}
      .premium-plan-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}.premium-plan{padding:10px;border:1px solid rgba(255,255,255,.10);border-radius:13px;background:rgba(255,255,255,.04)}.premium-plan strong{display:block;color:#f8fbff}.premium-plan small{display:block;color:#8fa0b5;margin-top:4px}.premium-plan.selected{border-color:rgba(57,255,136,.45);background:rgba(57,255,136,.10)}
      .premium-cta-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.premium-cta{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 13px;border-radius:12px;text-decoration:none;font-weight:950;font-size:12px}.premium-cta.primary{background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c}.premium-cta.secondary{border:1px solid rgba(255,255,255,.14);color:#f8fbff;background:rgba(255,255,255,.05)}
      @media(max-width:900px){.premium-plan-grid,.premium-state-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(styleTag);
  };

  const stateGrid = () => `<div class="premium-state-grid"><div class="premium-state-card"><span>Paket</span><strong>${safe(packageName())}</strong></div><div class="premium-state-card"><span>Kalan Kullanım</span><strong>${isFounder() ? "Sınırsız" : syncCountWithPlan()}</strong></div><div class="premium-state-card"><span>Robot</span><strong>Premium</strong></div></div>`;

  const teaserBox = () => `<div class="premium-teaser"><h4>Bu alanda kullanıcı ne alır?</h4><p>Maç arama, seçenek seçimi, robot güven puanı, risk seviyesi ve özel yorum tek panelde hazırlanır.</p><div class="premium-feature-list"><span>🎯 Takım adına göre hızlı maç bulma</span><span>🧠 Seçilen seçeneğe özel robot yorumu</span><span>📊 Güven puanı ve risk etiketi</span><span>🗂️ Son analiz geçmişi</span></div></div>`;

  const paywallBox = () => {
    const plan = selectedPlan();
    if (isFounder()) return "";
    const selectedText = plan?.name ? `<p>Seçili üyelik paketi: <strong>${safe(plan.name)}</strong></p>` : "";
    return `<div class="premium-paywall"><h4>Ön izleme modu</h4><p>Tam robot analizi, güven puanı ve özel notlar erişim açılınca görünür.</p>${selectedText}<div class="premium-cta-row"><a class="premium-cta primary" href="#membership-payment-panel">Üyelik alanına git</a><a class="premium-cta secondary" href="#premium-analysis-panel">Kod ile aç</a></div></div>`;
  };

  const planBox = () => {
    const name = String(selectedPlan()?.name || "");
    return `<div class="premium-plan-box"><h4>Üyelik paketleri</h4><div class="premium-plan-grid"><div class="premium-plan ${name.includes("Gold") ? "selected" : ""}"><strong>Gold</strong><small>10 özel analiz hakkı</small></div><div class="premium-plan ${name.includes("Diamond") ? "selected" : ""}"><strong>Diamond</strong><small>40 özel analiz hakkı</small></div><div class="premium-plan ${name.includes("Premium") ? "selected" : ""}"><strong>Premium</strong><small>120 özel analiz hakkı</small></div></div></div>`;
  };

  const valueCard = (analysis) => {
    const value = score(analysis);
    return `<div class="premium-value-card"><div class="premium-value-top"><h4>${analysis ? safe(analysis.grade || "Robot") : "Premium sonuç hazır bekliyor"}</h4><span class="premium-risk">${analysis ? "Değerlendirildi" : "Bekliyor"}</span></div><div class="premium-score"><div class="premium-score-line"><i style="width:${value}%"></i></div><div class="premium-score-meta"><span>Robot güven puanı</span><strong>%${value}</strong></div></div><p class="premium-comment">${safe(premiumComment(analysis))}</p></div>`;
  };

  const historyBox = () => {
    const list = history();
    return `<div class="premium-history-mini"><h4>Son Analizler</h4>${list.length ? list.map((item) => `<div><b>${safe(item?.match?.home)} - ${safe(item?.match?.away)}</b><br>${safe(item?.market)} ${item?.percent ? `· %${item.percent}` : ""}</div>`).join("") : `<div>Henüz analiz yok.</div>`}</div>`;
  };

  const render = () => {
    style();
    const shell = document.getElementById("premium-analysis-panel");
    if (!shell) return;
    const head = shell.querySelector(".premium-head");
    if (head && !shell.querySelector(".premium-state-grid")) head.insertAdjacentHTML("afterend", stateGrid());
    const stateCards = shell.querySelectorAll(".premium-state-card strong");
    if (stateCards[0]) stateCards[0].textContent = packageName();
    if (stateCards[1]) stateCards[1].textContent = isFounder() ? "Sınırsız" : String(syncCountWithPlan());
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

  document.addEventListener("click", (event) => {
    if (event.target.closest?.("#membership-payment-panel [data-plan]")) setTimeout(render, 160);
    if (!event.target.closest?.("#premium-analysis-panel [data-premium-analyze]")) return;
    const before = localStorage.getItem(LAST_KEY) || "";
    setTimeout(() => {
      const after = localStorage.getItem(LAST_KEY) || "";
      if (!isFounder() && after && after !== before) localStorage.setItem(COUNT_KEY, String(Math.max(0, Number(syncCountWithPlan()) - 1)));
      render();
    }, 900);
  });

  window.addEventListener("storage", render);
  window.addEventListener("load", () => {
    setTimeout(render, 1100);
    setInterval(render, 3000);
  });
})();
