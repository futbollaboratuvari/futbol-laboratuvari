(() => {
  const ROBOT_URL = "./data/robot-analysis.json";
  const MEMORY_URL = "./data/learning-memory.json";
  const PANEL_ID = "learning-memory-panel";
  let refreshing = false;

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const clean = (value) => String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(`${url}?ts=${Date.now()}`, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const injectStyle = () => {
    if (document.getElementById("learning-visibility-style")) return;
    const style = document.createElement("style");
    style.id = "learning-visibility-style";
    style.textContent = `
      #learning-memory-panel{margin:22px clamp(18px,6vw,90px);padding:16px;border:1px solid rgba(57,255,136,.22);border-radius:22px;background:linear-gradient(180deg,rgba(3,17,37,.94),rgba(2,7,18,.97));box-shadow:0 24px 70px rgba(0,0,0,.34)}
      .fl-learning-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.fl-learning-title{margin:0;color:#c8ffdd;font-size:clamp(20px,2.2vw,30px)}.fl-learning-sub{margin:6px 0 0;color:#aebbd0;font-size:12px;line-height:1.55}.fl-learning-badge{padding:8px 11px;border:1px solid rgba(255,159,28,.28);border-radius:999px;background:rgba(255,159,28,.09);color:#ffe08a;font-size:12px;font-weight:950;white-space:nowrap}.fl-learning-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.fl-learning-stat{padding:11px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.045)}.fl-learning-stat span{display:block;color:#8fa0b5;font-size:10px;text-transform:uppercase;font-weight:950}.fl-learning-stat strong{display:block;margin-top:5px;color:#f8fbff;font-size:18px}.fl-learning-list{display:grid;gap:7px;margin-top:12px}.fl-learning-row{padding:9px 10px;border-radius:13px;background:rgba(255,255,255,.045);color:#d7e4f5;font-size:12px}.fl-learning-row b{color:#fff7d6}.fl-learning-note{display:grid;gap:5px;margin-top:8px;padding:9px;border:1px solid rgba(57,255,136,.22);border-radius:12px;background:rgba(57,255,136,.07);color:#c8ffdd;font-size:11px;font-weight:850}.fl-learning-note small{color:#aebbd0;font-weight:750;line-height:1.45}.fl-learning-inline{display:inline-flex;align-items:center;gap:5px;margin-left:6px;padding:3px 7px;border-radius:999px;border:1px solid rgba(57,255,136,.28);background:rgba(57,255,136,.08);color:#c8ffdd;font-size:10px;font-weight:950}@media(max-width:800px){.fl-learning-head{display:grid}.fl-learning-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:480px){.fl-learning-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  };

  const matchName = (item) => String(item.match_name || item.match || `${item.home || ""} - ${item.away || ""}`).replace(/\s+VS\s+/i, " - ").trim();

  const buildRobotMap = (robot) => {
    const map = new Map();
    for (const item of robot.matches || []) {
      const key = clean(matchName(item));
      if (key) map.set(key, item);
    }
    return map;
  };

  const findMatchInText = (text, map) => {
    const key = clean(text);
    if (!key) return null;
    for (const [matchKey, item] of map.entries()) {
      if (key.includes(matchKey) || matchKey.includes(key)) return item;
      const parts = matchKey.split(" ").filter((p) => p.length > 2);
      const hitCount = parts.filter((part) => key.includes(part)).length;
      if (parts.length >= 4 && hitCount >= Math.min(4, parts.length - 1)) return item;
    }
    return null;
  };

  const learningText = (item) => {
    const adj = item?.learning_adjustment;
    if (!adj) return { title: "Öğrenme Hafızası", detail: "Bu maç için hafıza bilgisi henüz oluşmadı.", applied: false };
    if (!adj.applied) return { title: "Öğrenme Hafızası Nötr", detail: (adj.notes || ["Yeterli geçmiş sonuç oluşmadı."])[0], applied: false };
    const sign = Number(adj.delta || 0) >= 0 ? "+" : "";
    return { title: `Öğrenme Etkisi ${sign}${adj.delta}`, detail: `Ağırlık ${adj.weight}. ${(adj.notes || []).slice(0, 2).join(" | ")}`, applied: true };
  };

  const topMemoryRows = (memory) => {
    const rows = Object.entries(memory.market_memory || {})
      .filter(([, stat]) => Number(stat.won || 0) + Number(stat.lost || 0) >= 1)
      .sort((a, b) => Number(b[1].success_rate || 0) - Number(a[1].success_rate || 0))
      .slice(0, 5);
    if (!rows.length) return `<div class="fl-learning-row">Hafıza sonuç bekliyor; yeterli tamamlanan maç oluşunca başarı oranları burada görünecek.</div>`;
    return rows.map(([name, stat]) => {
      const rate = stat.success_rate === null || stat.success_rate === undefined ? "bekleniyor" : `%${Math.round(Number(stat.success_rate) * 100)}`;
      return `<div class="fl-learning-row"><b>${esc(name)}</b> · toplam ${esc(stat.total)} · bekleyen ${esc(stat.pending)} · başarı ${esc(rate)} · ağırlık ${esc(stat.weight)}</div>`;
    }).join("");
  };

  const renderPanel = (robot, memory) => {
    injectStyle();
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement("section");
      panel.id = PANEL_ID;
      const anchor = document.getElementById("premium-analysis-panel") || document.getElementById("daily-matches-widget") || document.querySelector("main");
      if (anchor?.parentNode && anchor.id !== "main") anchor.parentNode.insertBefore(panel, anchor);
      else (document.querySelector("main") || document.body).appendChild(panel);
    }

    const summary = memory.summary || {};
    const robotSummary = robot.summary || {};
    panel.innerHTML = `
      <div class="fl-learning-head"><div><h2 class="fl-learning-title">Öğrenme Hafızası</h2><p class="fl-learning-sub">Sistem tahminleri, sonuçları ve seçenek başarılarını takip eder. Yeterli sonuç oluşunca güven puanına kontrollü etki eder.</p></div><div class="fl-learning-badge">${esc(memory.status || "hazırlanıyor")}</div></div>
      <div class="fl-learning-grid">
        <div class="fl-learning-stat"><span>Toplam Tahmin</span><strong>${esc(summary.total_predictions ?? 0)}</strong></div>
        <div class="fl-learning-stat"><span>Bekleyen</span><strong>${esc(summary.pending_predictions ?? 0)}</strong></div>
        <div class="fl-learning-stat"><span>Kazanan</span><strong>${esc(summary.won_predictions ?? 0)}</strong></div>
        <div class="fl-learning-stat"><span>Bu Çıktıda Etki</span><strong>${esc(robotSummary.learning_adjusted_count ?? 0)}</strong></div>
      </div>
      <div class="fl-learning-list">${topMemoryRows(memory)}</div>
    `;
  };

  const decoratePremiumCards = (robotMap) => {
    const output = document.querySelector("#premium-analysis-panel [data-pa-output]");
    if (!output) return;
    output.querySelectorAll(".pa-analysis-card").forEach((card) => {
      if (card.querySelector(".fl-learning-note")) return;
      const title = card.querySelector(".pa-analysis-title")?.textContent || card.textContent || "";
      const item = findMatchInText(title, robotMap);
      const info = learningText(item);
      const note = document.createElement("div");
      note.className = "fl-learning-note";
      note.innerHTML = `<b>${esc(info.title)}</b><small>${esc(info.detail)}</small>`;
      card.appendChild(note);
    });
  };

  const decorateRobotHeadlines = (robotMap) => {
    document.querySelectorAll("#daily-matches-widget article, #daily-matches-widget .match-card, #daily-matches-widget .daily-match-card").forEach((card) => {
      if (card.querySelector(".fl-learning-inline")) return;
      const item = findMatchInText(card.textContent || "", robotMap);
      if (!item?.learning_adjustment) return;
      const info = learningText(item);
      const target = card.querySelector("h3,h4,.match-title,.daily-match-title") || card.firstElementChild;
      if (!target) return;
      const badge = document.createElement("span");
      badge.className = "fl-learning-inline";
      badge.textContent = info.applied ? `Öğrenme ${item.learning_adjustment.delta >= 0 ? "+" : ""}${item.learning_adjustment.delta}` : "Hafıza nötr";
      target.appendChild(badge);
    });
  };

  const refresh = async () => {
    if (refreshing) return;
    refreshing = true;
    try {
      const [robot, memory] = await Promise.all([
        readJson(ROBOT_URL, { matches: [], summary: {} }),
        readJson(MEMORY_URL, { status: "hazırlanıyor", summary: {}, market_memory: {} })
      ]);
      const robotMap = buildRobotMap(robot);
      renderPanel(robot, memory);
      decoratePremiumCards(robotMap);
      decorateRobotHeadlines(robotMap);
    } finally {
      refreshing = false;
    }
  };

  const isOwnMutation = (mutation) => {
    const node = mutation.target?.nodeType === 1 ? mutation.target : mutation.target?.parentElement;
    return Boolean(node?.closest?.("#learning-memory-panel, .fl-learning-note, .fl-learning-inline"));
  };

  const boot = () => {
    refresh();
    if (window.__flLearningVisibilityObserver) return;
    window.__flLearningVisibilityObserver = true;
    const observer = new MutationObserver((mutations) => {
      if (mutations.length && mutations.every(isOwnMutation)) return;
      window.clearTimeout(window.__flLearningVisibilityTimer);
      window.__flLearningVisibilityTimer = window.setTimeout(refresh, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setInterval(refresh, 60000);
  };

  window.addEventListener("load", () => setTimeout(boot, 300));
  document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 300), { once: true });
  document.addEventListener("fl:runtime-ready", () => setTimeout(boot, 300));
})();
