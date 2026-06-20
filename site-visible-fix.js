(() => {
  const styleId = "site-visible-fix-style";
  const apply = () => {
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = ".reveal{opacity:1!important;transform:none!important;visibility:visible!important}.reveal.visible{opacity:1!important;transform:none!important}main,.section,.hero-content,.platform-summary,.footer{visibility:visible!important}.hero-media,.dashboard-hero::after,.dashboard-hero::before,.site-header::before,.site-header::after{pointer-events:none!important}a,button,.site-header a,.site-header button,.nav-links,.nav-links a{pointer-events:auto!important}#daily-matches-widget.daily-widget-shell,#robot-analizleri .premium-coupon-center>div{max-height:none!important;overflow:visible!important}";
      document.head.appendChild(style);
    }
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  };

  apply();
  document.addEventListener("DOMContentLoaded", apply, { once: true });
  window.addEventListener("load", apply, { once: true });
  setTimeout(apply, 500);
})();
