(() => {
  const version = "20260622-pages-v8";
  const resetKey = "fl_access_reset_20260622_v8";

  if (localStorage.getItem(resetKey) !== "1") {
    localStorage.removeItem("fl_premium_beta_access");
    localStorage.removeItem("fl_premium_access_note");
    localStorage.removeItem("fl_premium_access_level");
    localStorage.removeItem("fl_premium_code_entered");
    localStorage.setItem(resetKey, "1");
  }

  document.documentElement.dataset.flCacheVersion = version;
})();
