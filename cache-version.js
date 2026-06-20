(() => {
  const version = "20260620-2140";
  document.documentElement.dataset.flCacheVersion = version;

  const alreadyLoaded = Array.from(document.scripts).some((script) =>
    String(script.src || "").includes("membership-form-hint.js") && String(script.src || "").includes(version)
  );

  if (!alreadyLoaded) {
    const script = document.createElement("script");
    script.src = `membership-form-hint.js?v=${version}`;
    script.defer = true;
    document.body.appendChild(script);
  }
})();
