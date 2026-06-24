(() => {
  const URL = "./data/robot-engine-bridge.json";

  const load = async () => {
    try {
      const res = await fetch(URL, { cache: "no-store" });
      window.FLRobotBridgeStatus = res.ok ? await res.json() : { status: "error" };
    } catch {
      window.FLRobotBridgeStatus = { status: "error" };
    }
  };

  window.FLRobotBridgeLoad = load;
  window.addEventListener("load", load);
})();
