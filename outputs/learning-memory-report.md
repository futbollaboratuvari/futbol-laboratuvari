# Robot Öğrenme Hafızası Raporu

Oluşturma: 26.09.2026 16:57:55

## Özet

- Toplam tahmin: 3058
- Bekleyen tahmin: 2000
- Kazanan tahmin: 553
- Kaybeden tahmin: 505
- Lig sayısı: 485
- Seçenek sayısı: 12

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 387, bekleyen 290, başarı %58, düz getiri %3, ağırlık 1
- 2.5 Alt: toplam 840, bekleyen 519, başarı %54, düz getiri %-11, ağırlık 0.949
- KG Var: toplam 224, bekleyen 121, başarı %53, düz getiri %-6, ağırlık 1
- 3.5 Üst: toplam 89, bekleyen 44, başarı %53, düz getiri %6, ağırlık 1
- 2.5 Üst: toplam 304, bekleyen 154, başarı %53, düz getiri %-7, ağırlık 1
- MS 1: toplam 810, bekleyen 567, başarı %50, düz getiri %-19, ağırlık 0.94
- KG Yok: toplam 200, bekleyen 112, başarı %47, düz getiri %-20, ağırlık 0.94
- MS X: toplam 16, bekleyen 5, başarı %27, düz getiri %-30, ağırlık 1
- İlk Yarı KG Yok: toplam 23, bekleyen 23, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 47, bekleyen 47, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 117, bekleyen 117, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-26 | Meksika Liga MX Apertura | Santos Laguna - Pachuca | 2.5 Alt | pending | 57/100
- 2026-09-26 | Meksika Liga MX Apertura | Tigres Uanl - Puebla | 2.5 Alt | pending | 64/100
- 2026-09-26 | ABD MLS | Vancouver - Dc United | KG Var | pending | 72/100
- 2026-09-26 | ABD MLS | Los Angeles - Colorado | MS 1 | pending | 51/100
- 2026-09-26 | Guatemala Ulusal Lig Apertura | Xelaju - Comunicaciones | 2.5 Alt | pending | 64/100
- 2026-09-26 | El Salvador Primera Lig Apertura | Isidro Metapan - Cacahuatique | MS 1 | pending | 63/100
- 2026-09-26 | ABD MLS | San Jose - Portland | MS 1 | pending | 59/100
- 2026-09-26 | ABD USL | Orange County - Pittsburgh Rive | KG Var | pending | 69/100
- 2026-09-26 | Kolombiya Primera A Clausura | Atletico Junio - Independiente M | 2.5 Üst | pending | 70/100
- 2026-09-26 | ABD MLS | Salt Lake - New England | MS 2 | pending | 66/100
- 2026-09-26 | ABD USL | Oakland Roots - Phoenix Rising | 2.5 Alt | pending | 57/100
- 2026-09-26 | Meksika Kadınlar Liga MX Apertura | Juarez (K) - Tijuana (K) | KG Var | pending | 53/100
- 2026-09-26 | ABD USL | Monterey Bay - Lexington | MS 2 | pending | 63/100
- 2026-09-26 | Meksika Ascenso MX Apertura | Dorados - Durango | 2.5 Alt | pending | 62/100
- 2026-09-26 | ABD USL | New Mexico Uni - Sacramento Repu | 2.5 Üst | pending | 63/100

