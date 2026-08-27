"use strict";

const assert = require("node:assert/strict");
const { serializeJson } = require("../scripts/json-file-policy");

const value = { matches: [{ id: 1, nested: { score: "2-1" } }] };
const archive = serializeJson("data/robot_match_archive.json", value);
const ordinary = serializeJson("data/fixtures.json", value);

assert.equal(JSON.parse(archive).matches[0].nested.score, "2-1");
assert.equal(archive.includes("\n  "), false);
assert.equal(ordinary.includes("\n  "), true);
assert(archive.length < ordinary.length);

process.stdout.write("generated-file-size.test.js OK\n");

