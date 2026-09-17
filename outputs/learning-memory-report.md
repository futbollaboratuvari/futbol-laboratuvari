# Robot Öğrenme Hafızası Raporu

Oluşturma: 17.09.2026 07:56:49

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1095
- Kazanan tahmin: 227
- Kaybeden tahmin: 178
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

- 2.5 Alt: toplam 597, bekleyen 443, başarı %59, düz getiri %1, ağırlık 1
- KG Var: toplam 14, bekleyen 2, başarı %58, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 161, bekleyen 93, başarı %56, düz getiri %2, ağırlık 1
- MS 1: toplam 487, bekleyen 370, başarı %54, düz getiri %-10, ağırlık 1
- MS 2: toplam 232, bekleyen 182, başarı %52, düz getiri %-2, ağırlık 1
- MS X: toplam 9, bekleyen 5, başarı %50, düz getiri %22, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-17 | Kadınlar U20 Dünya Kupası Son 16 Turu | Kuzey Kore U20 - Japonya U20 (K) | 2.5 Alt | pending | 55/100
- 2026-09-17 | Kazakistan Premier Lig | Astana - Kairat Almaty | 2.5 Üst | pending | 53/100
- 2026-09-17 | AFC Şampiyonlar Ligi 2 Grup F | Lion City - Bg Pathum Unite | MS 1 | pending | 50/100
- 2026-09-17 | Kolombiya Primera A Clausura | Bucaramanga - Independiente M | 2.5 Üst | pending | 70/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Real Sociedad - Bournemouth | MS X | pending | 60/100
- 2026-09-17 | İspanya LaLiga | Malaga - Villarreal | KG Var | pending | 63/100
- 2026-09-17 | Mısır 2. Lig | Ismaily - Haras El Hodood | 2.5 Alt | pending | 50/100
- 2026-09-17 | ABD USL Lig 1 | Fort Wayne - One Knoxville | 2.5 Alt | lost | 61/100
- 2026-09-17 | ABD MLS Next Pro | Real Monarchs - Minnesota Unite | 2.5 Alt | pending | 48/100
- 2026-09-17 | Güney Afrika PSL | Orlando Pirate - Durban City | 2.5 Alt | pending | 56/100
- 2026-09-17 | Rusya Premier Lig | Makhachkala - Cska Moskova | 2.5 Üst | pending | 72/100
- 2026-09-17 | Sırbistan Süper Lig | Zeleznicar Pan - Kizilyildiz | MS 2 | pending | 57/100
- 2026-09-17 | Irak Premier Lig | Al Zawraa - Al Gharraf | MS 1 | pending | 56/100
- 2026-09-17 | Ekvador Pro Lig Serie B Şampiyonluk Grubu | Independiente - Atletico Fc | 2.5 Alt | won | 68/100
- 2026-09-17 | Uruguay Kupa Ön Eleme Turu Grup 4 | Central Espano - Oriental | MS 1 | pending | 56/100

