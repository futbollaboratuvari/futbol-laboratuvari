const SEPARATOR = "|";

function clean(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function idPart(value, fallback = "-") {
  const text = clean(value);
  return text || fallback;
}

function matchName(item = {}) {
  return String(item.match_name || item.match || `${item.home || item.home_team_name || ""} - ${item.away || item.away_team_name || ""}`)
    .replace(/\s+VS\s+/i, " - ")
    .replace(/\s+-\s+/g, " - ")
    .trim();
}

function splitTeams(item = {}) {
  const directHome = item.home || item.home_team_name || item.ev_sahibi;
  const directAway = item.away || item.away_team_name || item.deplasman;
  if (directHome && directAway) return { home: String(directHome).trim(), away: String(directAway).trim() };

  const name = matchName(item);
  const parts = name.split(/\s+-\s+|\s+VS\s+/i).map((part) => part.trim()).filter(Boolean);
  return {
    home: parts[0] || directHome || "Ev Sahibi",
    away: parts[1] || directAway || "Deplasman"
  };
}

function dateOf(item = {}, date) {
  return String(date || item.date || item.tarih || item.match_date || "").slice(0, 10) || "tarih-yok";
}

function timeOf(item = {}) {
  return String(item.start_time || item.time || item.saat || item.kickoff || item.match_time || "").trim() || "--:--";
}

function leagueOf(item = {}) {
  return String(item.league || item.competition_name || item.lig || "Lig").trim() || "Lig";
}

function buildMatchId(item = {}, date) {
  const teams = splitTeams(item);
  return [
    idPart(dateOf(item, date)),
    idPart(leagueOf(item)),
    idPart(teams.home),
    idPart(teams.away),
    idPart(timeOf(item))
  ].join(SEPARATOR);
}

function normalizePairSelection(text) {
  const key = clean(text);
  if (/evet evet|yes yes|var var|e e/.test(key)) return "Evet / Evet";
  if (/evet hayir|yes no|var yok|e h/.test(key)) return "Evet / Hayır";
  if (/hayir evet|no yes|yok var|h e/.test(key)) return "Hayır / Evet";
  if (/hayir hayir|no no|yok yok|h h/.test(key)) return "Hayır / Hayır";
  return "";
}

function normalizeHtFtSelection(text) {
  const key = clean(text).replace(/\s+/g, " ");
  const found = key.match(/\b(1|x|2)\s*[\/-]\s*(1|x|2)\b/) || key.match(/\b(1|x|2)\s+(1|x|2)\b/);
  if (!found) return "";
  return `${found[1].toUpperCase()} / ${found[2].toUpperCase()}`;
}

function classifyOption(value) {
  const text = String(value || "").trim();
  const key = clean(text);

  if (!key) return { option_type: "Belirsiz", selection: "Belirsiz", option_label: "Belirsiz" };

  if (/degerli market yok|degerli secenek yok|oynama|pas gec/.test(key)) {
    return { option_type: "Pas", selection: "Değerli Seçenek Yok", option_label: "Değerli Seçenek Yok" };
  }

  const pair = normalizePairSelection(text);
  if (pair || /iy kg.*2y kg|ilk yari.*ikinci yari.*kg|first second btts|iy2y kg/.test(key)) {
    return {
      option_type: "IY_KG_2Y_KG",
      selection: pair || text || "Belirsiz",
      option_label: `İY KG / 2Y KG ${pair || text || "Belirsiz"}`
    };
  }

  const htft = normalizeHtFtSelection(text);
  if (htft || /iy ms|iy\/ms|ht ft|half time full time/.test(key)) {
    return {
      option_type: "IY_MS",
      selection: htft || text || "Belirsiz",
      option_label: `İY/MS ${htft || text || "Belirsiz"}`
    };
  }

  if (/ilk yari kg|1y kg|first half btts/.test(key)) {
    const selection = /yok|no|hayir/.test(key) ? "Yok" : "Var";
    return { option_type: "IY_KG", selection, option_label: `İlk Yarı KG ${selection}` };
  }

  if (/ikinci yari kg|2y kg|second half btts/.test(key)) {
    const selection = /yok|no|hayir/.test(key) ? "Yok" : "Var";
    return { option_type: "2Y_KG", selection, option_label: `İkinci Yarı KG ${selection}` };
  }

  if (/kg var|btts yes|both teams to score yes/.test(key)) {
    return { option_type: "KG", selection: "Var", option_label: "KG Var" };
  }

  if (/kg yok|btts no|both teams to score no/.test(key)) {
    return { option_type: "KG", selection: "Yok", option_label: "KG Yok" };
  }

  if (/2 5.*ust|ust 2 5|over 25|over 2 5/.test(key)) {
    return { option_type: "2.5", selection: "Üst", option_label: "2.5 Üst" };
  }

  if (/2 5.*alt|alt 2 5|under 25|under 2 5/.test(key)) {
    return { option_type: "2.5", selection: "Alt", option_label: "2.5 Alt" };
  }

  if (/3 5.*ust|ust 3 5|over 35|over 3 5/.test(key)) {
    return { option_type: "3.5", selection: "Üst", option_label: "3.5 Üst" };
  }

  if (/3 5.*alt|alt 3 5|under 35|under 3 5/.test(key)) {
    return { option_type: "3.5", selection: "Alt", option_label: "3.5 Alt" };
  }

  if (/^1$|^ms 1$|mac sonucu 1|home win/.test(key)) {
    return { option_type: "MS", selection: "1", option_label: "MS 1" };
  }

  if (/^x$|^ms x$|mac sonucu x|draw/.test(key)) {
    return { option_type: "MS", selection: "X", option_label: "MS X" };
  }

  if (/^2$|^ms 2$|mac sonucu 2|away win/.test(key)) {
    return { option_type: "MS", selection: "2", option_label: "MS 2" };
  }

  return { option_type: "Belirsiz", selection: text || "Belirsiz", option_label: text || "Belirsiz" };
}

function buildOptionId(item = {}, date, optionValue) {
  const option = classifyOption(optionValue);
  return [
    buildMatchId(item, date),
    idPart(option.option_type),
    idPart(option.selection)
  ].join(SEPARATOR);
}

function buildPredictionIdentity(item = {}, date, optionValue) {
  const option = classifyOption(optionValue);
  return {
    schema_version: "pro122_option_identity_v1",
    match_id: buildMatchId(item, date),
    option_id: buildOptionId(item, date, optionValue),
    option_type: option.option_type,
    selection: option.selection,
    option_label: option.option_label
  };
}

module.exports = {
  clean,
  matchName,
  splitTeams,
  dateOf,
  timeOf,
  leagueOf,
  buildMatchId,
  buildOptionId,
  buildPredictionIdentity,
  classifyOption
};
