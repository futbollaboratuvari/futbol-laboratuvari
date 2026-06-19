(() => {
  const STYLE_ID = "spor-toto-v3-fix-style";

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #spor-toto-performansi {
        overflow: visible !important;
      }

      #spor-toto-summary.spor-toto-v3-hidden {
        display: none !important;
      }

      #spor-toto-grid.spor-grid.spor-toto-v3-ready,
      #spor-toto-grid.spor-toto-v3-ready {
        display: block !important;
        grid-template-columns: none !important;
        gap: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }

      #spor-toto-grid.spor-toto-v3-ready > .spor-toto-v3-shell {
        width: 100% !important;
        max-width: 100% !important;
      }

      #spor-toto-grid.spor-toto-v3-ready .spor-v3-hero,
      #spor-toto-grid.spor-toto-v3-ready .spor-v3-layout {
        width: 100% !important;
      }

      #spor-toto-grid.spor-toto-v3-ready .spor-v3-board {
        min-width: 0 !important;
      }

      #spor-toto-grid.spor-toto-v3-ready .spor-v3-board-inner {
        width: 100% !important;
      }

      @media (min-width: 1181px) {
        #spor-toto-grid.spor-toto-v3-ready .spor-v3-layout {
          grid-template-columns: minmax(0, 1fr) 330px !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const apply = () => {
    injectStyle();
    const section = document.querySelector("#spor-toto-performansi");
    const grid = document.querySelector("#spor-toto-grid");
    const summary = document.querySelector("#spor-toto-summary");

    if (section) section.classList.add("spor-toto-v3-section");
    if (summary) {
      summary.classList.add("spor-toto-v3-hidden");
      summary.innerHTML = "";
    }
    if (grid) {
      grid.classList.add("spor-toto-v3-ready");
      grid.style.display = "block";
      grid.style.gridTemplateColumns = "none";
      grid.style.width = "100%";
    }
  };

  window.addEventListener("load", () => {
    apply();
    setTimeout(apply, 300);
    setTimeout(apply, 900);
    setTimeout(apply, 1800);
    setTimeout(apply, 3200);
  });
})();
