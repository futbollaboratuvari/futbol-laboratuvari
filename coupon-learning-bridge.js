(() => {
  const KEY = "__flCouponLearningBridge";
  if (window[KEY]) return;
  window[KEY] = true;

  const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  const num = (value) => Number(String(value ?? "").replace(",", ".").match(/\d+(\.\d+)?/)?.[0] || 0);

  const statusBox = () => {
    const panel = document.querySelector(".flw-analysis") || document.querySelector(".flw-slip");
    if (!panel) return null;
    let box = document.querySelector("[data-coupon-learning-status]");
    if (!box) {
      box = document.createElement("p");
      box.setAttribute("data-coupon-learning-status", "");
      box.className = "flw-note";
      panel.appendChild(box);
    }
    return box;
  };

  const readPicks = () => {
    const app = window.__flDailyWidget;
    if (!app || !app.picks || typeof app.picks.values !== "function") return [];
    return [...app.picks.values()].map((pick) => ({
      key: String(pick.key || ""),
      label: String(pick.label || ""),
      value: num(pick.value),
      home: String(pick.home || ""),
      away: String(pick.away || ""),
      league: String(pick.league || ""),
      date: String(pick.date || ""),
      time: String(pick.time || "")
    })).filter((pick) => pick.key && pick.value);
  };

  const postLearning = async () => {
    const picks = readPicks();
    if (!picks.length) return;
    const odds = picks.map((pick) => pick.value).filter(Boolean);
    const avgScore = odds.length ? Math.round(odds.reduce((sum, odd) => sum + (100 / odd), 0) / odds.length) : 0;
    const risk = avgScore >= 60 ? "Kontrollü" : avgScore >= 45 ? "Orta" : "Yüksek";
    const box = statusBox();
    if (box) box.textContent = "Merkezi öğrenme kuyruğuna gönderiliyor...";

    try {
      const response = await fetch("/api/learn-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avg_score: avgScore, risk, picks })
      });
      const result = await response.json().catch(() => ({}));
      if (box) box.textContent = result.ok
        ? `Merkezi öğrenme kaydı alındı: ${esc(result.stored)} seçim.`
        : `Merkezi öğrenme kaydı alınamadı: ${esc(result.error || "api_error")}`;
    } catch (error) {
      if (box) box.textContent = "Merkezi öğrenme kaydı alınamadı: bağlantı/API kontrol edilmeli.";
    }
  };

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-analyze]")) return;
    window.setTimeout(postLearning, 150);
  }, true);
})();
