async function appendUsageRecord(record) {
  return {
    saved: false,
    reason: "write-module-not-connected",
    recordId: record && record.id ? record.id : ""
  };
}

module.exports = {
  appendUsageRecord
};
