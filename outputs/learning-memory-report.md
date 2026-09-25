# Robot Öğrenme Hafızası Raporu

Oluşturma: 25.09.2026 04:55:38

## Özet

- Toplam tahmin: 2964
- Bekleyen tahmin: 2000
- Kazanan tahmin: 505
- Kaybeden tahmin: 459
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

- 2.5 Alt: toplam 850, bekleyen 569, başarı %56, düz getiri %-8, ağırlık 1
- MS 2: toplam 389, bekleyen 301, başarı %56, düz getiri %2, ağırlık 1
- KG Var: toplam 206, bekleyen 112, başarı %54, düz getiri %-4, ağırlık 1
- 2.5 Üst: toplam 299, bekleyen 161, başarı %51, düz getiri %-9, ağırlık 1
- 3.5 Üst: toplam 79, bekleyen 36, başarı %51, düz getiri %1, ağırlık 1
- MS 1: toplam 752, bekleyen 530, başarı %51, düz getiri %-18, ağırlık 0.94
- KG Yok: toplam 190, bekleyen 103, başarı %46, düz getiri %-21, ağırlık 0.94
- MS X: toplam 21, bekleyen 10, başarı %27, düz getiri %-30, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 94, bekleyen 94, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 35, bekleyen 35, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-25 | Meksika Liga MX Apertura | Atlante - Monterrey | 2.5 Alt | pending | 69/100
- 2026-09-25 | ABD USL | El Paso Locomo - Tulsa Roughneck | MS 1 | pending | 54/100
- 2026-09-25 | Meksika Liga MX Apertura | Club Tijuana - Atlas | 2.5 Üst | pending | 68/100
- 2026-09-25 | ABD Championship | Sporting Jax - Loudoun United | 3.5 Üst | pending | 60/100
- 2026-09-25 | İspanya Primera Lig RFEF Grup 2 | Ud Ibiza - Zaragoza | 2.5 Alt | pending | 55/100
- 2026-09-25 | Şili Kupa Son 16 Turu | Colo Colo (0) - (0) Audax Italiano | MS 1 | pending | 50/100
- 2026-09-25 | Kolombiya Kupa 2.Tur | Union Magdalen (0) - (2) Santa Fe | 2.5 Alt | pending | 57/100
- 2026-09-25 | ABD USL | Hartford Athle - Louisville City | 2.5 Alt | pending | 60/100
- 2026-09-25 | Brezilya Serie B | Vila Nova - Londrina | MS 1 | pending | 62/100
- 2026-09-25 | Galler FAW Championship Güney | Caerphilly Ath - Pontypridd Town | MS 2 | pending | 41/100
- 2026-09-25 | Afrika Uluslar Kupası 2027 Elemeler Grup K | Mali - Kape Verde | MS 1 | pending | 43/100
- 2026-09-25 | İskoçya Championship | Raith Rovers - Livingston | 2.5 Alt | pending | 71/100
- 2026-09-25 | İskoçya Championship | Inverness Ct - Morton | KG Yok | pending | 54/100
- 2026-09-25 | İskoçya Championship | Arbroath - Queens Park | 2.5 Alt | pending | 75/100
- 2026-09-25 | Kuzey İrlanda Championship | Rathfriland Ra - Warrenpoint Tow | MS 2 | pending | 48/100

