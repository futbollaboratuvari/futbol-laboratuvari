(() => {
  const URL = "./data/robot-engine-bridge.json";

  const writeStatus = (data) => {
    const status = document.querySelector("[data-load-status]");
    const source = document.querySelector("[data-active-source]");
    if (status) status.textContent = data?.status === "ready" ? "Robot köprüsü hazır" : "Robot köprüsü bekliyor";
    if (source) source.textContent = data?.mode ? `Robot: ${data.mode}` : "Robot köprüsü";
  };

  const load = async () => {
    try {
      const res = await fetch(URL, { cache: "no-store" });
      window.FLRobotBridgeStatus = res.ok ? await res.json() : { status: "error" };
    } catch {
      window.FLRobotBridgeStatus = { status: "error" };
    }
    writeStatus(window.FLRobotBridgeStatus);
    return window.FLRobotBridgeStatus;
  };

  window.FLRobotBridgeLoad = load;
  window.addEventListener("load", load);
})();
