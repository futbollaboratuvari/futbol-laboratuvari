# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 02:19:28

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1309
- Kazanan tahmin: 100
- Kaybeden tahmin: 91
- Lig sayısı: 271
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 243, bekleyen 216, başarı %59, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 212, bekleyen 176, başarı %58, düz getiri %6, ağırlık 1
- MS 1: toplam 519, bekleyen 454, başarı %57, düz getiri %-5, ağırlık 1
- 2.5 Alt: toplam 515, bekleyen 454, başarı %43, düz getiri %-31, ağırlık 1
- KG Var: toplam 7, bekleyen 6, başarı %0, düz getiri %-100, ağırlık 1
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | Hollanda Eredivisie | Cambuur - Nijmegen | KG Var | pending | 72/100
- 2026-09-12 | İtalya Serie A | Atalanta - Cagliari | 2.5 Üst | pending | 66/100
- 2026-09-12 | Avusturya Bundesliga | Wolfsberger - Rapid Wien | KG Var | pending | 56/100
- 2026-09-12 | Fransa Ligue 2 | Dunkerque - St Etienne | KG Var | pending | 59/100
- 2026-09-12 | İsveç Allsvenskan | Göteborg - Halmstads | 2.5 Alt | pending | 70/100
- 2026-09-12 | İzlanda 2.Lig | Kari - Haukar | 2.5 Alt | pending | 49/100
- 2026-09-12 | İzlanda 2.Lig | Kormakur - Fjolnir | 2.5 Alt | pending | 49/100
- 2026-09-12 | İngiltere Ulusal Lig | Solihull Moors - Aldershot | 2.5 Alt | pending | 62/100
- 2026-09-12 | İngiltere Ulusal Lig | Eastleigh - Boreham Wood | KG Var | pending | 72/100
- 2026-09-12 | Hollanda Tweede Divisie | Jong Sparta - Katwijk | 2.5 Alt | pending | 48/100
- 2026-09-12 | Hollanda Tweede Divisie | Jong Almere Ci - Sv Spakenburg | 2.5 Alt | pending | 49/100
- 2026-09-12 | İsveç 2.Lig Södra Svealand | Karlslunds If - Örebro Syriansk | 2.5 Alt | pending | 48/100
- 2026-09-12 | İsveç 2.Lig Södra Svealand | Lindo Ff - Ragsved | 2.5 Alt | pending | 49/100
- 2026-09-12 | İsveç 2.Lig Norrland Yükselme Grubu | Taftea - Ifk Lulea | 2.5 Alt | pending | 49/100
- 2026-09-12 | Japonya J1 Lig | Gamba Osaka - Fc Tokyo | KG Var | pending | 64/100

