(() => {
  function addStyle() {
    if (document.getElementById("daily-toggle-style")) return;
    const s = document.createElement("style");
    s.id = "daily-toggle-style";
    s.textContent = `.daily-extra{display:none;padding:12px 14px;background:rgba(0,0,0,.24);border-bottom:1px solid rgba(255,255,255,.08)}.daily-extra.open{display:block}.daily-extra-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.daily-extra-grid span{display:flex;justify-content:space-between;gap:10px;padding:8px 10px;border:1px solid rgba(255,159,28,.18);border-radius:12px;background:rgba(255,255,255,.045);font-size:12px}.daily-extra-grid b{color:#ffe08a}.daily-match-row{cursor:pointer}.daily-match-row.is-open{background:rgba(255,159,28,.08)!important}@media(max-width:720px){.daily-extra-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    document.head.appendChild(s);
  }

  function cell(row, i) {
    return row.children[i] ? row.children[i].textContent.trim() : "-";
  }

  function makeExtra(row) {
    if (row.nextElementSibling && row.nextElementSibling.classList.contains("daily-extra")) return row.nextElementSibling;
    const extra = document.createElement("div");
    extra.className = "daily-extra";
    extra.innerHTML = `<div class="daily-extra-grid"><span><b>Alt</b>${cell(row,5)}</span><span><b>Üst</b>${cell(row,6)}</span><span><b>KG Var</b>${cell(row,7)}</span><span><b>KG Yok</b>${cell(row,8)}</span></div>`;
    row.after(extra);
    return extra;
  }

  function init() {
    addStyle();
    document.querySelectorAll(".daily-match-row").forEach((row) => {
      if (row.dataset.ready) return;
      row.dataset.ready = "1";
      row.onclick = () => {
        const extra = makeExtra(row);
        extra.classList.toggle("open");
        row.classList.toggle("is-open", extra.classList.contains("open"));
      };
    });
  }

  window.addEventListener("load", () => {
    init();
    setTimeout(init, 1000);
    setTimeout(init, 2500);
    setInterval(init, 5000);
  });
})();
