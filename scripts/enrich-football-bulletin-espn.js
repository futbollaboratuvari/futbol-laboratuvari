const fs = require('fs');
const https = require('https');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BULLETIN_FILE = path.join(ROOT, 'data', 'full-bulletin.json');
const HOSTS = ['site.web.api.espn.com', 'site.api.espn.com'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; FutbolLaboratuvari-Bulletin-ESPN/1.0)',
        Referer: 'https://www.espn.com/',
      },
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 160)}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('ESPN geçerli JSON döndürmedi.'));
        }
      });
    });
    req.setTimeout(20000, () => req.destroy(new Error('ESPN zaman aşımı')));
    req.on('error', reject);
  });
}

function normalizeName(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(fc|cf|sc|sk|fk|afc|club|futbol|football|women|woman|kadin|u21|u20|u19|u18|reserves?|ii)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameSimilarity(a, b) {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  const shortest = Math.min(left.length, right.length);
  if (shortest >= 5 && (left.includes(right) || right.includes(left))) return 0.92;

  const aTokens = left.split(' ').filter((t) => t.length >= 3);
  const bTokens = right.split(' ').filter((t) => t.length >= 3);
  if (!aTokens.length || !bTokens.length) return 0;
  let hits = 0;
  for (const token of aTokens) {
    if (bTokens.some((other) => token === other || (Math.min(token.length, other.length) >= 4 && (token.startsWith(other) || other.startsWith(token))))) hits += 1;
  }
  return (2 * hits) / (aTokens.length + bTokens.length);
}

function eventTeams(event) {
  const competition = event?.competitions?.[0] || {};
  const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
  const home = competitors.find((row) => row.homeAway === 'home') || competitors[0] || {};
  const away = competitors.find((row) => row.homeAway === 'away') || competitors[1] || {};
  return {
    home: home?.team?.displayName || home?.team?.shortDisplayName || home?.team?.name || '',
    away: away?.team?.displayName || away?.team?.shortDisplayName || away?.team?.name || '',
    homeScore: Number.isFinite(Number(home?.score)) ? Number(home.score) : null,
    awayScore: Number.isFinite(Number(away?.score)) ? Number(away.score) : null,
  };
}

function eventMinute(event) {
  const values = [event?.status?.displayClock, event?.competitions?.[0]?.status?.displayClock];
  for (const value of values) {
    const match = String(value || '').match(/(\d{1,3})/);
    if (match) return Number(match[1]);
  }
  return null;
}

function compactDate(date) {
  return String(date || '').replace(/-/g, '').slice(0, 8);
}

function isoDay(value) {
  return String(value || '').slice(0, 10);
}

async function fetchDay(day) {
  const errors = [];
  for (const host of HOSTS) {
    const url = `https://${host}/apis/site/v2/sports/soccer/all/scoreboard?dates=${compactDate(day)}&limit=1000`;
    try {
      const payload = await requestJson(url);
      return { events: Array.isArray(payload?.events) ? payload.events : [], host, errors };
    } catch (error) {
      errors.push(`${host}: ${error.message}`);
    }
  }
  throw new Error(errors.join(' | ') || `ESPN scoreboard unavailable for ${day}`);
}

function identity(match) {
  return [match?.date, match?.time, normalizeName(match?.home), normalizeName(match?.away)].join('|');
}

function bestEvent(match, events, used) {
  let best = null;
  for (const event of events) {
    const eventId = String(event?.id || event?.competitions?.[0]?.id || '');
    if (!eventId || used.has(eventId)) continue;
    const teams = eventTeams(event);
    const homeSim = nameSimilarity(match.home, teams.home);
    const awaySim = nameSimilarity(match.away, teams.away);
    if (homeSim < 0.5 || awaySim < 0.5) continue;
    const total = (homeSim + awaySim) / 2;
    if (total < 0.65) continue;
    const eventDay = isoDay(event?.date);
    const sameDayBonus = eventDay === match.date ? 0.2 : 0;
    const rank = total + sameDayBonus;
    if (!best || rank > best.rank) best = { event, eventId, teams, total, rank };
  }
  return best;
}

async function main() {
  const bulletin = readJson(BULLETIN_FILE);
  const matches = Array.isArray(bulletin?.matches) ? bulletin.matches : [];
  if (!matches.length) throw new Error('Bülten boş; ESPN enrichment uygulanmadı.');

  const beforeIds = matches.map(identity);
  const days = [...new Set(matches.map((m) => String(m?.date || '').slice(0, 10)).filter(Boolean))];
  if (!days.length) throw new Error('Bültende tarih bulunamadı.');

  const allEvents = [];
  const providerErrors = [];
  const hosts = new Set();
  for (const day of days) {
    try {
      const result = await fetchDay(day);
      result.events.forEach((event) => allEvents.push(event));
      result.errors.forEach((error) => providerErrors.push(error));
      hosts.add(result.host);
    } catch (error) {
      providerErrors.push(String(error.message || error));
    }
  }

  if (!allEvents.length) {
    throw new Error(`ESPN hiçbir etkinlik döndürmedi; mevcut bülten korunuyor. ${providerErrors.join(' | ').slice(0, 400)}`);
  }

  const now = new Date().toISOString();
  const used = new Set();
  let matchedCount = 0;
  const nextMatches = matches.map((match) => {
    const best = bestEvent(match, allEvents, used);
    if (!best) {
      return {
        ...match,
        espn: {
          matched: false,
          checked_at: now,
          source: 'ESPN Scoreboard',
        },
      };
    }

    used.add(best.eventId);
    matchedCount += 1;
    const status = best.event?.status?.type || best.event?.competitions?.[0]?.status?.type || {};
    return {
      ...match,
      espn: {
        matched: true,
        checked_at: now,
        source: 'ESPN Scoreboard',
        event_id: best.eventId,
        event_date: isoDay(best.event?.date),
        home: best.teams.home,
        away: best.teams.away,
        similarity: Number(best.total.toFixed(3)),
        state: status.state || null,
        status: status.name || status.description || null,
        completed: Boolean(status.completed),
        minute: eventMinute(best.event),
        score: {
          home: best.teams.homeScore,
          away: best.teams.awayScore,
        },
      },
    };
  });

  const afterIds = nextMatches.map(identity);
  if (nextMatches.length !== matches.length) throw new Error('GÜVENLİK: ESPN enrichment maç sayısını değiştirdi.');
  if (JSON.stringify(beforeIds) !== JSON.stringify(afterIds)) throw new Error('GÜVENLİK: ESPN enrichment ana maç kimliklerini değiştirdi.');

  const next = {
    ...bulletin,
    secondary_sources: {
      ...(bulletin.secondary_sources || {}),
      espn: {
        status: 'ok',
        checked_at: now,
        role: 'supplemental_only_no_overwrite',
        event_count: allEvents.length,
        matched_count: matchedCount,
        hosts: [...hosts],
        provider_errors: providerErrors.slice(-5),
      },
    },
    matches: nextMatches,
  };

  writeJson(BULLETIN_FILE, next);
  console.log(`ESPN bulletin enrichment OK: bulletin=${matches.length}, espn_events=${allEvents.length}, matched=${matchedCount}, core_matches_unchanged=true`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
