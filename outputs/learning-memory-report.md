# Robot Öğrenme Hafızası Raporu

Oluşturma: 05.09.2026 22:24:38

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1187
- Kazanan tahmin: 172
- Kaybeden tahmin: 141
- Lig sayısı: 246
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 10, bekleyen 7, başarı %67, düz getiri %66, ağırlık 1
- 2.5 Alt: toplam 531, bekleyen 427, başarı %59, düz getiri %-3, ağırlık 1
- 2.5 Üst: toplam 238, bekleyen 159, başarı %58, düz getiri %1, ağırlık 1
- MS 1: toplam 474, bekleyen 382, başarı %50, düz getiri %-17, ağırlık 1
- MS 2: toplam 247, bekleyen 212, başarı %49, düz getiri %-18, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-05 | Arjantin Premier Lig 2. Aşama | Gimnasia Mendo - Boca Juniors | MS 2 | pending | 45/100
- 2026-09-05 | ABD USL | Detroit City - Hartford Athlet | 2.5 Alt | pending | 61/100
- 2026-09-05 | İtalya Serie C Grup B | Vis Pasaro - Ostia Mare Lido | 2.5 Üst | pending | 53/100
- 2026-09-05 | İtalya Serie C Grup C | Bari - Casarano | 2.5 Üst | pending | 53/100
- 2026-09-05 | Hollanda Eredivisie | Ajax - Psv Eindhoven | MS 1 | pending | 46/100
- 2026-09-05 | Arjantin Premier Lig 2. Aşama | San Lorenzo - Talleres | 2.5 Alt | pending | 62/100
- 2026-09-05 | Bolivya Premier Lig | Oriente Petrol - Always Ready | MS 1 | pending | 48/100
- 2026-09-05 | Fransa Ligue 1 | Nice - Le Mans | MS 1 | pending | 55/100
- 2026-09-05 | Brezilya Serie A | Bragantino - Bahia | 2.5 Alt | pending | 57/100
- 2026-09-05 | Hırvatistan 1.HNL | Rijeka - Osijek | 2.5 Alt | pending | 52/100
- 2026-09-05 | İspanya Primera Lig RFEF Grup 1 | Unionistas De - Union Irun | 2.5 Üst | pending | 53/100
- 2026-09-05 | Türkiye TFF 1. Lig | Pendikspor - Ümraniyespor | 2.5 Üst | pending | 53/100
- 2026-09-05 | İspanya Primera Lig RFEF Grup 2 | Ud Ibiza - Rayo Majadahond | 2.5 Alt | pending | 55/100
- 2026-09-05 | Rusya FNL | Pfc Sochi - Olimpiyets | 2.5 Alt | pending | 52/100
- 2026-09-05 | Slovenya 1.SNL | Aluminij - Ask Bravo | 2.5 Üst | pending | 53/100

