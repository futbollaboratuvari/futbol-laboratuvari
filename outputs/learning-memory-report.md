# Robot Öğrenme Hafızası Raporu

Oluşturma: 17.09.2026 03:10:40

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1110
- Kazanan tahmin: 219
- Kaybeden tahmin: 171
- Lig sayısı: 283
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 598, bekleyen 451, başarı %60, düz getiri %3, ağırlık 1
- KG Var: toplam 14, bekleyen 2, başarı %58, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 161, bekleyen 95, başarı %56, düz getiri %2, ağırlık 1
- MS 1: toplam 486, bekleyen 373, başarı %53, düz getiri %-12, ağırlık 1
- MS 2: toplam 232, bekleyen 184, başarı %52, düz getiri %-2, ağırlık 1
- MS X: toplam 9, bekleyen 5, başarı %50, düz getiri %22, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-17 | Kolombiya Primera A Clausura | Bucaramanga - Independiente M | 2.5 Üst | pending | 67/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Real Sociedad - Bournemouth | MS X | pending | 60/100
- 2026-09-17 | İspanya LaLiga | Malaga - Villarreal | KG Var | pending | 63/100
- 2026-09-17 | Mısır 2. Lig | Ismaily - Haras El Hodood | 2.5 Alt | pending | 50/100
- 2026-09-17 | ABD USL Lig 1 | Fort Wayne - One Knoxville | 2.5 Alt | pending | 61/100
- 2026-09-17 | ABD MLS Next Pro | Real Monarchs - Minnesota Unite | 2.5 Alt | pending | 48/100
- 2026-09-17 | Güney Afrika PSL | Orlando Pirate - Durban City | 2.5 Alt | pending | 56/100
- 2026-09-17 | Rusya Premier Lig | Makhachkala - Cska Moskova | 2.5 Üst | pending | 71/100
- 2026-09-17 | Sırbistan Süper Lig | Zeleznicar Pan - Kizilyildiz | MS 2 | pending | 57/100
- 2026-09-17 | Irak Premier Lig | Al Zawraa - Al Gharraf | MS 1 | pending | 56/100
- 2026-09-17 | Ekvador Pro Lig Serie B Şampiyonluk Grubu | Independiente - Atletico Fc | 2.5 Alt | pending | 59/100
- 2026-09-17 | Uruguay Kupa Ön Eleme Turu Grup 4 | Central Espano - Oriental | MS 1 | pending | 57/100
- 2026-09-17 | Uruguay Kupa Ön Eleme Turu Grup 4 | Juventud Dl Pi - Racing Montevid | 2.5 Alt | pending | 65/100
- 2026-09-17 | Fransa Ligue 3 | Bastia - Cannes | 2.5 Alt | pending | 54/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Beşiktaş - Marsilya | MS 1 | pending | 64/100

