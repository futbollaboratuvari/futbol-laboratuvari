# Robot Öğrenme Hafızası Raporu

Oluşturma: 17.09.2026 16:38:09

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1089
- Kazanan tahmin: 233
- Kaybeden tahmin: 178
- Lig sayısı: 277
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
- 2.5 Alt: toplam 603, bekleyen 447, başarı %60, düz getiri %3, ağırlık 1
- KG Var: toplam 14, bekleyen 2, başarı %58, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 161, bekleyen 92, başarı %58, düz getiri %5, ağırlık 1
- MS 1: toplam 479, bekleyen 358, başarı %53, düz getiri %-12, ağırlık 1
- MS 2: toplam 234, bekleyen 184, başarı %52, düz getiri %-2, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-17 | Ekvador Pro Lig Serie B Küme Düşme Grubu | 22 De Julio - Cumbaya | MS 2 | pending | 46/100
- 2026-09-17 | Mısır Premier Lig | Enppi - Pyramids Fc | 2.5 Alt | pending | 55/100
- 2026-09-17 | Mısır 2. Lig | El Daklyeh - Tersana | MS 2 | pending | 43/100
- 2026-09-17 | Rusya FNL | Olimpiyets - Leningradets | 2.5 Alt | pending | 50/100
- 2026-09-17 | ABD USL | Birmingham Leg - New Mexico Unit | MS 2 | lost | 55/100
- 2026-09-17 | AFC Şampiyonlar Ligi 2 Grup H | Kitchee Footba - Gangwon | MS 1 | pending | 58/100
- 2026-09-17 | Kadınlar U20 Dünya Kupası Son 16 Turu | Fransa U20 (K) - Kanada U20 (K) | 2.5 Alt | pending | 53/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Viktoria Plzen - Union St.G | 2.5 Alt | pending | 53/100
- 2026-09-17 | Meksika Ascenso MX Apertura | Durango - Cruz Azul Hidal | 2.5 Alt | pending | 56/100
- 2026-09-17 | Japonya J2 Lig | Vanraure - Tegevajaro Miya | 2.5 Alt | pending | 56/100
- 2026-09-17 | Ruanda Ulusal Futbol Ligi | Rayon Sports - Sunrise | 2.5 Alt | pending | 57/100
- 2026-09-17 | Uganda Premier Lig | Express - Kitara | 2.5 Alt | pending | 50/100
- 2026-09-17 | Tunus 1.Lig | Stade Tunis - Club Africain | MS X | pending | 43/100
- 2026-09-17 | Nijerya NPFL | Enugu Rangers - Nasarawa United | 2.5 Alt | pending | 55/100
- 2026-09-17 | Rusya Premier Lig | Rostov - Dinamo Moskova | 2.5 Üst | pending | 61/100

