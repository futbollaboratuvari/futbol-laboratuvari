# Robot Öğrenme Hafızası Raporu

Oluşturma: 26.09.2026 23:13:32

## Özet

- Toplam tahmin: 3101
- Bekleyen tahmin: 1966
- Kazanan tahmin: 593
- Kaybeden tahmin: 542
- Lig sayısı: 486
- Seçenek sayısı: 12

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 231, bekleyen 123, başarı %56, düz getiri %-1, ağırlık 1
- MS 2: toplam 390, bekleyen 282, başarı %55, düz getiri %-3, ağırlık 1
- 2.5 Alt: toplam 848, bekleyen 511, başarı %54, düz getiri %-11, ağırlık 0.947
- 2.5 Üst: toplam 306, bekleyen 150, başarı %53, düz getiri %-8, ağırlık 1
- MS 1: toplam 818, bekleyen 548, başarı %52, düz getiri %-17, ağırlık 0.94
- 3.5 Üst: toplam 89, bekleyen 36, başarı %49, düz getiri %-3, ağırlık 1
- KG Yok: toplam 206, bekleyen 114, başarı %46, düz getiri %-21, ağırlık 0.94
- MS X: toplam 16, bekleyen 5, başarı %27, düz getiri %-30, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 124, bekleyen 124, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 49, bekleyen 49, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 23, bekleyen 23, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-26 | Meksika Liga MX Apertura | Santos Laguna - Pachuca | 2.5 Alt | pending | 57/100
- 2026-09-26 | Meksika Liga MX Apertura | Tigres Uanl - Puebla | 2.5 Alt | pending | 64/100
- 2026-09-26 | ABD MLS | Los Angeles - Colorado | MS 1 | pending | 51/100
- 2026-09-26 | ABD MLS | San Jose - Portland | MS 1 | pending | 59/100
- 2026-09-26 | Japonya Kadınlar Lig Kupası Grup Aşaması | Albirex Niigat - Urawa Red (K) | MS 2 | pending | 46/100
- 2026-09-26 | ABD MLS | Vancouver - Dc United | KG Var | pending | 71/100
- 2026-09-26 | Guatemala Ulusal Lig Apertura | Xelaju - Comunicaciones | 2.5 Alt | pending | 64/100
- 2026-09-26 | El Salvador Primera Lig Apertura | Isidro Metapan - Cacahuatique | MS 1 | pending | 64/100
- 2026-09-26 | ABD USL | Orange County - Pittsburgh Rive | KG Var | pending | 69/100
- 2026-09-26 | ABD USL | Monterey Bay - Lexington | MS 2 | pending | 63/100
- 2026-09-26 | Yeni Zelanda Bölgesel Ligler Ulusal Lig | Birkenhead Uni - Cashmere Techni | MS 1 | pending | 39/100
- 2026-09-26 | ABD USL | Oakland Roots - Phoenix Rising | 2.5 Alt | pending | 57/100
- 2026-09-26 | ABD MLS | Salt Lake - New England | MS 2 | pending | 66/100
- 2026-09-26 | CONCACAF Uluslar B Ligi, Grp D | Sint Maarten - Belize | 2.5 Alt | pending | 47/100
- 2026-09-26 | Kolombiya Primera A Clausura | Atletico Junio - Independiente M | 2.5 Alt | pending | 52/100

