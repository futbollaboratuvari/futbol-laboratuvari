# Robot Öğrenme Hafızası Raporu

Oluşturma: 17.09.2026 12:53:24

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1089
- Kazanan tahmin: 233
- Kaybeden tahmin: 178
- Lig sayısı: 278
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 9, bekleyen 6, başarı %67, düz getiri %63, ağırlık 1
- 2.5 Alt: toplam 602, bekleyen 446, başarı %60, düz getiri %3, ağırlık 1
- KG Var: toplam 14, bekleyen 2, başarı %58, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 162, bekleyen 92, başarı %57, düz getiri %4, ağırlık 1
- MS 2: toplam 232, bekleyen 183, başarı %53, düz getiri %0, ağırlık 1
- MS 1: toplam 481, bekleyen 360, başarı %53, düz getiri %-12, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Viktoria Plzen - Union St.G | 2.5 Alt | pending | 53/100
- 2026-09-17 | Meksika Ascenso MX Apertura | Durango - Cruz Azul Hidal | 2.5 Alt | pending | 56/100
- 2026-09-17 | Japonya J2 Lig | Vanraure - Tegevajaro Miya | 2.5 Alt | pending | 56/100
- 2026-09-17 | Ruanda Ulusal Futbol Ligi | Rayon Sports - Sunrise | 2.5 Alt | pending | 57/100
- 2026-09-17 | Uganda Premier Lig | Express - Kitara | 2.5 Alt | pending | 48/100
- 2026-09-17 | Tunus 1.Lig | Stade Tunis - Club Africain | MS X | pending | 43/100
- 2026-09-17 | Nijerya NPFL | Enugu Rangers - Nasarawa United | 2.5 Alt | pending | 55/100
- 2026-09-17 | Rusya Premier Lig | Rostov - Dinamo Moskova | 2.5 Üst | pending | 61/100
- 2026-09-17 | Gürcistan Erovnuli Liga | Fc Iberia - Dila Gori | 2.5 Alt | pending | 52/100
- 2026-09-17 | Norveç 3.Lig Grup 3 | Stord Sunnhord - Djerv | MS 2 | pending | 55/100
- 2026-09-17 | Azerbaycan 1.Lig | Baku Sportinq - Sabail | MS 2 | pending | 52/100
- 2026-09-17 | Yunanistan Kupa Lig Aşaması | Kalamata - Larisa | 2.5 Alt | pending | 55/100
- 2026-09-17 | Mısır 2. Lig | Tanta - Nasr | MS 2 | pending | 42/100
- 2026-09-17 | Kazakistan Premier Lig | Tobol Kostanay - Yelimay Semey | 2.5 Alt | pending | 48/100
- 2026-09-17 | Mısır 2. Lig | Derot - El Harby | 2.5 Alt | pending | 57/100

