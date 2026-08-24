const fs = require("fs");
const https = require("https");
const path = require("path");

const root = path.join(__dirname, "..");
const file = path.join(root, "data", "spor_toto_weekly_program.json");
const SOURCES = [
  { name: "Spor Toto Formül 15", url: "https://sportotoformul15.com/", parser: "formul15" },
  { name: "Spor Toto Tahmin", url: "https://sportototahmin.com/blog", parser: "tahmin" },
];
const MONTHS = { oca: "01", şub: "02", sub: "02", mar: "03", nis: "04", may: "05", haz: "06", tem: "07", ağu: "08", agu: "08", eyl: "09", eki: "10", kas: "11", ara: "12" };

const read = (fallback) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } };
const write = (value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8"); };
const decode = (value) => String(value || "")
  .replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
const textLines = (html) => decode(html)
  .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<br\s*\/?\s*>/gi, "\n").replace(/<\/(?:div|p|tr|td|th|li|h1|h2|h3|h4|section|article|button)>/gi, "\n")
  .replace(/<[^>]+>/g, " ").split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
const clean = (value) => String(value || "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const keyOf = (m) => `${m.date}|${clean(m.home)}|${clean(m.away)}`;
const normalizeTeam = (value) => String(value || "").replace(/\s+/g, " ").trim();
const normalizeDistribution = (values) => {
  if (!values) return null;
  const nums = [Number(values["1"]), Number(values.X), Number(values["2"])];
  if (nums.some((v) => !Number.isFinite(v) || v < 0)) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  if (!sum) return null;
  const out = { "1": Math.round((nums[0] / sum) * 100), X: Math.round((nums[1] / sum) * 100), "2": Math.round((nums[2] / sum) * 100) };
  out["1"] += 100 - out["1"] - out.X - out["2"];
  return out;
};

function get(url, redirects = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "Mozilla/5.0 FutbolLaboratuvari/1.0", Accept: "text/html,*/*", "Accept-Language": "tr-TR,tr;q=0.9" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
        res.resume(); return resolve(get(new URL(res.headers.location, url).toString(), redirects - 1));
      }
      let body = ""; res.setEncoding("utf8"); res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => res.statusCode >= 200 && res.statusCode < 300 ? resolve(body) : reject(new Error(`HTTP ${res.statusCode}`)));
    });
    req.on("error", reject); req.setTimeout(20000, () => req.destroy(new Error("timeout")));
  });
}

function parseFormul15(html) {
  const lines = textLines(html);
  let start = lines.findIndex((line) => /güncel bülten/i.test(line));
  if (start < 0) start = 0;
  const endFound = lines.findIndex((line, i) => i > start && /^kupon$/i.test(line));
  const scope = lines.slice(start, endFound > start ? endFound : undefined);
  const matches = [];
  for (let i = 0; i < scope.length && matches.length < 15; i += 1) {
    const dm = scope[i].match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}:\d{2})$/);
    if (!dm) continue;
    const date = `${dm[3]}-${dm[2].padStart(2, "0")}-${dm[1].padStart(2, "0")}`;
    let teams = null;
    for (let j = i + 1; j <= Math.min(i + 5, scope.length - 1); j += 1) {
      const tm = scope[j].match(/^(.+?)\s+(?:vs\.?|v|—|–|-)\s+(.+)$/i);
      if (tm && !/^\d+$/.test(tm[1])) { teams = [normalizeTeam(tm[1]), normalizeTeam(tm[2])]; i = j; break; }
    }
    if (!teams) continue;
    const percentages = [];
    for (let j = i + 1; j <= Math.min(i + 14, scope.length - 1) && percentages.length < 3; j += 1) {
      const pm = scope[j].match(/^%\s*(\d{1,3})$/) || scope[j].match(/^(\d{1,3})\s*%$/);
      if (pm) percentages.push(Number(pm[1]));
    }
    matches.push({ no: matches.length + 1, date, time: dm[4], home: teams[0], away: teams[1], public_distribution: percentages.length === 3 ? normalizeDistribution({ "1": percentages[0], X: percentages[1], "2": percentages[2] }) : null });
  }
  return matches;
}

function parseTahmin(html) {
  const lines = textLines(html);
  const header = lines.find((line) => /Spor Toto\s*·?\s*\d+\.\s*Hafta/i.test(line)) || lines.find((line) => /Spor Toto\s+\d+\.\s*Hafta/i.test(line)) || "";
  const weekMatch = header.match(/(\d+)\.\s*Hafta/i);
  const yearMatch = header.match(/(20\d{2})/) || lines.join(" ").match(/\b(20\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getUTCFullYear();
  const matches = [];
  for (let i = 0; i < lines.length && matches.length < 15; i += 1) {
    const dm = lines[i].match(/^(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]{3})\s*[·•]\s*(\d{1,2}:\d{2})$/);
    if (!dm) continue;
    const month = MONTHS[clean(dm[2]).slice(0, 3)] || MONTHS[dm[2].toLocaleLowerCase("tr-TR").slice(0, 3)];
    if (!month) continue;
    let teams = null;
    for (let j = i + 1; j <= Math.min(i + 8, lines.length - 1); j += 1) {
      const tm = lines[j].match(/^(.+?)\s+[—–]\s+(.+)$/);
      if (tm && !/Hafta$/i.test(lines[j])) { teams = [normalizeTeam(tm[1]), normalizeTeam(tm[2])]; i = j; break; }
    }
    if (!teams) continue;
    matches.push({ no: matches.length + 1, date: `${year}-${month}-${String(Number(dm[1])).padStart(2, "0")}`, time: dm[3], home: teams[0], away: teams[1] });
  }
  return { matches, week: weekMatch ? Number(weekMatch[1]) : null };
}

function validate15(matches) {
  if (!Array.isArray(matches) || matches.length !== 15) return false;
  const set = new Set(matches.map(keyOf));
  return set.size === 15 && matches.every((m) => m.date && m.time && m.home && m.away);
}
function overlapCount(a, b) {
  const bKeys = new Set(b.map(keyOf));
  return a.filter((m) => bKeys.has(keyOf(m))).length;
}
function leagueFor(match, oldByKey) {
  const previous = oldByKey.get(keyOf(match));
  return previous?.league || "Spor Toto";
}

async function run() {
  const current = read(null);
  if (!current || !Array.isArray(current.matches) || current.matches.length !== 15) throw new Error("Mevcut doğrulanmış Spor Toto programı yok");
  const fetched = [];
  for (const source of SOURCES) {
    try {
      const html = await get(source.url);
      const parsed = source.parser === "formul15" ? { matches: parseFormul15(html), week: null } : parseTahmin(html);
      console.log(`Spor Toto weekly source ${source.name}: ${parsed.matches.length} match.`);
      if (validate15(parsed.matches)) fetched.push({ ...source, ...parsed });
    } catch (error) {
      console.warn(`Spor Toto weekly source skipped (${source.name}): ${error.message}`);
    }
  }
  if (fetched.length < 2) {
    console.log("Spor Toto weekly sync: iki bağımsız 15 maç kaynağı doğrulanamadı; son sağlam program korundu.");
    return current;
  }
  let bestA = null; let bestB = null; let bestOverlap = -1;
  for (let i = 0; i < fetched.length; i += 1) for (let j = i + 1; j < fetched.length; j += 1) {
    const count = overlapCount(fetched[i].matches, fetched[j].matches);
    if (count > bestOverlap) { bestOverlap = count; bestA = fetched[i]; bestB = fetched[j]; }
  }
  if (bestOverlap < 15) {
    console.log(`Spor Toto weekly sync: kaynaklar tam uyuşmadı (${bestOverlap}/15); son sağlam program korundu.`);
    return current;
  }
  const primary = bestA.parser === "formul15" ? bestA : bestB;
  const oldByKey = new Map(current.matches.map((m) => [keyOf(m), m]));
  const dates = primary.matches.map((m) => m.date).sort();
  const week = bestA.week || bestB.week || current.week || null;
  const matches = primary.matches.map((m, index) => ({
    no: index + 1, date: m.date, time: m.time, league: leagueFor(m, oldByKey), home: m.home, away: m.away,
    public_distribution: m.public_distribution || oldByKey.get(keyOf(m))?.public_distribution || null,
  }));
  const next = {
    ...current,
    week: week || current.week,
    week_label: week ? `${current.season || ""} ${week}. Hafta`.trim() : current.week_label,
    program_start: dates[0],
    program_end: dates[dates.length - 1],
    match_count: 15,
    verification_status: "cross_verified_auto",
    verified_at: new Date().toISOString(),
    sync_sources: fetched.map((s) => ({ name: s.name, url: s.url, match_count: s.matches.length })),
    matches,
  };
  write(next);
  console.log(`Spor Toto weekly sync updated: ${next.week_label}, ${matches.length} matches, consensus 15/15.`);
  return next;
}

if (require.main === module) run().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { run, parseFormul15, parseTahmin, validate15, overlapCount };
