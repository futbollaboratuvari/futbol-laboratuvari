# Robot Öğrenme Hafızası Raporu

Oluşturma: 23.09.2026 04:54:11

## Özet

- Toplam tahmin: 2799
- Bekleyen tahmin: 1884
- Kazanan tahmin: 472
- Kaybeden tahmin: 443
- Lig sayısı: 395
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 191, bekleyen 102, başarı %56, düz getiri %-1, ağırlık 1
- MS 2: toplam 389, bekleyen 305, başarı %56, düz getiri %1, ağırlık 1
- 2.5 Alt: toplam 828, bekleyen 562, başarı %55, düz getiri %-9, ağırlık 1
- 2.5 Üst: toplam 291, bekleyen 161, başarı %52, düz getiri %-8, ağırlık 1
- 3.5 Üst: toplam 73, bekleyen 31, başarı %50, düz getiri %-1, ağırlık 1
- MS 1: toplam 731, bekleyen 514, başarı %49, düz getiri %-20, ağırlık 0.94
- KG Yok: toplam 165, bekleyen 89, başarı %41, düz getiri %-29, ağırlık 1
- MS X: toplam 22, bekleyen 11, başarı %27, düz getiri %-30, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 34, bekleyen 34, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 26, bekleyen 26, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-23 | Kanada Premier Lig | Vancouver Fc - Inter Toronto | MS 1 | pending | 45/100
- 2026-09-23 | El Salvador Primera Lig Apertura | Firpo - Cacahuatique | KG Var | pending | 73/100
- 2026-09-23 | El Salvador Primera Lig Apertura | Alianza - Fuerte San Fran | 2.5 Üst | pending | 72/100
- 2026-09-23 | ABD MLS | Seattle - Salt Lake | MS 1 | pending | 61/100
- 2026-09-23 | Guatemala Ulusal Lig Apertura | Xelaju - Antigua Guatema | MS 1 | pending | 49/100
- 2026-09-23 | Kolombiya Primera A Clausura | America De Cal - Rionegro Aguila | MS 1 | pending | 50/100
- 2026-09-23 | Şili Kupa Son 16 Turu | Iquique - Antofagasta | 2.5 Alt | pending | 52/100
- 2026-09-23 | Uruguay Kupa Ön Eleme Turu Grup 3 | Cerro - Deportivo Maldo | 2.5 Alt | pending | 67/100
- 2026-09-23 | CONCACAF Uluslar Ligi Lig C Grup B | Aruba - Antiqua And Bar | 2.5 Alt | pending | 49/100
- 2026-09-23 | Şili Kupa Son 16 Turu | Union La Caler - Univ. Catolica | 2.5 Üst | pending | 60/100
- 2026-09-23 | Peru Premier Lig Clausura | Adt - Cienciano | MS 2 | pending | 63/100
- 2026-09-23 | Şili Kupa Son 16 Turu | Curico - Concepcion | 2.5 Alt | pending | 56/100
- 2026-09-23 | İspanya Primera Lig RFEF Grup 2 | Sant Andreu - Real Madrid Ii | 2.5 Alt | pending | 55/100
- 2026-09-23 | Paraguay Kupa Son 16 Turu | San Lorenzo (P - 4 De Mayo | 3.5 Üst | pending | 47/100
- 2026-09-23 | Uruguay Kupa Ön Eleme Turu Grup 6 | Liverpool Mont - Colon | MS 1 | pending | 51/100

