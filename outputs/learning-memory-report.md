# Robot Öğrenme Hafızası Raporu

Oluşturma: 23.09.2026 23:45:32

## Özet

- Toplam tahmin: 2834
- Bekleyen tahmin: 1903
- Kazanan tahmin: 482
- Kaybeden tahmin: 449
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

- MS 2: toplam 390, bekleyen 305, başarı %55, düz getiri %0, ağırlık 1
- 2.5 Alt: toplam 834, bekleyen 566, başarı %55, düz getiri %-9, ağırlık 1
- KG Var: toplam 197, bekleyen 105, başarı %54, düz getiri %-4, ağırlık 1
- 2.5 Üst: toplam 293, bekleyen 161, başarı %52, düz getiri %-9, ağırlık 1
- 3.5 Üst: toplam 75, bekleyen 32, başarı %51, düz getiri %1, ağırlık 1
- MS 1: toplam 735, bekleyen 516, başarı %50, düz getiri %-19, ağırlık 0.94
- KG Yok: toplam 173, bekleyen 92, başarı %44, düz getiri %-24, ağırlık 1
- MS X: toplam 22, bekleyen 11, başarı %27, düz getiri %-30, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 35, bekleyen 35, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 31, bekleyen 31, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-23 | Guatemala Ulusal Lig Apertura | Xelaju - Antigua Guatema | MS 1 | pending | 49/100
- 2026-09-23 | Kanada Premier Lig | Vancouver Fc - Inter Toronto | MS 2 | pending | 42/100
- 2026-09-23 | ABD MLS | Seattle - Salt Lake | MS 1 | pending | 54/100
- 2026-09-23 | El Salvador Primera Lig Apertura | Alianza - Fuerte San Fran | 2.5 Üst | pending | 73/100
- 2026-09-23 | Kolombiya Primera A Clausura | America De Cal - Rionegro Aguila | MS 1 | pending | 54/100
- 2026-09-23 | El Salvador Primera Lig Apertura | Firpo - Cacahuatique | 2.5 Üst | pending | 72/100
- 2026-09-23 | Uruguay Kupa Ön Eleme Turu Grup 3 | Cerro - Deportivo Maldo | 2.5 Alt | pending | 66/100
- 2026-09-23 | Uruguay Kupa Ön Eleme Turu Grup 3 | Montevideo Wan - Cerrito | 2.5 Alt | pending | 58/100
- 2026-09-23 | Şili Kupa Son 16 Turu | Union La Caler - Univ. Catolica | 2.5 Alt | pending | 61/100
- 2026-09-23 | CONCACAF Uluslar Ligi Lig C Grup B | Aruba - Antiqua And Bar | 2.5 Alt | pending | 49/100
- 2026-09-23 | Paraguay Kupa Son 16 Turu | Fernando De La - Libertad | KG Yok | pending | 57/100
- 2026-09-23 | Şili Kupa Son 16 Turu | Iquique - Antofagasta | 2.5 Alt | pending | 52/100
- 2026-09-23 | Şili Kupa Son 16 Turu | Curico - Concepcion | 2.5 Üst | pending | 53/100
- 2026-09-23 | Peru Premier Lig Clausura | Adt - Cienciano | MS 2 | pending | 65/100
- 2026-09-23 | İspanya Primera Lig RFEF Grup 2 | Sant Andreu - Real Madrid Ii | 2.5 Alt | pending | 54/100

