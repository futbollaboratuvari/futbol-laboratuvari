const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const hamPoolPath = path.join(rootDir, "bu-klas-r-i-in-basit", "data", "ham_mac_havuzu.json");
const LEFT = "<".repeat(7);
const MID = "=".repeat(7);
const RIGHT = ">".repeat(7);

const hasConflictMarker = (text) => text.includes(LEFT) || text.includes(MID) || text.includes(RIGHT);

const resolveConflictMarkers = (text, prefer = "incoming") => {
  const lines = text.split(/\r?\n/);
  const output = [];
  let repairedBlocks = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith(LEFT)) {
      output.push(line);
      continue;
    }

    const current = [];
    const incoming = [];
    let target = current;
    let closed = false;
    repairedBlocks += 1;

    index += 1;
    for (; index < lines.length; index += 1) {
      const innerLine = lines[index];
      if (innerLine.startsWith(MID)) {
        target = incoming;
        continue;
      }
      if (innerLine.startsWith(RIGHT)) {
        closed = true;
        break;
      }
      target.push(innerLine);
    }

    if (!closed) {
      throw new Error(`Kapanmayan conflict bloğu bulundu. Blok: ${repairedBlocks}`);
    }

    const selected = prefer === "current" ? current : incoming;
    output.push(...(selected.length ? selected : current));
  }

  return {
    text: output.join("\n"),
    repairedBlocks,
    prefer,
  };
};

const tryParse = (text) => {
  if (hasConflictMarker(text)) {
    throw new Error("Conflict marker hâlâ dosyada duruyor.");
  }
  return JSON.parse(text);
};

const normalizePool = (pool) => {
  const matches = Array.isArray(pool.matches) ? pool.matches : [];
  return {
    ...pool,
    schema_version: pool.schema_version || "raw_match_pool_v1",
    updated_at: new Date().toISOString(),
    storage_strategy: pool.storage_strategy || "match_id_indexed_raw_matches",
    match_count: matches.length,
    matches,
  };
};

const original = fs.readFileSync(hamPoolPath, "utf8");
let pool;
let repairedBlocks = 0;
let selectedMode = "none";

if (!hasConflictMarker(original)) {
  pool = tryParse(original);
} else {
  const attempts = ["incoming", "current"].map((mode) => resolveConflictMarkers(original, mode));
  const errors = [];

  for (const attempt of attempts) {
    try {
      pool = tryParse(attempt.text);
      repairedBlocks = attempt.repairedBlocks;
      selectedMode = attempt.prefer;
      break;
    } catch (error) {
      errors.push(`${attempt.prefer}: ${error.message}`);
    }
  }

  if (!pool) {
    throw new Error(`Ham havuz conflict temizlenemedi. Denemeler: ${errors.join(" | ")}`);
  }
}

const normalized = normalizePool(pool);
fs.writeFileSync(hamPoolPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");

console.log(`Ham veri havuzu onarıldı. Mod: ${selectedMode}. Temizlenen blok: ${repairedBlocks}. Maç sayısı: ${normalized.matches.length}.`);
