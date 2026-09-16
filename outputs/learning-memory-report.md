# Robot Öğrenme Hafızası Raporu

Oluşturma: 17.09.2026 01:55:56

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1131
- Kazanan tahmin: 205
- Kaybeden tahmin: 164
- Lig sayısı: 284
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 596, bekleyen 458, başarı %61, düz getiri %4, ağırlık 1
- KG Var: toplam 13, bekleyen 4, başarı %56, düz getiri %1, ağırlık 1
- 2.5 Üst: toplam 160, bekleyen 95, başarı %55, düz getiri %1, ağırlık 1
- MS 1: toplam 491, bekleyen 382, başarı %51, düz getiri %-14, ağırlık 1
- MS 2: toplam 232, bekleyen 188, başarı %50, düz getiri %-7, ağırlık 1
- MS X: toplam 8, bekleyen 4, başarı %50, düz getiri %22, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-17 | Güney Afrika PSL | Orlando Pirate - Durban City | 2.5 Alt | pending | 56/100
- 2026-09-17 | Rusya Premier Lig | Makhachkala - Cska Moskova | 2.5 Üst | pending | 69/100
- 2026-09-17 | Sırbistan Süper Lig | Zeleznicar Pan - Kizilyildiz | MS 2 | pending | 57/100
- 2026-09-17 | Irak Premier Lig | Al Zawraa - Al Gharraf | MS 1 | pending | 56/100
- 2026-09-17 | Ekvador Pro Lig Serie B Şampiyonluk Grubu | Independiente - Atletico Fc | 2.5 Alt | pending | 59/100
- 2026-09-17 | Uruguay Kupa Ön Eleme Turu Grup 4 | Central Espano - Oriental | MS 1 | pending | 57/100
- 2026-09-17 | Uruguay Kupa Ön Eleme Turu Grup 4 | Juventud Dl Pi - Racing Montevid | 2.5 Alt | pending | 65/100
- 2026-09-17 | Fransa Ligue 3 | Bastia - Cannes | 2.5 Alt | pending | 54/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Beşiktaş - Marsilya | MS 1 | pending | 64/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Celtic - Ferencvaros | MS 1 | pending | 56/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Viktoria Plzen - Union St.G | 2.5 Üst | pending | 56/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Lillestrom - Torreense | MS 1 | pending | 59/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Real Sociedad - Bournemouth | MS 2 | pending | 55/100
- 2026-09-17 | İngiltere 1.Lig | Afc Wimbledon - Mk Dons | 2.5 Üst | pending | 58/100
- 2026-09-17 | İtalya Serie C Grup A | Renate - Dolomiti Bellun | 2.5 Alt | pending | 55/100

