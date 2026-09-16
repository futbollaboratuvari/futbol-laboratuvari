const fs = require("fs");
const https = require("https");
const path = require("path");

const root = path.join(__dirname, "..");
const file = path.join(root, "data", "spor_toto_weekly_program.json");

const SOURCES = [
  { name: "Spor Toto Tahmin", url: "https://sportototahmin.com/blog", parser: "tahmin", priority: 1 },
  { name: "Spor Toto Winner", url: "https://sportotowinner.com/", parser: "winner", priority: 2 },
  { name: "Spor Toto Formül 15", url: "https://sportotoformul15.com/", parser: "formul15", priority: 3 },
];

const MONTHS = {
  oca: "01", şub: "02", sub: "02", mar: "03", nis: "04", may: "05", haz: "06",
  tem: "07", ağu: "08", agu: "08", eyl: "09", eki: "10", kas: "11", ara: "12",
};

const read = (fallback) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
};

const write = (value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const decode = (value) => String(value || "")
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">");

const textLines = (html) => decode(html)
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<br\s*\/?\s*>/gi, "\n")
  .replace(/<\/(?:div|p|tr|td|th|li|h1|h2|h3|h4|section|article|button)>/gi, "\n")
  .replace(/<[^>]+>/g, " ")
  .split(/\r?\n/)
  .map((line) => line.replace(/\s+/g, " ").trim())
  .filter(Boolean);

const clean = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
  .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const teamKey = (value) => clean(value)
  .replace(/\b(tumosan|corendon|arca|rams)\b/g, " ")
  .replace(/\b(?:a\s+s|f\s+k|s\s+k|f\s+c|as|fk|fc|sk)\b/g, " ")
  .replace(/\bspor(?:tif)? (?:faaliyetler|faliyetler)\b/g, " ")
  .replace(/\bsportif\b/g, " ")
  .replace(/istanbul basaksehir/g, "basaksehir")
  .replace(/^man utd$/, "manchester united")
  .replace(/^man city$/, "manchester city")
  .replace(/^(?:b|bayer) leverkusen$/, "leverkusen")
  .replace(/^ac milan$/, "milan")
  .replace(/^amed(?: faaliyetler| faliyetler)?$/, "amed")
  .replace(/^(?:vfb )?stuttgart$/, "stuttgart")
  .replace(/^(?:b|borussia) dortmund$/, "dortmund")
  .replace(/^(?:rb )?leipzig$/, "leipzig")
  .replace(/^tottenham(?: hotspur)?$/, "tottenham")
  .replace(/^as roma$/, "roma")
  .replace(/paris saint germain|paris st germain|psg/g, "paris sg")
  .replace(/hamburger sv/g, "hamburg")
  .replace(/\s+/g, " ")
  .trim();

const exactKeyOf = (m) => `${m.date}|${m.time}|${teamKey(m.home)}|${teamKey(m.away)}`;
const pairKeyOf = (m) => `${teamKey(m.home)}|${teamKey(m.away)}`;
const normalizeTeam = (value) => String(value || "").replace(/\s+/g, " ").trim();

const normalizeDistribution = (values) => {
  if (!values) return null;
  const nums = [Number(values["1"]), Number(values.X), Number(values["2"])];
  if (nums.some((v) => !Number.isFinite(v) || v < 0)) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  if (!sum) return null;
  const out = {
    "1": Math.round((nums[0] / sum) * 100),
    X: Math.round((nums[1] / sum) * 100),
    "2": Math.round((nums[2] / sum) * 100),
  };
  out["1"] += 100 - out["1"] - out.X - out["2"];
  return out;
};

function get(url, redirects = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 FutbolLaboratuvari/1.0",
        Accept: "text/html,*/*",
        "Accept-Language": "tr-TR,tr;q=0.9",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
        res.resume();
        return resolve(get(new URL(res.headers.location, url).toString(), redirects - 1));
      }
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => (
        res.statusCode >= 200 && res.statusCode < 300
          ? resolve(body)
          : reject(new Error(`HTTP ${res.statusCode}`))
      ));
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout")));
  });
}

function parseDateTr(text, year) {
  const dm = String(text || "").match(/\b(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]{3})\s*[·•]?\s*(\d{1,2}:\d{2})\b/);
  if (!dm) return null;
  const monthKey = clean(dm[2]).slice(0, 3);
  const month = MONTHS[monthKey];
  if (!month) return null;
  return {
    date: `${year}-${month}-${String(Number(dm[1])).padStart(2, "0")}`,
    time: dm[3],
  };
}

function parseFormul15(html) {
  const lines = textLines(html);
  const matches = [];

  for (let i = 0; i < lines.length && matches.length < 15; i += 1) {
    const teamLine = lines[i].match(/^#?\s*(\d{1,2})\s+(.+?)\s+(?:vs\.?|v|—|–|-)\s+(.+)$/i);
    if (!teamLine) continue;

    let dateTime = null;
    for (let j = i + 1; j <= Math.min(i + 6, lines.length - 1); j += 1) {
      const dm = lines[j].match(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\s+(\d{1,2}:\d{2})\b/);
      if (dm) {
        dateTime = {
          date: `${dm[3]}-${dm[2].padStart(2, "0")}-${dm[1].padStart(2, "0")}`,
          time: dm[4],
        };
        break;
      }
    }
    if (!dateTime) continue;

    matches.push({
      no: matches.length + 1,
      date: dateTime.date,
      time: dateTime.time,
      home: normalizeTeam(teamLine[2]),
      away: normalizeTeam(teamLine[3]),
      public_distribution: null,
    });
  }

  if (matches.length === 15) return matches;

  const fallback = [];
  for (let i = 0; i < lines.length && fallback.length < 15; i += 1) {
    const dm = lines[i].match(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\s+(\d{1,2}:\d{2})\b/);
    if (!dm) continue;

    let teams = null;
    for (let j = i - 4; j <= Math.min(i + 5, lines.length - 1); j += 1) {
      if (j < 0 || j === i) continue;
      const tm = lines[j].match(/^(?:#?\s*\d{1,2}\s+)?(.+?)\s+(?:vs\.?|v|—|–|-)\s+(.+)$/i);
      if (tm) {
        teams = [normalizeTeam(tm[1]), normalizeTeam(tm[2])];
        break;
      }
    }
    if (!teams) continue;

    fallback.push({
      no: fallback.length + 1,
      date: `${dm[3]}-${dm[2].padStart(2, "0")}-${dm[1].padStart(2, "0")}`,
      time: dm[4],
      home: teams[0],
      away: teams[1],
      public_distribution: null,
    });
  }
  return fallback;
}

function parseTahmin(html) {
  const lines = textLines(html);
  const header = lines.find((line) => /Spor Toto\s*·?\s*\d+\.\s*Hafta/i.test(line))
    || lines.find((line) => /Spor Toto\s+\d+\.\s*Hafta/i.test(line))
    || "";
  const weekMatch = header.match(/(\d+)\.\s*Hafta/i);
  const yearMatch = header.match(/(20\d{2})/) || lines.join(" ").match(/\b(20\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getUTCFullYear();
  const matches = [];
  const leagueNames = new Set(["Süper Lig", "Bundesliga", "Ligue 1", "Premier League", "La Liga", "Serie A"]);
  let currentLeague = "Spor Toto";

  for (let i = 0; i < lines.length && matches.length < 15; i += 1) {
    if (leagueNames.has(lines[i])) currentLeague = lines[i];
    const parsedDate = parseDateTr(lines[i], year);
    if (!parsedDate) continue;

    let teams = null;
    for (let j = i + 1; j <= Math.min(i + 8, lines.length - 1); j += 1) {
      const tm = lines[j].match(/^(.+?)\s+[—–-]\s+(.+)$/);
      if (tm && !/Hafta$/i.test(lines[j])) {
        teams = [normalizeTeam(tm[1]), normalizeTeam(tm[2])];
        i = j;
        break;
      }
    }
    if (!teams) continue;

    matches.push({
      no: matches.length + 1,
      date: parsedDate.date,
      time: parsedDate.time,
      league: currentLeague,
      home: teams[0],
      away: teams[1],
    });
  }

  return { matches, week: weekMatch ? Number(weekMatch[1]) : null };
}

function parseWinner(html) {
  const lines = textLines(html);
  const weekLine = lines.find((line) => /\bHafta\s+\d+\b/i.test(line)) || "";
  const weekMatch = weekLine.match(/\bHafta\s+(\d+)\b/i);
  const matches = [];

  for (let i = 0; i < lines.length && matches.length < 15; i += 1) {
    const combined = lines[i].match(/^(.+?)\s+-\s+(.+?)\s*(\d{1,2}\.\d{1,2}\.20\d{2})\s+(\d{1,2}:\d{2})\b/i);
    if (combined) {
      const [day, month, year] = combined[3].split(".");
      const percentages = [];
      for (let j = i; j <= Math.min(i + 8, lines.length - 1) && percentages.length < 3; j += 1) {
        const all = [...lines[j].matchAll(/%\s*(\d{1,3})/g)];
        for (const m of all) percentages.push(Number(m[1]));
      }
      matches.push({
        no: matches.length + 1,
        date: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
        time: combined[4],
        home: normalizeTeam(combined[1]),
        away: normalizeTeam(combined[2]),
        public_distribution: percentages.length >= 3
          ? normalizeDistribution({ "1": percentages[0], X: percentages[1], "2": percentages[2] })
          : null,
      });
      continue;
    }

    const dm = lines[i].match(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\s+(\d{1,2}:\d{2})\b/);
    if (!dm) continue;

    let teams = null;
    for (let j = i - 1; j >= Math.max(0, i - 6); j -= 1) {
      const tm = lines[j].match(/^(.+?)\s+-\s+(.+)$/);
      if (tm && !/Son Yazısı|Tahmin|Analiz/i.test(lines[j])) {
        teams = [normalizeTeam(tm[1]), normalizeTeam(tm[2])];
        break;
      }
    }
    if (!teams) continue;

    const percentages = [];
    for (let j = i + 1; j <= Math.min(i + 8, lines.length - 1) && percentages.length < 3; j += 1) {
      const pm = lines[j].match(/^%\s*(\d{1,3})$/) || lines[j].match(/^(\d{1,3})\s*%$/);
      if (pm) percentages.push(Number(pm[1]));
    }

    matches.push({
      no: matches.length + 1,
      date: `${dm[3]}-${dm[2].padStart(2, "0")}-${dm[1].padStart(2, "0")}`,
      time: dm[4],
      home: teams[0],
      away: teams[1],
      public_distribution: percentages.length === 3
        ? normalizeDistribution({ "1": percentages[0], X: percentages[1], "2": percentages[2] })
        : null,
    });
  }

  return { matches, week: weekMatch ? Number(weekMatch[1]) : null };
}

function parseSource(source, html) {
  if (source.parser === "formul15") return { matches: parseFormul15(html), week: null };
  if (source.parser === "winner") return parseWinner(html);
  return parseTahmin(html);
}

function validate15(matches) {
  if (!Array.isArray(matches) || matches.length !== 15) return false;
  const exact = new Set(matches.map(exactKeyOf));
  const pairs = new Set(matches.map(pairKeyOf));
  return exact.size === 15
    && pairs.size === 15
    && matches.every((m) => m.date && m.time && teamKey(m.home) && teamKey(m.away));
}

function overlapCount(a, b) {
  const bKeys = new Set(b.map(pairKeyOf));
  return a.filter((m) => bKeys.has(pairKeyOf(m))).length;
}

const endDate = (matches) => matches.map((m) => m.date).sort().at(-1) || "";
const startDate = (matches) => matches.map((m) => m.date).sort().at(0) || "";

function istanbulToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function leagueFor(match, oldByPair) {
  const previous = oldByPair.get(pairKeyOf(match));
  return match.league || previous?.league || "Spor Toto";
}

function sameProgram(current, candidate) {
  if (!current || !Array.isArray(current.matches) || current.matches.length !== 15) return false;
  if (!Array.isArray(candidate) || candidate.length !== 15) return false;
  return current.matches.every((m, i) => exactKeyOf(m) === exactKeyOf(candidate[i]));
}

async function run() {
  const current = read(null);
  if (!current || !Array.isArray(current.matches) || current.matches.length !== 15) {
    throw new Error("Mevcut doğrulanmış Spor Toto programı yok");
  }

  const today = istanbulToday();
  if (current.program_end && current.program_end >= today && current.week && current.verification_status !== "stale") {
    console.log(`Spor Toto weekly sync: ${current.week_label || `${current.week}. Hafta`} aktif; yeni hafta kontrolü program bittikten sonra başlayacak.`);
    return current;
  }

  const fetched = [];
  for (const source of SOURCES) {
    try {
      const html = await get(source.url);
      const parsed = parseSource(source, html);
      console.log(`Spor Toto weekly source ${source.name}: ${parsed.matches.length} match.`);
      if (validate15(parsed.matches)) {
        fetched.push({ ...source, ...parsed, start: startDate(parsed.matches), end: endDate(parsed.matches) });
      }
    } catch (error) {
      console.warn(`Spor Toto weekly source skipped (${source.name}): ${error.message}`);
    }
  }

  const forward = fetched
    .filter((source) => !current.program_end || source.end >= current.program_end)
    .sort((a, b) => String(b.end).localeCompare(String(a.end)) || (a.priority - b.priority));

  if (!forward.length) {
    console.log("Spor Toto weekly sync: ileri tarihli doğrulanmış 15 maç programı bulunamadı; mevcut program korundu.");
    return current;
  }

  const newestEnd = forward[0].end;
  const newest = forward.filter((source) => source.end === newestEnd);

  let selected = null;
  let peers = [];
  let verificationStatus = "single_source_auto";

  if (newest.length >= 2) {
    const pairs = [];
    for (let i = 0; i < newest.length; i += 1) {
      for (let j = i + 1; j < newest.length; j += 1) {
        pairs.push({
          a: newest[i],
          b: newest[j],
          count: overlapCount(newest[i].matches, newest[j].matches),
        });
      }
    }
    pairs.sort((a, b) => b.count - a.count || a.a.priority - b.a.priority);
    const consensus = pairs.find((pair) => pair.count === 15);
    if (consensus) {
      peers = [consensus.a, consensus.b];
      selected = [...peers].sort((a, b) => a.priority - b.priority)[0];
      verificationStatus = "cross_verified_auto";
    }
  }

  if (!selected) {
    const fallback = newest
      .filter((source) => {
        const weekMovedForward = Number.isFinite(source.week) && Number.isFinite(current.week)
          ? source.week > current.week
          : false;
        const dateMovedForward = !current.program_end || source.start > current.program_end;
        return weekMovedForward || dateMovedForward;
      })
      .sort((a, b) => a.priority - b.priority)[0];

    if (!fallback) {
      console.log("Spor Toto weekly sync: yeni program kaynakları birbiriyle doğrulanamadı; mevcut program korundu.");
      return current;
    }

    selected = fallback;
    peers = [fallback];
    console.warn(`Spor Toto weekly sync: tek kaynaklı güvenli ileri hafta kabul edildi (${fallback.name}).`);
  }

  if (sameProgram(current, selected.matches)) {
    console.log("Spor Toto weekly sync: program değişmedi; dosya yeniden yazılmadı.");
    return current;
  }

  const oldByPair = new Map(current.matches.map((m) => [pairKeyOf(m), m]));
  const peerByPair = new Map();
  for (const peer of peers) {
    for (const match of peer.matches) {
      const key = pairKeyOf(match);
      const existing = peerByPair.get(key);
      if (!existing || (!existing.public_distribution && match.public_distribution)) {
        peerByPair.set(key, match);
      }
    }
  }

  const dates = selected.matches.map((m) => m.date).sort();
  const week = peers.map((s) => s.week).find((value) => Number.isFinite(value))
    || selected.week
    || current.week
    || null;

  const matches = selected.matches.map((m, index) => ({
    no: index + 1,
    date: m.date,
    time: m.time,
    league: leagueFor(m, oldByPair),
    home: m.home,
    away: m.away,
    public_distribution: m.public_distribution
      || peerByPair.get(pairKeyOf(m))?.public_distribution
      || null,
  }));

  const next = {
    ...current,
    week: week || current.week,
    week_label: week ? `${current.season || ""} ${week}. Hafta`.trim() : current.week_label,
    program_start: dates[0],
    program_end: dates[dates.length - 1],
    match_count: 15,
    verification_status: verificationStatus,
    verified_at: new Date().toISOString(),
    sources: [
      {
        name: "Spor Toto Teşkilat Başkanlığı",
        url: "https://www.sportoto.gov.tr/spor-toto-listeler",
        role: "official_program_page",
      },
      ...peers.map((source) => ({
        name: source.name,
        url: source.url,
        role: peers.length > 1 ? "current_week_cross_check" : "current_week_fallback",
      })),
    ],
    sync_sources: peers.map((source) => ({
      name: source.name,
      url: source.url,
      match_count: source.matches.length,
    })),
    matches,
  };

  write(next);
  console.log(`Spor Toto weekly sync updated: ${next.week_label}, ${matches.length} matches, status ${verificationStatus}.`);
  return next;
}

if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  run,
  parseFormul15,
  parseTahmin,
  parseWinner,
  parseSource,
  validate15,
  overlapCount,
  teamKey,
  pairKeyOf,
};
