# Robot Öğrenme Hafızası Raporu

Oluşturma: 25.09.2026 10:15:55

## Özet

- Toplam tahmin: 2977
- Bekleyen tahmin: 2000
- Kazanan tahmin: 513
- Kaybeden tahmin: 464
- Lig sayısı: 458
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 388, bekleyen 298, başarı %57, düz getiri %3, ağırlık 1
- 2.5 Alt: toplam 852, bekleyen 568, başarı %56, düz getiri %-7, ağırlık 1
- 2.5 Üst: toplam 298, bekleyen 158, başarı %52, düz getiri %-8, ağırlık 1
- KG Var: toplam 207, bekleyen 109, başarı %52, düz getiri %-8, ağırlık 1
- 3.5 Üst: toplam 81, bekleyen 38, başarı %51, düz getiri %1, ağırlık 1
- MS 1: toplam 755, bekleyen 531, başarı %51, düz getiri %-18, ağırlık 0.94
- KG Yok: toplam 191, bekleyen 104, başarı %46, düz getiri %-21, ağırlık 0.94
- MS X: toplam 21, bekleyen 10, başarı %27, düz getiri %-30, ağırlık 1
- İkinci Yarı KG Yok: toplam 38, bekleyen 38, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 97, bekleyen 97, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-25 | Meksika Liga MX Apertura | Atlante - Monterrey | 2.5 Alt | pending | 69/100
- 2026-09-25 | ABD USL | El Paso Locomo - Tulsa Roughneck | MS 1 | pending | 53/100
- 2026-09-25 | Meksika Liga MX Apertura | Club Tijuana - Atlas | 2.5 Üst | pending | 68/100
- 2026-09-25 | İspanya Primera Lig RFEF Grup 2 | Ud Ibiza - Zaragoza | 2.5 Alt | pending | 53/100
- 2026-09-25 | Şili Kupa Son 16 Turu | Colo Colo (0) - (0) Audax Italiano | MS 1 | pending | 50/100
- 2026-09-25 | Kolombiya Kupa 2.Tur | Union Magdalen (0) - (2) Santa Fe | 2.5 Alt | pending | 57/100
- 2026-09-25 | ABD USL | Hartford Athle - Louisville City | 2.5 Alt | pending | 60/100
- 2026-09-25 | Brezilya Serie B | Vila Nova - Londrina | MS 1 | pending | 62/100
- 2026-09-25 | Afrika Uluslar Kupası 2027 Elemeler Grup K | Mali - Kape Verde | MS 1 | pending | 42/100
- 2026-09-25 | ABD Championship | Sporting Jax - Loudoun United | 3.5 Üst | pending | 60/100
- 2026-09-25 | Galler FAW Championship Güney | Caerphilly Ath - Pontypridd Town | MS 2 | pending | 41/100
- 2026-09-25 | İskoçya Championship | Raith Rovers - Livingston | 2.5 Alt | pending | 71/100
- 2026-09-25 | İskoçya Championship | Inverness Ct - Morton | KG Yok | pending | 54/100
- 2026-09-25 | İskoçya Championship | Arbroath - Queens Park | 2.5 Alt | pending | 75/100
- 2026-09-25 | Kuzey İrlanda Championship | Rathfriland Ra - Warrenpoint Tow | MS 2 | pending | 48/100

