const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const file = path.join(root, 'bu-klas-r-i-in-basit', 'data', 'ham_mac_havuzu.json');

function now() {
  return new Date().toISOString();
}

function emptyPool() {
  return {
    schema_version: 'raw_match_pool_v1',
    created_at: now(),
    updated_at: now(),
    storage_strategy: 'match_id_indexed_raw_matches',
    match_count: 0,
    matches: [],
    sources: [],
    deduplication: {
      incoming_matches: 0,
      duplicate_matches: 0,
      new_matches_added: 0,
      total_unique_matches: 0,
    },
  };
}

function validPool(text) {
  if (!String(text || '').trim()) return false;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && Array.isArray(parsed.matches);
  } catch {
    return false;
  }
}

fs.mkdirSync(path.dirname(file), { recursive: true });
let text = '';
try {
  text = fs.readFileSync(file, 'utf8');
} catch {
  text = '';
}

if (validPool(text)) {
  console.log('Robot raw pool JSON OK.');
  process.exit(0);
}

if (String(text || '').trim()) {
  const backup = `${file}.invalid-${Date.now()}`;
  fs.writeFileSync(backup, text, 'utf8');
  console.log(`Robot raw pool yedeklendi: ${backup}`);
}

fs.writeFileSync(file, `${JSON.stringify(emptyPool(), null, 2)}\n`, 'utf8');
console.log('Robot raw pool JSON yeniden baslatildi.');
