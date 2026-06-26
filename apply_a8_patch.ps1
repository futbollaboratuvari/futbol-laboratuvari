# A8 Patch Paketi - Futbol Laboratuvari
# Kullanim:
# 1) Bu dosyayi repo ana klasorune koy:
#    C:\Users\Arif\Documents\GitHub\futbol-laboratuvari
# 2) PowerShell ac:
#    cd C:\Users\Arif\Documents\GitHub\futbol-laboratuvari
#    powershell -ExecutionPolicy Bypass -File .\apply_a8_patch.ps1

$ErrorActionPreference = "Stop"

function Backup-File($path) {
  if (Test-Path $path) {
    $backup = "$path.a8.bak"
    Copy-Item $path $backup -Force
    Write-Host "Yedek alindi: $backup"
  } else {
    throw "Dosya bulunamadi: $path"
  }
}

function Replace-Text($path, $old, $new) {
  $text = Get-Content $path -Raw -Encoding UTF8
  if ($text.Contains($old)) {
    $text = $text.Replace($old, $new)
    Set-Content $path $text -Encoding UTF8
    Write-Host "Degisti: $path"
  } else {
    Write-Host "Uyari: aranan metin bulunamadi: $old"
  }
}

function Insert-Before-Once($path, $marker, $insert, $check) {
  $text = Get-Content $path -Raw -Encoding UTF8
  if ($text.Contains($check)) {
    Write-Host "Zaten mevcut: $check"
    return
  }
  if (-not $text.Contains($marker)) {
    throw "Marker bulunamadi: $marker"
  }
  $text = $text.Replace($marker, "$insert`r`n$marker")
  Set-Content $path $text -Encoding UTF8
  Write-Host "Eklendi: $check"
}

$exact = "scripts\robot-exact-scoring.js"
$coupon = "scripts\robot-coupon-engine.js"
$export = "scripts\export-high-value-json.js"

Backup-File $exact
Backup-File $coupon
Backup-File $export

# 1) Ana pipeline motoru: robot-exact-scoring.js
Replace-Text $exact 'if (analysis.analysis_score < 50) return null;' 'if (analysis.analysis_score < 40) return null;'
Replace-Text $exact 'if (score >= 50) return "Sadece izleme";' 'if (score >= 40) return "Sadece izleme";'

$exactInsert = @'
  over15: { label: "1.5 Üst", keys: ["over15", "ust15", "over1_5", "ust_15", "over15_guess"], minOdd: 1.20, maxOdd: 2.80, scores: ["1-1", "2-0", "2-1"] },
  homeGoal: { label: "Ev Sahibi Gol Atar", keys: ["homeGoalYes", "homeScores", "home_to_score", "evGolAtar", "ev_sahibi_gol_atar", "homeGoalYes_guess"], minOdd: 1.20, maxOdd: 3.80, scores: ["1-0", "1-1", "2-1"] },
  awayGoal: { label: "Deplasman Gol Atar", keys: ["awayGoalYes", "awayScores", "away_to_score", "depGolAtar", "deplasman_gol_atar", "awayGoalYes_guess"], minOdd: 1.20, maxOdd: 3.80, scores: ["0-1", "1-1", "1-2"] },
'@
Insert-Before-Once $exact '  over25: { label: "2.5 Üst",' $exactInsert 'over15: { label: "1.5 Üst"'

# 2) Eski/alternatif kupon motoru: robot-coupon-engine.js
Replace-Text $coupon 'if (score < 50) return null;' 'if (score < 40) return null;'
Replace-Text $coupon 'if (finalScore < 50) return null;' 'if (finalScore < 40) return null;'
Replace-Text $coupon 'if (score >= 50) return "Sadece izleme";' 'if (score >= 40) return "Sadece izleme";'

$couponInsert = @'
  kgYok: {
    label: "KG Yok",
    keys: ["bttsNo", "kgYok", "yokOdd", "yok", "kg_yok"],
    minOdd: 1.40,
    maxOdd: 4.50,
    boost: 11,
    riskAdd: 5,
    scores: ["1-0", "0-1", "2-0"],
    signals: ["KG Yok seçeneği kontrol edildi"],
  },
  over15: {
    label: "1.5 Üst",
    keys: ["over15", "ust15", "over1_5", "ust_15"],
    minOdd: 1.20,
    maxOdd: 2.80,
    boost: 8,
    riskAdd: 2,
    scores: ["1-1", "2-0", "2-1"],
    signals: ["1.5 Üst düşük risk gol seçeneği kontrol edildi"],
  },
  homeGoal: {
    label: "Ev Sahibi Gol Atar",
    keys: ["homeGoalYes", "homeScores", "home_to_score", "evGolAtar", "ev_sahibi_gol_atar"],
    minOdd: 1.20,
    maxOdd: 3.80,
    boost: 8,
    riskAdd: 3,
    scores: ["1-0", "1-1", "2-1"],
    signals: ["Ev sahibi gol bulur seçeneği kontrol edildi"],
  },
  awayGoal: {
    label: "Deplasman Gol Atar",
    keys: ["awayGoalYes", "awayScores", "away_to_score", "depGolAtar", "deplasman_gol_atar"],
    minOdd: 1.20,
    maxOdd: 3.80,
    boost: 9,
    riskAdd: 4,
    scores: ["0-1", "1-1", "1-2"],
    signals: ["Deplasman gol bulur seçeneği kontrol edildi"],
  },
'@
Insert-Before-Once $coupon '  over25: {' $couponInsert 'kgYok: {'

# 3) Gunluk JSON export: kupon adayi ve izleme adayi ayrimi
Replace-Text $export 'const available = scored.filter((item) => item.hasOdds && Number(item.score || 0) >= 50 && item.band_check?.level !== "Yüksek");' @'
  const available = scored.filter((item) => item.hasOdds && Number(item.score || 0) >= 65 && item.band_check?.level !== "Yüksek");
  const watchlist = scored.filter((item) => item.hasOdds && Number(item.score || 0) >= 40 && Number(item.score || 0) < 65 && item.band_check?.level !== "Yüksek");
'@

Replace-Text $export '    scored,' @'
    scored,
    watchlist,
'@

Replace-Text $export '      coupon_candidate_count: couponBundle.available.length,' @'
      coupon_candidate_count: couponBundle.available.length,
      watch_candidate_count: (couponBundle.watchlist || []).length,
'@

Replace-Text $export '    matches: scored.map((item) => ({' @'
    watchlist: (couponBundle.watchlist || []).map((item) => live_match_output(item)),
    matches: scored.map((item) => ({
'@

# 4) Basit syntax/test
Write-Host ""
Write-Host "Syntax kontrol basliyor..."
node --check $exact
node --check $coupon
node --check $export

Write-Host ""
Write-Host "JSON uretim testi basliyor..."
node scripts/export-high-value-json.js

Write-Host ""
Write-Host "Robot analiz ozeti:"
node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('data/robot-analysis.json','utf8')); console.log(JSON.stringify(j.summary,null,2));"

Write-Host ""
Write-Host "A8 patch tamamlandi. Kontrol icin:"
Write-Host "git diff -- scripts/robot-exact-scoring.js scripts/robot-coupon-engine.js scripts/export-high-value-json.js"
