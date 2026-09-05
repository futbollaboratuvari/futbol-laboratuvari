# Robot Öğrenme Hafızası Raporu

Oluşturma: 05.09.2026 18:31:01

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1297
- Kazanan tahmin: 118
- Kaybeden tahmin: 85
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
- MS 1: toplam 474, bekleyen 416, başarı %64, düz getiri %7, ağırlık 1
- MS 2: toplam 246, bekleyen 222, başarı %58, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 532, bekleyen 463, başarı %58, düz getiri %-6, ağırlık 1
- 2.5 Üst: toplam 238, bekleyen 189, başarı %51, düz getiri %-10, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-05 | Arjantin Premier Lig 2. Aşama | San Lorenzo - Talleres | 2.5 Alt | pending | 65/100
- 2026-09-05 | Bolivya Premier Lig | Oriente Petrol - Always Ready | MS 1 | pending | 46/100
- 2026-09-05 | Fransa Ligue 1 | Nice - Le Mans | MS 1 | pending | 55/100
- 2026-09-05 | Brezilya Serie A | Bragantino - Bahia | 2.5 Alt | pending | 57/100
- 2026-09-05 | Hırvatistan 1.HNL | Rijeka - Osijek | 2.5 Alt | pending | 52/100
- 2026-09-05 | İspanya Primera Lig RFEF Grup 1 | Unionistas De - Union Irun | 2.5 Üst | pending | 53/100
- 2026-09-05 | Türkiye TFF 1. Lig | Pendikspor - Ümraniyespor | 2.5 Üst | pending | 53/100
- 2026-09-05 | İspanya Primera Lig RFEF Grup 2 | Ud Ibiza - Rayo Majadahond | 2.5 Alt | pending | 55/100
- 2026-09-05 | Rusya FNL | Pfc Sochi - Olimpiyets | 2.5 Alt | pending | 52/100
- 2026-09-05 | Slovenya 1.SNL | Aluminij - Ask Bravo | 2.5 Üst | pending | 53/100
- 2026-09-05 | Honduras Ulusal Lig Apertura | Atlético Indep - Depor Motagua | 2.5 Üst | pending | 57/100
- 2026-09-05 | İspanya 2. Lig RFEF Grup 3 | Castellonense - Ucam Murcia | 2.5 Alt | pending | 53/100
- 2026-09-05 | Kuveyt Premier Lig | Al Fahaheel - Al Tadhamon | MS 1 | pending | 50/100
- 2026-09-05 | İspanya Primera Lig RFEF Grup 2 | Sant Andreu - Cd Aguilas | MS 1 | pending | 47/100
- 2026-09-05 | Arjantin Premier Lig 2. Aşama | Aldosivi - Banfield | 2.5 Alt | pending | 60/100

