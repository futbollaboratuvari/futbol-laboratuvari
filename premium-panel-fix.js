(() => {
  const PANEL = "premium-analysis-panel";
  const LIST_KEY = "fl_multi_pick_list";
  const MEMBER_KEY = "fl_premium_membership";

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || "") || fallback; } catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const root = () => document.getElementById(PANEL);
  const list = () => Array.isArray(read(LIST_KEY, [])) ? read(LIST_KEY, []) : [];

  const currentChoice = () => {
    const r = root();
    if (!r) return { matches: [], type: "" };
    const type = r.querySelector("[data-pa-market].active")?.dataset?.paMarket || "";
    const matches = Array.from(r.querySelector("[data-pa-match]")?.selectedOptions || [])
      .map((o) => o.textContent.trim())
      .filter(Boolean);
    return { matches, type };
  };

  const useOneRight = () => {
    const member = read(MEMBER_KEY, {});
    const current = Number(member.remainingAnalysisCount);
    if (!Number.isFinite(current)) return { ok: true, left: member.remainingAnalysisCount || "Aktif" };
    if (current <= 0) return { ok: false, left: 0 };
    const left = Math.max(0, current - 1);
    write(MEMBER_KEY, { ...member, remainingAnalysisCount: left });
    return { ok: true, left };
  };

  const drawList = () => {
    const r = root();
    if (!r) return;
    const box = r.querySelector("[data-multi-list]");
    if (!box) return;
    const data = list();
    box.innerHTML = data.length
      ? data.map((x, i) => `<div class="pa-row"><span>${i + 1}. ${x.type}</span><strong>${x.match}</strong></div>`).join("")
      : `<p class="pa-small">Liste boş. Maç ve seçenek seçip Listeye Ekle.</p>`;
    const count = r.querySelector("[data-multi-count]");
    if (count) count.textContent = String(data.length);
  };

  const ensureUi = () => {
    const r = root();
    if (!r) return;
    const analyze = r.querySelector("[data-pa-analyze]");
    if (!analyze || r.querySelector("[data-multi-tools]")) { drawList(); return; }
    analyze.insertAdjacentHTML("beforebegin", `<div data-multi-tools class="pa-result"><h4>Çoklu Analiz Listesi: <span data-multi-count>0</span></h4><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:8px 0"><button class="pa-button" type="button" data-multi-add>Listeye Ekle</button><button class="pa-button secondary" type="button" data-multi-run>Çoklu Analiz Yap</button><button class="pa-button secondary" type="button" data-multi-clear>Listeyi Temizle</button></div><div data-multi-list></div></div>`);
    drawList();
  };

  const add = () => {
    const { matches, type } = currentChoice();
    const out = root()?.querySelector("[data-pa-output]");
    if (!matches.length || !type) {
      if (out) out.innerHTML = `<h4>Eksik seçim</h4><p class="pa-small">Listeye eklemek için maç ve seçenek seç.</p>`;
      return;
    }
    const data = list();
    const keys = new Set(data.map((x) => `${x.match}|${x.type}`));
    matches.forEach((match) => {
      const key = `${match}|${type}`;
      if (!keys.has(key)) data.push({ match, type });
    });
    write(LIST_KEY, data.slice(0, 12));
    drawList();
    if (out) out.innerHTML = `<h4>Listeye eklendi</h4><p class="pa-small">${matches.length} seçim eklendi.</p>`;
  };

  const run = () => {
    const out = root()?.querySelector("[data-pa-output]");
    const data = list();
    if (!data.length) {
      if (out) out.innerHTML = `<h4>Liste boş</h4><p class="pa-small">Önce Listeye Ekle yap.</p>`;
      return;
    }
    const usage = useOneRight();
    if (!usage.ok) {
      if (out) out.innerHTML = `<h4>Hak bitti</h4><p class="pa-small">Yeni paket veya kod gerekir.</p>`;
      return;
    }
    const risk = data.length >= 4 ? "Yüksek" : data.length >= 2 ? "Orta" : "Düşük";
    const trust = Math.max(35, 76 - (data.length - 1) * 8);
    const rows = data.map((x, i) => `<div class="pa-row"><span>${i + 1}. ${x.type}</span><strong>${x.match}</strong></div>`).join("");
    if (out) out.innerHTML = `<h4>Çoklu analiz hazır</h4><div class="pa-row"><span>Maç sayısı</span><strong>${data.length}</strong></div><div class="pa-row"><span>Risk</span><strong>${risk}</strong></div><div class="pa-row"><span>Güven</span><strong>%${trust}</strong></div><div class="pa-row"><span>Kalan hak</span><strong>${usage.left}</strong></div>${rows}`;
    const cards = root()?.querySelectorAll(".pa-state strong") || [];
    if (cards[1]) cards[1].textContent = String(usage.left);
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest?.("[data-multi-add]")) add();
    if (event.target.closest?.("[data-multi-clear]")) { write(LIST_KEY, []); drawList(); }
    if (event.target.closest?.("[data-multi-run]")) run();
  });

  window.addEventListener("load", () => setInterval(ensureUi, 1200));
  document.addEventListener("fl:trial-access-started", () => setTimeout(ensureUi, 500));
})();
