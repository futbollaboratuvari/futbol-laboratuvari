# Robot Öğrenme Hafızası Raporu

Oluşturma: 17.09.2026 22:21:53

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1085
- Kazanan tahmin: 232
- Kaybeden tahmin: 183
- Lig sayısı: 276
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
- 2.5 Alt: toplam 603, bekleyen 444, başarı %60, düz getiri %2, ağırlık 1
- KG Var: toplam 14, bekleyen 2, başarı %58, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 159, bekleyen 89, başarı %56, düz getiri %0, ağırlık 1
- MS 1: toplam 480, bekleyen 358, başarı %53, düz getiri %-13, ağırlık 1
- MS 2: toplam 235, bekleyen 186, başarı %51, düz getiri %-4, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-17 | AFC Şampiyonlar Ligi 2 Grup H | Phnom Penh Cro - Kuching Fa | MS 1 | pending | 45/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Crystal Palace - Lech Poznan | MS 1 | pending | 67/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Viktoria Plzen - Union St.G | MS 1 | pending | 46/100
- 2026-09-17 | Rusya FNL | Olimpiyets - Leningradets | MS 1 | pending | 59/100
- 2026-09-17 | Ekvador Pro Lig Serie B Küme Düşme Grubu | Santo Domingo - El Nacional | 2.5 Alt | pending | 48/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Levski Sofya - Salzburg | MS 2 | pending | 48/100
- 2026-09-17 | Uruguay Kupa Ön Eleme Turu Grup 4 | Central Espano - Oriental | 2.5 Alt | pending | 56/100
- 2026-09-17 | Rusya FNL | Torpedo Moskov - Veles | 2.5 Alt | pending | 56/100
- 2026-09-17 | Estonya Esiliiga A | Viimsi Mrjk - Tartu Welco | MS 2 | pending | 44/100
- 2026-09-17 | Ekvador Pro Lig Serie B Küme Düşme Grubu | 22 De Julio - Cumbaya | MS 2 | pending | 48/100
- 2026-09-17 | Mısır Premier Lig | Enppi - Pyramids Fc | 2.5 Alt | pending | 53/100
- 2026-09-17 | Mısır 2. Lig | El Daklyeh - Tersana | MS 2 | pending | 43/100
- 2026-09-17 | Rusya FNL | Olimpiyets - Leningradets | 2.5 Alt | pending | 50/100
- 2026-09-17 | ABD USL | Birmingham Leg - New Mexico Unit | MS 2 | lost | 55/100
- 2026-09-17 | AFC Şampiyonlar Ligi 2 Grup H | Kitchee Footba - Gangwon | MS 1 | lost | 58/100

