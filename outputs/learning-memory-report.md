# Robot Öğrenme Hafızası Raporu

Oluşturma: 25.09.2026 20:52:44

## Özet

- Toplam tahmin: 2983
- Bekleyen tahmin: 2000
- Kazanan tahmin: 517
- Kaybeden tahmin: 466
- Lig sayısı: 468
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 367, bekleyen 277, başarı %57, düz getiri %3, ağırlık 1
- 2.5 Alt: toplam 862, bekleyen 574, başarı %56, düz getiri %-8, ağırlık 1
- 2.5 Üst: toplam 299, bekleyen 159, başarı %52, düz getiri %-8, ağırlık 1
- KG Var: toplam 210, bekleyen 112, başarı %52, düz getiri %-8, ağırlık 1
- MS 1: toplam 748, bekleyen 522, başarı %51, düz getiri %-17, ağırlık 0.94
- 3.5 Üst: toplam 86, bekleyen 43, başarı %51, düz getiri %1, ağırlık 1
- KG Yok: toplam 195, bekleyen 108, başarı %46, düz getiri %-21, ağırlık 0.94
- MS X: toplam 21, bekleyen 10, başarı %27, düz getiri %-30, ağırlık 1
- İkinci Yarı KG Yok: toplam 41, bekleyen 41, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 105, bekleyen 105, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-25 | Meksika Liga MX Apertura | Atlante - Monterrey | 2.5 Alt | pending | 69/100
- 2026-09-25 | ABD USL | El Paso Locomo - Tulsa Roughneck | MS 1 | pending | 53/100
- 2026-09-25 | Meksika Liga MX Apertura | Club Tijuana - Atlas | 2.5 Üst | pending | 68/100
- 2026-09-25 | CONCACAF Uluslar Ligi Lig B Grup B | Barbados - St. Lucia | 2.5 Alt | pending | 50/100
- 2026-09-25 | Meksika Ascenso MX Apertura | Correcaminos U - Jaiba Brava | 2.5 Alt | pending | 57/100
- 2026-09-25 | Kanada Premier Lig | Cavalry - Supra Du Quebec | MS 1 | pending | 50/100
- 2026-09-25 | Kolombiya Primera A Clausura | Once Caldas - Bucaramanga | KG Var | pending | 74/100
- 2026-09-25 | Yeni Zelanda Bölgesel Ligler Ulusal Lig | Wellington Pho - Auckland United | MS 2 | pending | 51/100
- 2026-09-25 | Yeni Zelanda Bölgesel Ligler Ulusal Lig | Ferrymead Bays - Eastern Suburbs | 2.5 Alt | pending | 48/100
- 2026-09-25 | Japonya J3 Lig | Zweigen Kanaza - Gainare Tottori | KG Var | pending | 54/100
- 2026-09-25 | Ekvador Pro Lig Serie B Küme Düşme Grubu | El Nacional - Cumbaya | 2.5 Alt | pending | 47/100
- 2026-09-25 | Meksika Liga MX Kadınlar | Cruz Azul (K) - Guadalajara (K) | MS 2 | pending | 43/100
- 2026-09-25 | CONCACAF Uluslar A Ligi, Grp B | El Salvador - Martinik | 2.5 Alt | pending | 55/100
- 2026-09-25 | ABD Championship | Sporting Jax - Loudoun United | 3.5 Üst | pending | 60/100
- 2026-09-25 | CONCACAF Uluslar A Ligi, Grp B | Jamaika - Guatemala | 2.5 Alt | pending | 55/100

