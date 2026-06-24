const owner = "futbollaboratuvari";
const repo = "futbol-laboratuvari";
const ordersPath = "data/orders.json";

function decodeContent(value) {
  return Buffer.from(String(value || ""), "base64").toString("utf8");
}

async function loadOctokit() {
  const mod = await import("@octokit/rest");
  return mod.Octokit;
}

async function readOrdersFile(token) {
  if (!token) {
    return { ok: false, reason: "token-missing", orders: [] };
  }

  try {
    const Octokit = await loadOctokit();
    const octokit = new Octokit({ auth: token });
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: ordersPath,
      ref: "main"
    });

    const data = JSON.parse(decodeContent(response.data.content));
    return { ok: true, orders: data.orders || [] };
  } catch (error) {
    return { ok: false, reason: "read-failed", orders: [] };
  }
}

async function findOrderByMerchantOid(token, merchantOid) {
  const file = await readOrdersFile(token);
  const order = (file.orders || []).find(item => item && item.merchant_oid === merchantOid) || null;

  return {
    ok: file.ok,
    reason: file.reason || null,
    found: Boolean(order),
    order
  };
}

module.exports = {
  findOrderByMerchantOid
};
