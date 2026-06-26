(() => {
  const FIXTURES_URL = "./data/fixtures.json";
  const LIVE_URL = "./data/live-matches.json";
  const ROBOT_URL = "./data/robot-analysis.json";
  const ARCHIVE_URL = "./data/robot_match_archive.json";
  const SOURCE = "pro12_2_decision_engine";

  const clamp = (value, min = 1, max = 99) => Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const cleanKey = (value) => String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const isEmpty = (value) => {
    const text = String(value ?? "").trim();
    return !text || text === "-" || text === "—" || text.toLowerCase() === "null";
  };
  const parseOdd = (value) => {
    const number = Number(String(value ?? "").replace(",", "."));
    return Number.isFinite(number) && number > 1 ? number : 0;
  };
  const fmtOdd = (value) => {
    const n = parseOdd(value);
    return n ? n.toFixed(2).replace(".", ",") : "-";
  };
  const implied = (odd) => {
    const n = parseOdd(odd);
    return n ? 100 / n : 0;
  };
  const todayKey = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };
  const get = (obj, key) => obj?.[key]
    ?? obj?.available_odds?.[key]
    ?? obj?.raw_market_guess_odds?.[key]
    ?? obj?.odds?.[key]
    ?? obj?.oranlar?.[key]
    ?? obj?.detay_oranlar?.[key]
    ?? obj?.detailOdds?.[key]
    ?? obj?.analysis?.[key]
    ?? obj?.stats?.[key];
  const pick = (obj, keys) => {
    for (const key of keys) {
      const value = get(obj, key);
      if (!isEmpty(value)) return value;
    }
    return "";
  };

  const matchTitle = (match) => String(match.match_name || match.match || `${match.home || match.home_team_name || ""} ${match.away || match.away_team_name || ""}`).replace(/\bVS\b/gi, " ").trim();
  const pairKey = (match) => cleanKey(`${match.home || match.home_team_name || ""} ${match.away || match.away_team_name || ""}`);
  const reversePairKey = (match) => cleanKey(`${match.away || match.away_team_name || ""} ${match.home || match.home_team_name || ""}`);
  const robotMap = (robot) => {
    const map = new Map();
    for (const item of robot.matches || []) {
      const key = cleanKey(matchTitle(item));
      if (key) map.set(key, item);
    }
    return map;
  };
  const findRobot = (match, map) => map.get(pairKey(match)) || map.get(reversePairKey(match)) || null;
  const normalizeMatch = (match, robotItem = null) => ({
    date: match.date || match.tarih || "",
    time: match.time || match.saat || match.start_time || "",
    league: match.league || match.competition_name || match.lig || robotItem?.league || "Lig",
    home: match.home || match.home_team_name || match.ev_sahibi || matchTitle(match).split(/\s+VS\s+/i)[0] || "Ev sahibi",
    away: match.away || match.away_team_name || match.deplasman || matchTitle(match).split(/\s+VS\s+/i)[1] || "Deplasman",
    status: match.status || match.liveStatus || "scheduled",
    score: match.score || "",
    raw: match,
    robot: robotItem || null,
    recommended_market: robotItem?.recommended_market || robotItem?.market || robotItem?.selection || match.suggested_option || "",
    estimated_odds: robotItem?.estimated_odds || robotItem?.odds || match.suggested_odds || "",
    analysis_score: robotItem?.analysis_score ?? match.analysis_score ?? match.confidence ?? null,
    risk_level: robotItem?.risk_level || match.risk_level || "",
    decision: match.decision || robotItem?.decision || "",
    robot_reason: robotItem?.robot_comment || robotItem?.robot_reason || match.robot_reason || ""
  });
  const loadMatches = async () => {
    const [fixtures, live, robot, archive] = await Promise.all([
      readJson(FIXTURES_URL, []),
      readJson(LIVE_URL, { matches: [], counts: {} }),
      readJson(ROBOT_URL, { matches: [], summary: {} }),
      readJson(ARCHIVE_URL, { matches: [], team_index: {} })
    ]);
    const today = todayKey();
    const liveMatches = Array.isArray(live?.matches) ? live.matches : [];
    const source = liveMatches.length ? liveMatches : (Array.isArray(fixtures) ? fixtures : []);
    const map = robotMap(robot || {});
    const list = source
      .filter((m) => String(m.date || m.tarih || "").slice(0, 10) === today)
      .map((m) => normalizeMatch(m, findRobot(m, map)))
      .sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));
    return { list, archive: archive || { matches: [], team_index: {} } };
  };

  const odds = {
    ms1: ["ms1", "one", "oneOdd", "odd1"],
    msx: ["msx", "draw", "drawOdd", "oddX"],
    ms2: ["ms2", "two", "twoOdd", "odd2"],
    over25: ["over25", "ust25", "over", "ust", "over25_guess"],
    under25: ["under25", "alt25", "under", "alt", "under25_guess"],
    bttsYes: ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"],
    bttsNo: ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"],
    iyKgYes: ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "firstHalfBttsYes_guess"],
    iyKgNo: ["firstHalfBttsNo", "iyKgYok", "iy_kg_yok", "firstHalfBttsNo_guess"],
    y2KgYes: ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "secondHalfBttsYes_guess"],
    y2KgNo: ["secondHalfBttsNo", "ikinciYariKgYok", "ikinci_yari_kg_yok", "secondHalfBttsNo_guess"],
    fsEe: ["firstSecondBttsYesYes", "firstSecondBttsYesYes_guess", "iy2yKgYesYes"],
    fsEh: ["firstSecondBttsYesNo", "firstSecondBttsYesNo_guess", "iy2yKgYesNo"],
    fsHe: ["firstSecondBttsNoYes", "firstSecondBttsNoYes_guess", "iy2yKgNoYes"],
    fsHh: ["firstSecondBttsNoNo", "firstSecondBttsNoNo_guess", "iy2yKgNoNo"],
    htft11: ["htFt11", "iyMs11", "htFt11_guess"],
    htft1x: ["htFt1X", "iyMs1x", "htFt1X_guess"],
    htft12: ["htFt12", "iyMs12", "htFt12_guess"],
    htftx1: ["htFtX1", "iyMsX1", "htFtX1_guess"],
    htftxx: ["htFtXX", "iyMsXx", "htFtXX_guess"],
    htftx2: ["htFtX2", "iyMsX2", "htFtX2_guess"],
    htft21: ["htFt21", "iyMs21", "htFt21_guess"],
    htft2x: ["htFt2X", "iyMs2x", "htFt2X_guess"],
    htft22: ["htFt22", "iyMs22", "htFt22_guess"]
  };

  const archiveItem = (archive, team) => archive?.team_index?.[team] || archive?.team_index?.[cleanKey(team)] || null;
  const resultValue = (text) => {
    const value = String(text || "").toUpperCase();
    if (value.includes("W") || value.includes("G")) return 3;
    if (value.includes("D") || value.includes("B")) return 1;
    if (value.includes("L") || value.includes("M")) return 0;
    return 1;
  };
  const teamFormScore = (item) => {
    if (!item) return 50;
    const finished = Math.max(1, Number(item.finished || 0));
    const wins = Number(item.wins || 0);
    const draws = Number(item.draws || 0);
    const base = ((wins * 3 + draws) / (finished * 3)) * 100;
    const recent = Array.isArray(item.recent) ? item.recent.slice(0, 5) : [];
    const recentScore = recent.length ? (recent.reduce((sum, r) => sum + resultValue(r.result), 0) / (recent.length * 3)) * 100 : base;
    return clamp((base * 0.45) + (recentScore * 0.55), 22, 88);
  };
  const momentumScore = (item) => {
    const recent = Array.isArray(item?.recent) ? item.recent.slice(0, 5) : [];
    if (!recent.length) return 50;
    return clamp((recent.reduce((sum, r) => sum + resultValue(r.result), 0) / (recent.length * 3)) * 100, 10, 95);
  };
  const formText = (item) => {
    if (!item) return "Arşiv verisi bekleniyor";
    const recent = Array.isArray(item.recent) ? item.recent.map((r) => r.result).join("-") : "-";
    return `${item.finished || 0} maç | G:${item.wins || 0} B:${item.draws || 0} M:${item.losses || 0} | Form:${recent || "-"}`;
  };
  const normalizeProbs = (items) => {
    const sum = items.reduce((acc, item) => acc + Math.max(0, Number(item.raw || 0)), 0);
    if (!sum) return items.map((item) => ({ ...item, percent: item.fallback || 0 }));
    return items.map((item) => ({ ...item, percent: clamp((item.raw / sum) * 100, 1, 98) }));
  };
  const best = (items) => [...items].sort((a, b) => (b.percent || 0) - (a.percent || 0))[0] || { label: "-", odd: "", percent: 0 };
  const formatOption = (item) => `${item.label} (${fmtOdd(item.odd)}) → %${clamp(item.percent)}`;

  const msSelection = (match, homeScore, awayScore, homeMom, awayMom) => {
    const formDiff = homeScore - awayScore;
    const momDiff = homeMom - awayMom;
    let raw1 = implied(pick(match.raw, odds.ms1)) || implied(pick(match.robot, odds.ms1)) || 34;
    let rawx = implied(pick(match.raw, odds.msx)) || implied(pick(match.robot, odds.msx)) || 31;
    let raw2 = implied(pick(match.raw, odds.ms2)) || implied(pick(match.robot, odds.ms2)) || 34;
    raw1 += formDiff * 0.22 + momDiff * 0.10;
    raw2 -= formDiff * 0.22 + momDiff * 0.10;
    if (Math.abs(formDiff) <= 8) rawx += 4;
    if (Math.abs(momDiff) >= 25) rawx -= 3;
    const list = normalizeProbs([
      { label: "1", odd: pick(match.raw, odds.ms1) || pick(match.robot, odds.ms1), raw: raw1 },
      { label: "X", odd: pick(match.raw, odds.msx) || pick(match.robot, odds.msx), raw: rawx },
      { label: "2", odd: pick(match.raw, odds.ms2) || pick(match.robot, odds.ms2), raw: raw2 }
    ]);
    return best(list);
  };
  const binarySelection = (match, yesKeys, noKeys, yesLabel, noLabel, shift = 0) => {
    const yesOdd = pick(match.raw, yesKeys) || pick(match.robot, yesKeys);
    const noOdd = pick(match.raw, noKeys) || pick(match.robot, noKeys);
    let yes = implied(yesOdd) || 50;
    let no = implied(noOdd) || (100 - yes);
    yes += shift;
    no -= shift;
    return best(normalizeProbs([
      { label: yesLabel, odd: yesOdd, raw: yes },
      { label: noLabel, odd: noOdd, raw: no }
    ]));
  };
  const firstSecondKgSelection = (match, kg, over25) => {
    const pIyYes = implied(pick(match.raw, odds.iyKgYes) || pick(match.robot, odds.iyKgYes)) || 32;
    const pY2Yes = implied(pick(match.raw, odds.y2KgYes) || pick(match.robot, odds.y2KgYes)) || 45;
    const kgBoost = kg.label === "Var" ? 4 : -4;
    const goalBoost = over25.label === "Üst" ? 3 : -3;
    const pairs = [
      { label: "Evet / Evet", odd: pick(match.raw, odds.fsEe) || pick(match.robot, odds.fsEe), raw: ((pIyYes + kgBoost) * (pY2Yes + goalBoost)) / 100 },
      { label: "Evet / Hayır", odd: pick(match.raw, odds.fsEh) || pick(match.robot, odds.fsEh), raw: ((pIyYes + kgBoost) * (100 - pY2Yes - goalBoost)) / 100 },
      { label: "Hayır / Evet", odd: pick(match.raw, odds.fsHe) || pick(match.robot, odds.fsHe), raw: ((100 - pIyYes - kgBoost) * (pY2Yes + goalBoost)) / 100 },
      { label: "Hayır / Hayır", odd: pick(match.raw, odds.fsHh) || pick(match.robot, odds.fsHh), raw: ((100 - pIyYes - kgBoost) * (100 - pY2Yes - goalBoost)) / 100 }
    ];
    return best(normalizeProbs(pairs));
  };
  const htftSelection = (match, ms) => {
    const source = [
      { label: "1 / 1", odd: pick(match.raw, odds.htft11) || pick(match.robot, odds.htft11) },
      { label: "1 / X", odd: pick(match.raw, odds.htft1x) || pick(match.robot, odds.htft1x) },
      { label: "1 / 2", odd: pick(match.raw, odds.htft12) || pick(match.robot, odds.htft12) },
      { label: "X / 1", odd: pick(match.raw, odds.htftx1) || pick(match.robot, odds.htftx1) },
      { label: "X / X", odd: pick(match.raw, odds.htftxx) || pick(match.robot, odds.htftxx) },
      { label: "X / 2", odd: pick(match.raw, odds.htftx2) || pick(match.robot, odds.htftx2) },
      { label: "2 / 1", odd: pick(match.raw, odds.htft21) || pick(match.robot, odds.htft21) },
      { label: "2 / X", odd: pick(match.raw, odds.htft2x) || pick(match.robot, odds.htft2x) },
      { label: "2 / 2", odd: pick(match.raw, odds.htft22) || pick(match.robot, odds.htft22) }
    ];
    const hasOdds = source.some((x) => parseOdd(x.odd));
    const preferred = ms.label === "1" ? "X / 1" : ms.label === "2" ? "X / 2" : "X / X";
    const list = source.map((item) => {
      const base = hasOdds ? implied(item.odd) : (item.label === preferred ? 36 : item.label.endsWith(`/ ${ms.label}`) ? 24 : 10);
      return { ...item, raw: base + (item.label === preferred ? 5 : 0) };
    });
    return best(normalizeProbs(list));
  };
  const fksScore = (ms, formDiff, momDiff) => {
    const odd = parseOdd(ms.odd);
    if (!(odd >= 1.3 && odd <= 1.7)) return { active: false, score: 0, label: "DOA yok" };
    const selectedSide = ms.label === "1" ? 1 : ms.label === "2" ? -1 : 0;
    const direction = selectedSide ? (formDiff * selectedSide) + (momDiff * selectedSide * 0.55) : -Math.abs(formDiff) * 0.5;
    const score = clamp(62 + direction * 0.35 + (70 - implied(ms.odd)) * 0.12, 1, 99);
    const label = score >= 80 ? "🟢 Gerçek Favori" : score >= 60 ? "🟡 Şüpheli Favori" : "🔴 Tuzak Favori";
    return { active: true, score, label };
  };
  const decisionLabel = (confidence, fks) => {
    let score = Number(confidence || 0);
    if (fks.active && fks.score < 60) score -= 9;
    if (score >= 85) return "👑 Süper Banko";
    if (score >= 75) return "🔥 Banko";
    if (score >= 65) return "✅ Kupona Eklenir";
    if (score >= 55) return "⚠️ Temkinli";
    if (score >= 45) return "🤔 Sistem Kuponu";
    return "❌ Pas Geç";
  };

  const pro122Analyze = (match, archive, selectedButton) => {
    const home = archiveItem(archive, match.home);
    const away = archiveItem(archive, match.away);
    const homeScore = teamFormScore(home);
    const awayScore = teamFormScore(away);
    const homeMom = momentumScore(home);
    const awayMom = momentumScore(away);
    const formDiff = homeScore - awayScore;
    const momDiff = homeMom - awayMom;
    const ms = msSelection(match, homeScore, awayScore, homeMom, awayMom);
    const kgShift = Math.abs(formDiff) <= 10 ? 3 : -1;
    const kg = binarySelection(match, odds.bttsYes, odds.bttsNo, "Var", "Yok", kgShift);
    const totalGoalsShift = kg.label === "Var" ? 4 : -3;
    const over25 = binarySelection(match, odds.over25, odds.under25, "Üst", "Alt", totalGoalsShift);
    const fsKg = firstSecondKgSelection(match, kg, over25);
    const htft = htftSelection(match, ms);
    const fks = fksScore(ms, formDiff, momDiff);
    const muaActive = Math.abs(momDiff) >= 22;
    const confidence = clamp((ms.percent * 0.35) + (Math.max(kg.percent, over25.percent) * 0.18) + ((homeScore + awayScore) / 2 * 0.18) + (Math.max(homeMom, awayMom) * 0.14) + 18 - (fks.active && fks.score < 60 ? 8 : 0), 1, 99);
    const selectedText = String(selectedButton || "Robot Önerisi");
    return {
      source: SOURCE,
      created_at: new Date().toISOString(),
      match,
      ms,
      kg,
      firstSecondKg: fsKg,
      over25,
      htft,
      confidence,
      decision: decisionLabel(confidence, fks),
      homeScore,
      awayScore,
      homeMom,
      awayMom,
      fks,
      doa: fks.active,
      muaActive,
      selectedText,
      notes: [
        `PRO 12.2 Nihai Karar Motoru aktif. Seçilen panel tercihi: ${selectedText}.`,
        `FKS/DOA: ${fks.active ? `${fks.score}/100 · ${fks.label}` : "Düşük oran alarmı çalışmadı"}.`,
        `MSK: Ev ${homeMom}/100 · Deplasman ${awayMom}/100${muaActive ? " · 🚨 MUA aktif" : ""}.`,
        `Form: Ev ${homeScore}/100 · Deplasman ${awayScore}/100.`,
        `Ev arşiv: ${formText(home)}. Deplasman arşiv: ${formText(away)}.`
      ]
    };
  };

  const rowHtml = (analysis, index) => `
    <tr>
      <td>${index + 1}. ${esc(analysis.match.home)} - ${esc(analysis.match.away)}<small>${esc(analysis.match.league || "Lig")} · ${esc(analysis.match.time || "--:--")}</small></td>
      <td>${esc(formatOption(analysis.ms))}</td>
      <td>${esc(formatOption(analysis.kg))}</td>
      <td>${esc(formatOption(analysis.firstSecondKg))}</td>
      <td>${esc(formatOption(analysis.over25))}</td>
      <td>${esc(formatOption(analysis.htft))}</td>
      <td><strong>%${analysis.confidence}</strong></td>
      <td>${esc(analysis.decision)}</td>
    </tr>`;
  const detailHtml = (analysis) => `
    <details class="pro122-detail">
      <summary>${esc(analysis.match.home)} - ${esc(analysis.match.away)} · PRO 12.2 detay</summary>
      <div class="pro122-detail-grid">
        <span>Kaynak: <b>${SOURCE}</b></span>
        <span>FKS: <b>${analysis.fks.active ? `${analysis.fks.score}/100 · ${analysis.fks.label}` : "DOA yok"}</b></span>
        <span>MSK: <b>Ev ${analysis.homeMom} / Dep ${analysis.awayMom}</b></span>
        <span>MUA: <b>${analysis.muaActive ? "🚨 Aktif" : "Pasif"}</b></span>
      </div>
      <div class="pro122-notes">${analysis.notes.map((note) => `<span>🧪 ${esc(note)}</span>`).join("")}</div>
    </details>`;
  const renderPro122 = (analyses) => {
    const avg = analyses.length ? clamp(analyses.reduce((sum, item) => sum + item.confidence, 0) / analyses.length, 1, 99) : 0;
    const totalOdds = analyses.map((x) => parseOdd(x.ms.odd)).filter(Boolean);
    const total = totalOdds.length === analyses.length ? totalOdds.reduce((a, b) => a * b, 1).toFixed(2).replace(".", ",") : "-";
    const couponStatus = decisionLabel(avg, { active: false, score: 0 });
    return `
      <div class="pro122-box">
        <h4>PRO 12.2 Nihai Karar Motoru Aktif</h4>
        <div class="pro122-summary">
          <span>Maç Sayısı <b>${analyses.length}</b></span>
          <span>Ortalama Güven <b>%${avg}</b></span>
          <span>MS Toplam Oran <b>${esc(total)}</b></span>
          <span>Kupon Statüsü <b>${esc(couponStatus)}</b></span>
        </div>
        <div class="pro122-table-wrap"><table class="pro122-table"><thead><tr><th>Maç</th><th>MS</th><th>KG</th><th>İY KG / 2Y KG</th><th>2.5</th><th>İY / MS</th><th>Güven</th><th>Karar</th></tr></thead><tbody>${analyses.map(rowHtml).join("")}</tbody></table></div>
        <div class="pro122-details">${analyses.map(detailHtml).join("")}</div>
        <p class="pa-small">Bu çıktı PRO 12.2 uyumlu karar motoru tarafından üretildi. Oran, arşiv formu, momentum, FKS/DOA ve MUA sinyalleri birlikte okunur; kesin sonuç garantisi vermez.</p>
      </div>`;
  };

  const injectStyle = () => {
    if (document.getElementById("pro122-decision-style")) return;
    const style = document.createElement("style");
    style.id = "pro122-decision-style";
    style.textContent = `
      .pro122-box{display:grid;gap:12px}.pro122-box h4{margin:0;color:#ffe08a;font-size:18px}.pro122-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.pro122-summary span{padding:10px;border:1px solid rgba(57,255,136,.18);border-radius:12px;background:rgba(57,255,136,.07);color:#aebbd0;font-size:12px}.pro122-summary b{display:block;margin-top:4px;color:#f8fbff}.pro122-table-wrap{overflow:auto;border:1px solid rgba(255,159,28,.20);border-radius:14px}.pro122-table{width:100%;border-collapse:collapse;min-width:980px}.pro122-table th,.pro122-table td{padding:10px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left;color:#d7e4f5;font-size:12px;vertical-align:top}.pro122-table th{color:#ffe08a;background:rgba(255,159,28,.08);font-size:11px;text-transform:uppercase}.pro122-table td strong{color:#39ff88}.pro122-table small{display:block;margin-top:4px;color:#8fa0b5}.pro122-detail{border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(255,255,255,.04)}.pro122-detail summary{cursor:pointer;color:#fff7d6;font-weight:900}.pro122-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.pro122-detail-grid span,.pro122-notes span{padding:8px;border-radius:10px;background:rgba(0,0,0,.18);color:#aebbd0;font-size:12px}.pro122-detail-grid b{color:#f8fbff}.pro122-notes{display:grid;gap:7px;margin-top:8px}@media(max-width:760px){.pro122-summary,.pro122-detail-grid{grid-template-columns:1fr}.pro122-table{min-width:860px}}`;
    document.head.appendChild(style);
  };

  const selectedIndexes = (select) => Array.from(select?.selectedOptions || [])
    .map((option) => Number(option.value))
    .filter((value) => Number.isInteger(value) && value >= 0);
  const runPro122ForPanel = async () => {
    const panel = document.getElementById("premium-analysis-panel");
    if (!panel) return;
    const output = panel.querySelector("[data-pa-output]");
    const select = panel.querySelector("[data-pa-match]");
    const activeButton = panel.querySelector("[data-pa-market].active");
    const indexes = selectedIndexes(select);
    if (!output || !indexes.length) return;
    injectStyle();
    const { list, archive } = await loadMatches();
    const matches = indexes.map((i) => list[i]).filter(Boolean).slice(0, 10);
    if (!matches.length) return;
    const selected = activeButton?.dataset?.paMarket || activeButton?.textContent || "Robot Önerisi";
    const analyses = matches.map((match) => pro122Analyze(match, archive, selected));
    localStorage.setItem("fl_last_pro122_analysis", JSON.stringify({ created_at: new Date().toISOString(), source: SOURCE, analyses }));
    output.innerHTML = renderPro122(analyses);
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("#premium-analysis-panel [data-pa-analyze]");
    if (!button || button.disabled) return;
    setTimeout(runPro122ForPanel, 140);
  });
})();
