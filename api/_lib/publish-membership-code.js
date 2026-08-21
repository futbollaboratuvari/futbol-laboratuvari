const { readJsonFile, writeJsonFile } = require("./github-contents");
const { getUsageToken } = require("../lib/usage-token");

const MEMBERSHIP_PATH = "data/membership-codes.json";

function targetBranch() {
  return String(process.env.MEMBERSHIP_PUBLISH_BRANCH || "main").trim() || "main";
}

async function publishMembershipCode(record) {
  const token = getUsageToken();
  if (!token) throw new Error("Membership publish token missing");

  const branch = targetBranch();
  const current = await readJsonFile(token, MEMBERSHIP_PATH, branch);
  const codes = Array.isArray(current.data.codes) ? current.data.codes : [];
  const hash = String(record.codeHash || "").toLowerCase();

  if (codes.some(item => String(item.codeHash || "").toLowerCase() === hash)) {
    return { published: true, reason: "already-exists", branch };
  }

  const safeRecord = {
    codeHash: record.codeHash,
    codeLabel: record.codeLabel,
    planCode: record.planCode,
    planName: record.planName,
    remainingAnalysisCount: Number(record.remainingAnalysisCount || 0),
    active: true,
    owner: "",
    note: `Banka transferi - ${record.orderCode}`,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
  };

  const nextData = {
    ...current.data,
    updatedAt: new Date().toISOString(),
    codes: [safeRecord, ...codes],
  };

  await writeJsonFile(
    token,
    MEMBERSHIP_PATH,
    current.sha,
    nextData,
    "Banka transferi odemesi icin uyelik kodu eklendi",
    branch
  );
  return { published: true, reason: "created", branch };
}

module.exports = { publishMembershipCode };
