const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  classifyVerifiedStatus,
  classifyBulletinMatch,
  filterActiveBulletinMatches,
  verifiedMinute,
} = require("../scripts/bulletin-active-filter");
const { normalizeFixture } = require("../scripts/build-full-bulletin");

const now = { date: "2026-08-28", minute: 15 * 60 };
const future = { date: "2026-08-28", time: "16:00", home: "A", away: "B", status: "scheduled" };
const passed = { ...future, time: "14:00" };

assert.equal(classifyBulletinMatch(future, now), "scheduled");
assert.equal(classifyBulletinMatch(passed, now), "expired_scheduled");
assert.equal(classifyVerifiedStatus({ ...passed, status: "live", minute: 46 }), "unverified");
assert.equal(classifyVerifiedStatus({ ...passed, status: "finished" }), "unverified");
assert.equal(classifyVerifiedStatus({ ...passed, status: "live", score: "0-0", minute: 46 }), "live");
assert.equal(classifyVerifiedStatus({ ...passed, status: "finished", homeScore: 2, awayScore: 1 }), "finished");
assert.equal(classifyVerifiedStatus({ ...passed, status: "live", status_verified: true }), "live");
assert.equal(verifiedMinute({ status: "live", status_verified: true, minute: 46 }, "live"), 46);
assert.equal(verifiedMinute({ status: "live", status_verified: true }, "live"), null);
const alwaysFuture = { ...future, date: "2099-08-28" };
assert.deepEqual(filterActiveBulletinMatches([alwaysFuture, passed]), [alwaysFuture]);

const normalizedUnverified = normalizeFixture({ ...passed, status: "live", minute: 46 });
const normalizedVerified = normalizeFixture({ ...passed, status: "live", minute: 46, score: "0-0" });
assert.equal(normalizedUnverified.status, "unverified");
assert.equal(normalizedUnverified.minute, null);
assert.equal(normalizedVerified.status, "live");
assert.equal(normalizedVerified.minute, 46);

const widget = fs.readFileSync(path.join(__dirname, "..", "daily-matches-widget.js"), "utf8");
assert.doesNotMatch(widget, /root\?\.active_items/);
assert.doesNotMatch(widget, /root\?\.completed_items/);
assert.doesNotMatch(widget, /LIVE_WINDOW_MINUTES/);
assert.doesNotMatch(widget, /elapsed\s*>\s*60\s*\?\s*elapsed\s*-\s*15/);

process.stdout.write("verified-fixture-status.test.js OK\n");
