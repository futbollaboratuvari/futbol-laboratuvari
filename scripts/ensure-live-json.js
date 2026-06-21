const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'live-matches.json');

function validJsonText(text) {
  if (!text || !text.trim()) return false;
  try {
    const parsed = JSON.parse(text);
    return parsed && Array.isArray(parsed.matches);
  } catch {
    return false;
  }
}

const fallback = {
  generated_at: new Date().toISOString(),
  date: new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date()),
  source: 'Güncel veri bekleniyor',
  message: 'Bugün için güncel veri henüz oluşmadı.',
  matches: []
};

let text = '';
try { text = fs.readFileSync(file, 'utf8'); } catch {}

if (!validJsonText(text)) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(fallback, null, 2) + '\n', 'utf8');
  console.log('live-matches.json restored');
} else {
  console.log('live-matches.json valid');
}
