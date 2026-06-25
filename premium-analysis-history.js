(() => {
  const PANEL_ID = "premium-analysis-panel";
  const HISTORY_KEY = "fl_premium_analysis_history";

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const readHistory = () => {
    try {
      const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  };

  const writeHistory = (list) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 8)));
  };

  const textFromResult = (result) => {
    const title = result.querySelector("h4")?.textContent?.trim() || "Futbol Laboratuvarı Özel Analiz";
    const cards = [...result.querySelectorAll(".pa-analysis-card")];
    const summaryRows = [...result.querySelectorAll(":scope > .pa-row")]
      .map((row) => row.textContent.trim().replace(/\s+/g, " "))
      .filter(Boolean);
    const cardLines = cards.map((card, index) => {
      const titleLine = card.querySelector(".pa-analysis-title")?.textContent?.trim().replace(/\s+/g, " ") || `${index + 1}. Maç`;
      const tag = card.querySelector(".pa-tag")?.textContent?.trim();
      const rows = [...card.querySelectorAll(".pa-row")].map((row) => `- ${row.textContent.trim().replace(/\s+/g, " ")}`).join("\n");
      const reason = card.querySelector(".pa-reason")?.textContent?.trim();
      return [`${index + 1}) ${titleLine}`, tag ? `Durum: ${tag}` : "", rows, reason ? `Gerekçe: ${reason}` : ""].filter(Boolean).join("\n");
    });

    return [
      "FUTBOL LABORATUVARI - OZEL ANALIZ",
      title,
      `Olusturma: ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
      "",
      ...summaryRows,
      "",
      ...cardLines,
      "",
      "Not: Bu içerik maç yorumu ve kişisel değerlendirmedir; kesin sonuç garantisi vermez."
    ].filter((line, index, arr) => line || arr[index - 1]).join("\n");
  };

  const saveResult = (result) => {
    const text = textFromResult(result);
    const cards = result.querySelectorAll(".pa-analysis-card").length;
    const summary = result.querySelector("h4")?.textContent?.trim() || "Özel analiz";
    const history = readHistory();
    if (history[0]?.text === text) return history[0];
    const item = {
      id: `pa-${Date.now()}`,
      createdAt: new Date().toISOString(),
      summary,
      cards,
      text
    };
    writeHistory([item, ...history]);
    return item;
  };

  const historyHtml = () => {
    const history = readHistory();
    if (!history.length) return `<div class="pa-history-empty">Henüz kayıtlı özel analiz yok.</div>`;
    return history.slice(0, 4).map((item, index) => {
      const date = new Date(item.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
      return `<button class="pa-history-item" type="button" data-pa-history-index="${index}"><strong>${esc(item.summary)}</strong><span>${esc(date)} · ${esc(item.cards)} maç</span></button>`;
    }).join("");
  };

  const injectStyle = () => {
    if (document.getElementById("premium-analysis-history-style")) return;
    const style = document.createElement("style");
    style.id = "premium-analysis-history-style";
    style.textContent = `
      .pa-action-row{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 2px}.pa-copy-button,.pa-history-button{min-height:38px;border-radius:12px;border:1px solid rgba(255,159,28,.24);background:rgba(255,255,255,.08);color:#f8fbff;font-size:12px;font-weight:950;cursor:pointer;padding:0 12px}.pa-copy-button.primary{background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;border:0}.pa-history-box{display:grid;gap:8px;margin-top:8px;padding:10px;border:1px solid rgba(255,159,28,.18);border-radius:14px;background:rgba(255,159,28,.055)}.pa-history-title{color:#ffe08a;font-size:12px;font-weight:950;text-transform:uppercase}.pa-history-item{display:grid;gap:3px;text-align:left;padding:9px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(0,0,0,.18);color:#f8fbff;cursor:pointer}.pa-history-item span,.pa-history-empty{color:#aebbd0;font-size:11px}.pa-toast{position:fixed;left:50%;bottom:22px;z-index:9999;transform:translateX(-50%);padding:10px 14px;border-radius:999px;background:rgba(3,8,23,.96);border:1px solid rgba(57,255,136,.35);color:#c8ffdd;font-size:12px;font-weight:950;box-shadow:0 18px 50px rgba(0,0,0,.35)}
    `;
    document.head.appendChild(style);
  };

  const toast = (message) => {
    document.querySelectorAll(".pa-toast").forEach((node) => node.remove());
    const box = document.createElement("div");
    box.className = "pa-toast";
    box.textContent = message;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 1800);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Özel analiz kopyalandı");
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      toast("Özel analiz kopyalandı");
    }
  };

  const decorateResult = (result) => {
    if (!result || result.dataset.paHistoryReady === "1") return;
    injectStyle();

    const hasAnalysis = Boolean(result.querySelector(".pa-analysis-card"));
    if (hasAnalysis) {
      const saved = saveResult(result);
      const actions = document.createElement("div");
      actions.className = "pa-action-row";
      actions.innerHTML = `<button class="pa-copy-button primary" type="button" data-pa-copy-latest>Sonucu Kopyala</button><button class="pa-copy-button" type="button" data-pa-copy-history>Son Kayıtları Göster</button>`;
      result.insertBefore(actions, result.children[1] || null);
      actions.querySelector("[data-pa-copy-latest]")?.addEventListener("click", () => copyText(saved.text));
      actions.querySelector("[data-pa-copy-history]")?.addEventListener("click", () => {
        appendHistory(result, true);
      });
      result.dataset.paHistoryReady = "1";
      return;
    }

    appendHistory(result, false);
    result.dataset.paHistoryReady = "1";
  };

  const appendHistory = (result, force = false) => {
    if (!result) return;
    let box = result.querySelector(".pa-history-box");
    if (box && !force) return;
    if (box) box.remove();
    box = document.createElement("div");
    box.className = "pa-history-box";
    box.innerHTML = `<div class="pa-history-title">Son Özel Analizler</div>${historyHtml()}`;
    result.appendChild(box);
    box.querySelectorAll("[data-pa-history-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = readHistory()[Number(button.dataset.paHistoryIndex)];
        if (item?.text) copyText(item.text);
      });
    });
  };

  const boot = () => {
    const panel = document.getElementById(PANEL_ID);
    if (!panel || panel.dataset.paHistoryObserver === "1") return;
    panel.dataset.paHistoryObserver = "1";
    const scan = () => decorateResult(panel.querySelector("[data-pa-output]"));
    scan();
    const observer = new MutationObserver(() => {
      const result = panel.querySelector("[data-pa-output]");
      if (result) {
        result.dataset.paHistoryReady = "0";
        setTimeout(scan, 20);
      }
    });
    observer.observe(panel, { childList: true, subtree: true });
  };

  window.addEventListener("load", () => setTimeout(boot, 250));
  document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 250), { once: true });
  document.addEventListener("fl:runtime-ready", () => setTimeout(boot, 250));
})();
