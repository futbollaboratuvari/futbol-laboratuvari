(() => {
  const id = "site-visible-fix-style";
  const run = () => {
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `.reveal{opacity:1!important;transform:none!important;visibility:visible!important}.reveal.visible{opacity:1!important;transform:none!important}.hero-media,.dashboard-hero::after,.dashboard-hero::before{pointer-events:none!important}main,.section,.hero-content,.platform-summary,.footer{visibility:visible!important}`;
      document.head.appendChild(style);
    }
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  };
  run();
  document.addEventListener("DOMContentLoaded", run);
  window.addEventListener("load", run);
  setTimeout(run, 500);
})();
