# Robot Öğrenme Hafızası Raporu

Oluşturma: 26.09.2026 03:11:51

## Özet

- Toplam tahmin: 3015
- Bekleyen tahmin: 2000
- Kazanan tahmin: 535
- Kaybeden tahmin: 480
- Lig sayısı: 479
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 379, bekleyen 285, başarı %56, düz getiri %2, ağırlık 1
- 2.5 Alt: toplam 833, bekleyen 528, başarı %55, düz getiri %-9, ağırlık 1
- 2.5 Üst: toplam 305, bekleyen 163, başarı %53, düz getiri %-7, ağırlık 1
- KG Var: toplam 222, bekleyen 124, başarı %52, düz getiri %-8, ağırlık 1
- MS 1: toplam 796, bekleyen 561, başarı %52, düz getiri %-17, ağırlık 0.94
- 3.5 Üst: toplam 89, bekleyen 46, başarı %51, düz getiri %1, ağırlık 1
- KG Yok: toplam 193, bekleyen 106, başarı %46, düz getiri %-21, ağırlık 0.94
- MS X: toplam 17, bekleyen 6, başarı %27, düz getiri %-30, ağırlık 1
- İlk Yarı KG Yok: toplam 14, bekleyen 14, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 114, bekleyen 114, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 42, bekleyen 42, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-26 | ABD USL | Orange County - Pittsburgh Rive | KG Var | pending | 70/100
- 2026-09-26 | El Salvador Primera Lig Apertura | Isidro Metapan - Cacahuatique | KG Var | pending | 69/100
- 2026-09-26 | Guatemala Ulusal Lig Apertura | Xelaju - Comunicaciones | 2.5 Alt | pending | 70/100
- 2026-09-26 | ABD MLS | Vancouver - Dc United | KG Var | pending | 71/100
- 2026-09-26 | ABD MLS | Los Angeles - Colorado | MS 1 | pending | 51/100
- 2026-09-26 | ABD MLS | San Jose - Portland | 3.5 Üst | pending | 59/100
- 2026-09-26 | Meksika Liga MX Apertura | Santos Laguna - Pachuca | 2.5 Alt | pending | 62/100
- 2026-09-26 | Meksika Liga MX Apertura | Tigres Uanl - Puebla | 2.5 Alt | pending | 70/100
- 2026-09-26 | Meksika Kadınlar Liga MX Apertura | Juarez (K) - Tijuana (K) | MS 1 | pending | 50/100
- 2026-09-26 | Kolombiya Primera A Clausura | Atletico Junio - Independiente M | 2.5 Üst | pending | 70/100
- 2026-09-26 | ABD MLS | Salt Lake - New England | MS 2 | pending | 68/100
- 2026-09-26 | ABD USL | Oakland Roots - Phoenix Rising | 2.5 Alt | pending | 62/100
- 2026-09-26 | ABD USL | Monterey Bay - Lexington | 2.5 Alt | pending | 63/100
- 2026-09-26 | Meksika Ascenso MX Apertura | Dorados - Durango | 2.5 Alt | pending | 68/100
- 2026-09-26 | ABD USL | New Mexico Uni - Sacramento Repu | KG Var | pending | 65/100

