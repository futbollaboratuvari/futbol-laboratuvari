const { getUsageToken } = require("../lib/usage-token");

const owner = "futbollaboratuvari";
const repo = "futbol-laboratuvari";
const ordersPath = "data/orders.json";
const MAX_ORDERS = 500;

function decodeContent(value) {
  return Buffer.from(String(value || ""), "base64").toString("utf8");
}

function encodeContent(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

async function loadOctokit() {
  const mod = await import("@octokit/rest");
  return mod.Octokit;
}

async function readOrdersFile(octokit) {
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path: ordersPath,
    ref: "main"
  });

  const file = response.data;
  return {
    sha: file.sha,
    data: JSON.parse(decodeContent(file.content))
  };
}

async function appendPendingOrder(order) {
  const merchantOid = order && order.merchant_oid ? order.merchant_oid : "";
  const token = getUsageToken();

  if (!merchantOid) {
    return { saved: false, reason: "merchant-oid-missing", merchantOid };
  }

  if (!token) {
    return { saved: false, reason: "token-missing", merchantOid };
  }

  try {
    const Octokit = await loadOctokit();
    const octokit = new Octokit({ auth: token });
    const current = await readOrdersFile(octokit);
    const oldOrders = current.data.orders || [];

    if (oldOrders.some(item => item && item.merchant_oid === merchantOid)) {
      return { saved: true, reason: "already-exists", merchantOid };
    }

    const nextData = {
      version: 1,
      updatedAt: new Date().toISOString(),
      status: "active",
      note: current.data.note || "PayTR siparis kayit dosyasi",
      orders: [order, ...oldOrders].slice(0, MAX_ORDERS)
    };

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: ordersPath,
      branch: "main",
      message: "PayTR pending siparis kaydi eklendi",
      content: encodeContent(JSON.stringify(nextData, null, 2) + "\n"),
      sha: current.sha
    });

    return { saved: true, merchantOid };
  } catch (error) {
    return { saved: false, reason: "write-failed", merchantOid };
  }
}

module.exports = {
  appendPendingOrder
};
