# Robot Öğrenme Hafızası Raporu

Oluşturma: 23.09.2026 00:31:11

## Özet

- Toplam tahmin: 2736
- Bekleyen tahmin: 1843
- Kazanan tahmin: 458
- Kaybeden tahmin: 435
- Lig sayısı: 382
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 186, bekleyen 98, başarı %57, düz getiri %0, ağırlık 1
- MS 2: toplam 383, bekleyen 300, başarı %57, düz getiri %2, ağırlık 1
- 2.5 Alt: toplam 808, bekleyen 555, başarı %53, düz getiri %-11, ağırlık 0.951
- 2.5 Üst: toplam 287, bekleyen 157, başarı %52, düz getiri %-8, ağırlık 1
- 3.5 Üst: toplam 69, bekleyen 27, başarı %50, düz getiri %-1, ağırlık 1
- MS 1: toplam 718, bekleyen 506, başarı %49, düz getiri %-22, ağırlık 0.94
- KG Yok: toplam 161, bekleyen 85, başarı %41, düz getiri %-29, ağırlık 1
- MS X: toplam 21, bekleyen 12, başarı %33, düz getiri %-15, ağırlık 1
- İkinci Yarı KG Yok: toplam 26, bekleyen 26, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 28, bekleyen 28, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-23 | Kolombiya Primera A Clausura | America De Cal - Rionegro Aguila | MS 1 | pending | 50/100
- 2026-09-23 | El Salvador Primera Lig Apertura | Firpo - Cacahuatique | KG Var | pending | 72/100
- 2026-09-23 | El Salvador Primera Lig Apertura | Alianza - Fuerte San Fran | 2.5 Üst | pending | 71/100
- 2026-09-23 | ABD MLS | Seattle - Salt Lake | MS 1 | pending | 61/100
- 2026-09-23 | Guatemala Ulusal Lig Apertura | Xelaju - Antigua Guatema | MS 1 | pending | 49/100
- 2026-09-23 | Kanada Premier Lig | Vancouver Fc - Inter Toronto | MS 1 | pending | 45/100
- 2026-09-23 | Şili Kupa Son 16 Turu | Iquique - Antofagasta | 2.5 Alt | pending | 49/100
- 2026-09-23 | Uruguay Kupa Ön Eleme Turu Grup 3 | Cerro - Deportivo Maldo | 2.5 Alt | pending | 63/100
- 2026-09-23 | Şili Kupa Son 16 Turu | Union La Caler - Univ. Catolica | 2.5 Alt | pending | 57/100
- 2026-09-23 | Peru Premier Lig Clausura | Adt - Cienciano | MS 2 | pending | 63/100
- 2026-09-23 | Şili Kupa Son 16 Turu | Curico - Concepcion | 2.5 Alt | pending | 53/100
- 2026-09-23 | CONCACAF Uluslar Ligi Lig C Grup B | Aruba - Antiqua And Bar | 2.5 Alt | pending | 46/100
- 2026-09-23 | Uruguay Kupa Ön Eleme Turu Grup 3 | Montevideo Wan - Cerrito | MS 1 | pending | 48/100
- 2026-09-23 | CONCACAF Uluslar Ligi Lig C Grup C | Bahamalar - Saint Martin | KG Yok | pending | 55/100
- 2026-09-22 | Kolombiya Primera B, Kapanış | Atletico Fc - Tigres Fc | 2.5 Alt | won | 55/100

