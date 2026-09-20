const fs = require("fs");
const path = require("path");
const { readArchive } = require("./archive-storage");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");

const readJson = (filePath, fallback) => {
  try {
    const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const text = (value) => String(value ?? "").trim();
const clean = (value) => text(value)
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();
const numberOrNull = (value) => {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
};
const dateOf = (row) => text(row?.date || row?.tarih || row?.start_date || row?.utc_date).slice(0, 10);
const homeOf = (row) => text(row?.home || row?.home_team_name || row?.ev_sahibi || row?.home_team);
const awayOf = (row) => text(row?.away || row?.away_team_name || row?.deplasman || row?.away_team);
const pairKey = (row, includeDate = true) => `${includeDate ? dateOf(row) : ""}|${clean(homeOf(row))}|${clean(awayOf(row))}`;
const matchId = (row) => text(row?.iddaa_event_id || row?.official_event_id || row?.matchCode || row?.match_code || row?.id || pairKey(row));
const reversePair = (row) => `${clean(awayOf(row))}|${clean(homeOf(row))}`;

const listMatches = (root) => [
  ...(Array.isArray(root?.matches) ? root.matches : []),
  ...(Array.isArray(root?.scheduled_matches) ? root.scheduled_matches : []),
  ...(Array.isArray(root?.live_matches) ? root.live_matches : []),
  ...(Array.isArray(root?.finished_matches) ? root.finished_matches : []),
];

const indexRows = (rows) => {
  const exact = new Map();
  const pair = new Map();
  for (const row of rows || []) {
    exact.set(pairKey(row), row);
    pair.set(pairKey(row, false), row);
  }
  return { exact, pair };
};

const findRow = (index, match) => index.exact.get(pairKey(match)) || index.pair.get(pairKey(match, false)) || null;

const parseScore = (row) => {
  const home = numberOrNull(row?.homeScore ?? row?.home_score ?? row?.homeGoals ?? row?.home_goals);
  const away = numberOrNull(row?.awayScore ?? row?.away_score ?? row?.awayGoals ?? row?.away_goals);
  if (home !== null && away !== null) return { home, away, label: `${home}-${away}` };
  const found = text(row?.score || row?.result || row?.result_score).match(/(\d+)\D+(\d+)/);
  return found ? { home: Number(found[1]), away: Number(found[2]), label: `${found[1]}-${found[2]}` } : null;
};

const normalizedStatus = (row) => clean(row?.status || row?.liveStatus || row?.fixture_status || "scheduled");
const isFinished = (row) => {
  const status = normalizedStatus(row);
  return Boolean(parseScore(row)) && ["finished", "complete", "completed", "full time", "ft", "bitti", "sonuclandi", "tamamlandi"].some((token) => status.includes(token));
};

const fixtureStamp = (row) => `${dateOf(row)}T${text(row?.time || row?.saat || row?.start_time || "00:00")}`;
const sortNewest = (rows) => [...rows].sort((a, b) => fixtureStamp(b).localeCompare(fixtureStamp(a)));

const recentForTeam = (teamName, archiveRows, limit = 5) => {
  const key = clean(teamName);
  return sortNewest((archiveRows || []).filter((row) => isFinished(row) && [clean(homeOf(row)), clean(awayOf(row))].includes(key)))
    .slice(0, limit)
    .map((row) => {
      const score = parseScore(row);
      const isHome = clean(homeOf(row)) === key;
      const goalsFor = isHome ? score.home : score.away;
      const goalsAgainst = isHome ? score.away : score.home;
      return {
        date: dateOf(row),
        opponent: isHome ? awayOf(row) : homeOf(row),
        venue: isHome ? "home" : "away",
        score: `${goalsFor}-${goalsAgainst}`,
        result: goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D",
        source: text(row?.result_source || row?.source || "verified_archive"),
      };
    });
};

const h2hForMatch = (match, archiveRows, limit = 5) => {
  const forward = `${clean(homeOf(match))}|${clean(awayOf(match))}`;
  const reverse = reversePair(match);
  return sortNewest((archiveRows || []).filter((row) => {
    if (!isFinished(row)) return false;
    const pair = `${clean(homeOf(row))}|${clean(awayOf(row))}`;
    return pair === forward || pair === reverse;
  })).slice(0, limit).map((row) => ({
    date: dateOf(row),
    home: homeOf(row),
    away: awayOf(row),
    score: parseScore(row)?.label || "",
    source: text(row?.result_source || row?.source || "verified_archive"),
  }));
};

const statsOf = (row) => row?.match_memory?.latest?.stats || row?.stats || row?.statistics || row?.live_stats || {};
const statValue = (row, side, field) => {
  const stats = statsOf(row);
  const aliases = {
    corners: [`${side}_corners`, side === "home" ? "homeCorners" : "awayCorners", side === "home" ? "ev_korner" : "dep_korner"],
    yellow_cards: [`${side}_yellow_cards`, side === "home" ? "homeYellowCards" : "awayYellowCards", side === "home" ? "ev_sari_kart" : "dep_sari_kart"],
    red_cards: [`${side}_red_cards`, side === "home" ? "homeRedCards" : "awayRedCards", side === "home" ? "ev_kirmizi_kart" : "dep_kirmizi_kart"],
  }[field] || [];
  for (const key of aliases) {
    const value = numberOrNull(stats?.[key] ?? row?.[key]);
    if (value !== null) return value;
  }
  return null;
};

const disciplineForTeam = (teamName, archiveRows, limit = 10) => {
  const key = clean(teamName);
  const values = { corners: [], yellow_cards: [], red_cards: [] };
  sortNewest((archiveRows || []).filter((row) => [clean(homeOf(row)), clean(awayOf(row))].includes(key))).slice(0, limit).forEach((row) => {
    const side = clean(homeOf(row)) === key ? "home" : "away";
    Object.keys(values).forEach((field) => {
      const value = statValue(row, side, field);
      if (value !== null) values[field].push(value);
    });
  });
  const average = (items) => items.length ? Number((items.reduce((sum, value) => sum + value, 0) / items.length).toFixed(2)) : null;
  const output = {
    sample_size: Math.max(...Object.values(values).map((items) => items.length), 0),
    average_corners: average(values.corners),
    average_yellow_cards: average(values.yellow_cards),
    average_red_cards: average(values.red_cards),
  };
  output.available = [output.average_corners, output.average_yellow_cards, output.average_red_cards].some((value) => value !== null);
  return output;
};

const currentDiscipline = (match) => ({
  home: {
    corners: statValue(match, "home", "corners"),
    yellow_cards: statValue(match, "home", "yellow_cards"),
    red_cards: statValue(match, "home", "red_cards"),
  },
  away: {
    corners: statValue(match, "away", "corners"),
    yellow_cards: statValue(match, "away", "yellow_cards"),
    red_cards: statValue(match, "away", "red_cards"),
  },
});

const validStanding = (row) => row && numberOrNull(row.played) > 0;
const compactStanding = (row) => validStanding(row) ? {
  team_name: text(row.team_name),
  rank: numberOrNull(row.rank),
  played: numberOrNull(row.played),
  points: numberOrNull(row.points),
  points_per_game: numberOrNull(row.points_per_game),
  wins: numberOrNull(row.wins),
  draws: numberOrNull(row.draws),
  losses: numberOrNull(row.losses),
  goals_for: numberOrNull(row.goals_for),
  goals_against: numberOrNull(row.goals_against),
  goal_difference: numberOrNull(row.goal_difference),
  recent_form: Array.isArray(row.recent_form) ? row.recent_form.slice(-6) : [],
  momentum: row.momentum || null,
  source_note: text(row.source_note),
} : null;

const namedPlayers = (row, key) => (Array.isArray(row?.[key]) ? row[key] : []).map((player) => ({
  name: text(typeof player === "string" ? player : player?.name),
  position: text(player?.position),
  reason: text(player?.reason || player?.status),
})).filter((player) => player.name);

const compactTeam = (row) => row ? {
  team_name: text(row.team_name),
  data_status: text(row.data_status),
  availability_checked: Boolean(row.availability_checked),
  lineup_confirmed: Boolean(row.lineup_confirmed || row.lineup?.confirmed),
  formation: text(row.formation || row.lineup?.formation),
  coach: text(row.coach || row.lineup?.coach),
  starting_11: namedPlayers(row, "starting_11").length ? namedPlayers(row, "starting_11") : namedPlayers(row.lineup, "starting_11"),
  substitutes: namedPlayers(row, "substitutes").length ? namedPlayers(row, "substitutes") : namedPlayers(row.lineup, "substitutes"),
  unavailable_players: namedPlayers(row, "unavailable_players"),
  injured_players: namedPlayers(row, "injured_players"),
  suspended_players: namedPlayers(row, "suspended_players"),
  doubtful_players: namedPlayers(row, "doubtful_players"),
  sources: Array.isArray(row.sources) ? row.sources.filter(Boolean) : [],
} : null;

const refereeFrom = (match, playerRow) => {
  const raw = match?.referee || match?.hakem || match?.officials?.referee || playerRow?.referee || null;
  if (!raw) return null;
  if (typeof raw === "string") return { name: text(raw), nationality: "", source: text(playerRow?.referee_source || match?.source) };
  const name = text(raw.name || raw.full_name || raw.referee);
  return name ? { name, nationality: text(raw.nationality || raw.country), source: text(raw.source || playerRow?.referee_source || match?.source) } : null;
};

const summaryOf = (match) => ({
  status: text(match.status || match.liveStatus || "scheduled"),
  score: parseScore(match)?.label || "",
  prediction: text(match.decision || match.suggested_option || match.recommended_market || match.best_market || match.prediction || match.tahmin),
  analysis: text(match.robot_reason || match.robot_comment || match.detail?.analysis),
  confidence: numberOrNull(match.analysis_score ?? match.confidence ?? match.model_score),
  risk: text(match.risk_level || match.risk),
  goal_expectation: numberOrNull(match.goal_expectation ?? match.gol_beklentisi ?? match.leagueGoalAverage),
  venue: text(match.venue || match.stadium || match.fixture?.venue?.name),
  source: text(match.source || match.oddsSource),
  updated_at: text(match.lastLiveUpdate || match.last_update),
});

function buildMatchDetailCenter({ full = {}, standings = {}, lineups = {}, statuses = {}, players = {}, external = {}, archive = {} }) {
  const standingsIndex = indexRows(standings.matches || []);
  const lineupIndex = indexRows(lineups.matches || []);
  const statusIndex = indexRows(statuses.matches || []);
  const playerIndex = indexRows(players.matches || []);
  const externalIndex = indexRows(external.matches || []);
  const archiveRows = Array.isArray(archive.matches) ? archive.matches : [];

  const buildOne = (match) => {
    const standing = findRow(standingsIndex, match);
    const lineup = findRow(lineupIndex, match);
    const status = findRow(statusIndex, match);
    const player = findRow(playerIndex, match);
    const externalRow = findRow(externalIndex, match);
    const homeLineup = compactTeam(externalRow?.squads?.home)
      || compactTeam(lineup?.home_lineup || player?.home_team || status?.home_status || match?.home_lineup || match?.home_status);
    const awayLineup = compactTeam(externalRow?.squads?.away)
      || compactTeam(lineup?.away_lineup || player?.away_team || status?.away_status || match?.away_lineup || match?.away_status);
    const archiveHomeRecent = recentForTeam(homeOf(match), archiveRows);
    const archiveAwayRecent = recentForTeam(awayOf(match), archiveRows);
    const externalHomeRecent = Array.isArray(externalRow?.recent_matches?.home) ? externalRow.recent_matches.home : [];
    const externalAwayRecent = Array.isArray(externalRow?.recent_matches?.away) ? externalRow.recent_matches.away : [];
    const homeRecent = externalRow?.recent_matches?.structured_available && externalHomeRecent.length ? externalHomeRecent : archiveHomeRecent;
    const awayRecent = externalRow?.recent_matches?.structured_available && externalAwayRecent.length ? externalAwayRecent : archiveAwayRecent;
    const archiveH2h = h2hForMatch(match, archiveRows);
    const externalH2h = Array.isArray(externalRow?.head_to_head?.matches) ? externalRow.head_to_head.matches : [];
    const h2h = externalRow?.head_to_head?.structured_available && externalH2h.length ? externalH2h : archiveH2h;
    const archiveHomeDiscipline = disciplineForTeam(homeOf(match), archiveRows);
    const archiveAwayDiscipline = disciplineForTeam(awayOf(match), archiveRows);
    const homeDiscipline = externalRow?.corners_cards?.structured_available && externalRow?.corners_cards?.home
      ? externalRow.corners_cards.home : archiveHomeDiscipline;
    const awayDiscipline = externalRow?.corners_cards?.structured_available && externalRow?.corners_cards?.away
      ? externalRow.corners_cards.away : archiveAwayDiscipline;
    const referee = externalRow?.referee?.structured_available && externalRow?.referee?.details
      ? externalRow.referee.details : refereeFrom(match, player);
    const homeStanding = compactStanding(externalRow?.standings?.home)
      || compactStanding(standing?.home_standing || match?.home_standing);
    const awayStanding = compactStanding(externalRow?.standings?.away)
      || compactStanding(standing?.away_standing || match?.away_standing);
    const sourceExcerpts = {
      summary: text(externalRow?.summary?.excerpt),
      standings: text(externalRow?.standings?.excerpt),
      head_to_head: text(externalRow?.head_to_head?.excerpt),
      recent_matches: text(externalRow?.recent_matches?.excerpt),
      squads: text(externalRow?.squads?.excerpt),
      corners_cards: text(externalRow?.corners_cards?.excerpt),
      referee: text(externalRow?.referee?.excerpt),
    };
    return {
      id: matchId(match),
      date: dateOf(match),
      time: text(match.time || match.saat || match.start_time),
      league: text(match.league || match.competition_name || match.lig),
      home: homeOf(match),
      away: awayOf(match),
      summary: summaryOf(match),
      standings: {
        available: Boolean(homeStanding || awayStanding),
        home: homeStanding,
        away: awayStanding,
        point_difference: numberOrNull(standing?.point_difference),
        momentum_difference: numberOrNull(standing?.momentum_difference),
        note: text(standing?.robot_comment),
        source_excerpt: sourceExcerpts.standings,
      },
      head_to_head: { available: h2h.length > 0, matches: h2h, source_excerpt: sourceExcerpts.head_to_head },
      recent_matches: { available: homeRecent.length > 0 || awayRecent.length > 0, home: homeRecent, away: awayRecent, source_excerpt: sourceExcerpts.recent_matches },
      squads: {
        available: Boolean(homeLineup || awayLineup),
        home: homeLineup,
        away: awayLineup,
        squad_risk: text(status?.squad_risk_level || match?.squad_risk_level || "Belirsiz"),
        lineup_risk: text(lineup?.lineup_risk_level || match?.lineup_risk_level || "Belirsiz"),
        matchup_analysis: lineup?.matchup_analysis || match?.matchup_analysis || null,
        source_excerpt: sourceExcerpts.squads,
      },
      corners_cards: {
        available: Boolean(homeDiscipline?.available || awayDiscipline?.available || Object.values(currentDiscipline(match).home).some((value) => value !== null) || Object.values(currentDiscipline(match).away).some((value) => value !== null)),
        current: currentDiscipline(match),
        home: homeDiscipline,
        away: awayDiscipline,
        source_excerpt: sourceExcerpts.corners_cards,
      },
      referee: { available: Boolean(referee), details: referee, source_excerpt: sourceExcerpts.referee },
      source_excerpt: sourceExcerpts.summary,
      provenance: {
        policy: "verified_named_sources_only",
        sources: [...new Set([
          text(match.source),
          standing ? "standings-signals.json" : "",
          lineup ? "lineup-signals.json" : "",
          status ? "team-status-signals.json" : "",
          player ? text(players.source || "player-intelligence.json") : "",
          externalRow?.verified_identity ? text(externalRow.source || external.source || "Nesine İstatistik") : "",
          externalRow?.verified_identity ? text(externalRow.source_url) : "",
          (homeRecent.length || awayRecent.length || h2h.length) ? "robot_match_archive.json" : "",
        ].filter(Boolean))],
      },
    };
  };

  const matches = listMatches(full).filter((match, index, all) => all.findIndex((candidate) => pairKey(candidate) === pairKey(match)) === index).map(buildOne);
  return {
    schema_version: 2,
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source_policy: "Only verified named fields are exposed. Missing sections remain unavailable; no values are inferred from odds or raw blocks.",
    match_count: matches.length,
    matches,
  };
}

const compactRobotContext = (detail) => ({
  source_verified: true,
  standings: detail.standings.available ? detail.standings : null,
  recent_form: detail.recent_matches.available ? {
    home: detail.recent_matches.home.map(({ result, score }) => ({ result, score })),
    away: detail.recent_matches.away.map(({ result, score }) => ({ result, score })),
  } : null,
  head_to_head: detail.head_to_head.available ? detail.head_to_head.matches.map(({ date, home, away, score }) => ({ date, home, away, score })) : [],
  discipline: detail.corners_cards.available ? { home: detail.corners_cards.home, away: detail.corners_cards.away } : null,
  referee: detail.referee.available ? detail.referee.details : null,
  lineup_available: detail.squads.available,
  provenance: detail.provenance,
});

function attachRobotContext(full, detailRoot) {
  const byId = new Map((detailRoot.matches || []).map((detail) => [detail.id, detail]));
  const byPair = new Map((detailRoot.matches || []).map((detail) => [pairKey(detail), detail]));
  let applied = 0;
  for (const key of ["matches", "scheduled_matches", "live_matches", "finished_matches"]) {
    if (!Array.isArray(full[key])) continue;
    full[key] = full[key].map((match) => {
      const detail = byId.get(matchId(match)) || byPair.get(pairKey(match));
      if (!detail) return match;
      applied += 1;
      const context = compactRobotContext(detail);
      return {
        ...match,
        match_detail_context: context,
        team_intelligence: { ...(match.team_intelligence || {}), match_detail_context: context },
      };
    });
  }
  full.match_detail_context_applied_at = detailRoot.generated_at;
  full.match_detail_context_applied_count = applied;
  return { full, applied };
}

function run() {
  const fullPath = path.join(dataDir, "full-bulletin.json");
  const full = readJson(fullPath, null);
  if (!full) throw new Error("data/full-bulletin.json bulunamadi; mevcut veri bos dosyayla ezilmedi.");
  const detailRoot = buildMatchDetailCenter({
    full,
    standings: readJson(path.join(dataDir, "standings-signals.json"), { matches: [] }),
    lineups: readJson(path.join(dataDir, "lineup-signals.json"), { matches: [] }),
    statuses: readJson(path.join(dataDir, "team-status-signals.json"), { matches: [] }),
    players: readJson(path.join(dataDir, "player-intelligence.json"), { matches: [] }),
    external: readJson(path.join(dataDir, "nesine-match-detail-source.json"), { matches: [] }),
    archive: readArchive(path.join(dataDir, "robot_match_archive.json"), { matches: [] }),
  });
  if (!detailRoot.matches.length) throw new Error("Mac Detay Merkezi bos veri uretmedi; mevcut dosyalar korunuyor.");
  const applied = attachRobotContext(full, detailRoot);
  writeJson(path.join(dataDir, "match-detail-center.json"), detailRoot);
  writeJson(fullPath, applied.full);
  console.log(`Mac Detay Merkezi: ${detailRoot.match_count} mac, robot baglantisi: ${applied.applied}.`);
  return { detailRoot, applied: applied.applied };
}

if (require.main === module) run();

module.exports = {
  attachRobotContext,
  buildMatchDetailCenter,
  clean,
  compactRobotContext,
  h2hForMatch,
  recentForTeam,
  run,
};
