# Robot Öğrenme Hafızası Raporu

Oluşturma: 25.09.2026 15:53:36

## Özet

- Toplam tahmin: 2977
- Bekleyen tahmin: 2000
- Kazanan tahmin: 513
- Kaybeden tahmin: 464
- Lig sayısı: 465
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 370, bekleyen 280, başarı %57, düz getiri %3, ağırlık 1
- 2.5 Alt: toplam 864, bekleyen 580, başarı %56, düz getiri %-7, ağırlık 1
- 2.5 Üst: toplam 300, bekleyen 160, başarı %52, düz getiri %-8, ağırlık 1
- KG Var: toplam 209, bekleyen 111, başarı %52, düz getiri %-8, ağırlık 1
- 3.5 Üst: toplam 83, bekleyen 40, başarı %51, düz getiri %1, ağırlık 1
- MS 1: toplam 751, bekleyen 527, başarı %51, düz getiri %-18, ağırlık 0.94
- KG Yok: toplam 193, bekleyen 106, başarı %46, düz getiri %-21, ağırlık 0.94
- MS X: toplam 21, bekleyen 10, başarı %27, düz getiri %-30, ağırlık 1
- İkinci Yarı KG Yok: toplam 38, bekleyen 38, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 99, bekleyen 99, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-25 | Meksika Liga MX Apertura | Atlante - Monterrey | 2.5 Alt | pending | 69/100
- 2026-09-25 | ABD USL | El Paso Locomo - Tulsa Roughneck | MS 1 | pending | 53/100
- 2026-09-25 | Meksika Liga MX Apertura | Club Tijuana - Atlas | 2.5 Üst | pending | 68/100
- 2026-09-25 | CONCACAF Uluslar Ligi Lig B Grup B | Barbados - St. Lucia | 2.5 Alt | pending | 50/100
- 2026-09-25 | Meksika Ascenso MX Apertura | Correcaminos U - Jaiba Brava | 2.5 Alt | pending | 57/100
- 2026-09-25 | Kanada Premier Lig | Cavalry - Supra Du Quebec | MS 1 | pending | 51/100
- 2026-09-25 | Kolombiya Primera A Clausura | Once Caldas - Bucaramanga | KG Var | pending | 74/100
- 2026-09-25 | Yeni Zelanda Bölgesel Ligler Ulusal Lig | Wellington Pho - Auckland United | MS 2 | pending | 51/100
- 2026-09-25 | Yeni Zelanda Bölgesel Ligler Ulusal Lig | Ferrymead Bays - Eastern Suburbs | 2.5 Alt | pending | 48/100
- 2026-09-25 | Japonya J3 Lig | Zweigen Kanaza - Gainare Tottori | KG Var | pending | 55/100
- 2026-09-25 | CONCACAF Uluslar A Ligi, Grp B | Honduras - Surinam | MS 1 | pending | 48/100
- 2026-09-25 | Meksika Liga MX Kadınlar | Cruz Azul (K) - Guadalajara (K) | MS 2 | pending | 41/100
- 2026-09-25 | CONCACAF Uluslar A Ligi, Grp B | El Salvador - Martinik | 2.5 Alt | pending | 55/100
- 2026-09-25 | Şili Kupa Son 16 Turu | Colo Colo (0) - (0) Audax Italiano | MS 1 | pending | 50/100
- 2026-09-25 | Kolombiya Kupa 2.Tur | Union Magdalen (0) - (2) Santa Fe | 2.5 Alt | pending | 56/100

