# Robot Öğrenme Hafızası Raporu

Oluşturma: 04.09.2026 13:45:09

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1105
- Kazanan tahmin: 225
- Kaybeden tahmin: 170
- Lig sayısı: 228
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 238, bekleyen 201, başarı %65, düz getiri %7, ağırlık 1
- MS 1: toplam 472, bekleyen 369, başarı %59, düz getiri %-3, ağırlık 1
- 2.5 Üst: toplam 221, bekleyen 129, başarı %59, düz getiri %3, ağırlık 1
- 2.5 Alt: toplam 560, bekleyen 399, başarı %53, düz getiri %-12, ağırlık 1
- MS X: toplam 9, bekleyen 7, başarı %50, düz getiri %24, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-04 | Şili Premier Lig | Concepcion - Audax Italiano | 2.5 Alt | pending | 60/100
- 2026-09-04 | Kosta Rika Premier Lig Apertura | Liberia - Inter San Carlo | MS 2 | pending | 51/100
- 2026-09-04 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Js Saoura - Horoya | 2.5 Alt | pending | 49/100
- 2026-09-04 | Belçika Challenger Pro Lig | Beerschot-Wilr - Patro Eisden | MS 1 | pending | 54/100
- 2026-09-04 | Bahreyn Premier Lig | Al Ittifaq Maq - Al Muharraq | MS 2 | pending | 58/100
- 2026-09-04 | Avusturya ÖFB Kupası 2.Tur | Floridsdorfer - Bregenz | 2.5 Üst | pending | 53/100
- 2026-09-04 | Suudi Arabistan Pro Lig | Abha - Al Ettifaq | MS 2 | pending | 60/100
- 2026-09-04 | Polonya 2.Lig | Stal S Wola - Zawisza Bydgosz | 2.5 Alt | pending | 50/100
- 2026-09-04 | Belarus 1.Lig | Volna Pinsk - Dinamo Minsk Ii | MS 1 | pending | 48/100
- 2026-09-04 | Endonezya Süper Lig | Bali United - Pss Sleman | MS 1 | pending | 55/100
- 2026-09-04 | Tayland 1.Lig | Pattani - Bg Pathum Unite | 2.5 Üst | pending | 54/100
- 2026-09-04 | Guatemala Ulusal Lig Apertura | Antigua Guatem - Aurora | MS 1 | pending | 60/100
- 2026-09-04 | İngiltere FA Cup Eleme 1.Tur | Ossett United - Pontefract Coll | 2.5 Alt | pending | 48/100
- 2026-09-04 | İspanya LaLiga | Real Betis - Real Madrid | MS 2 | pending | 60/100
- 2026-09-04 | İrlanda Premier Lig | Shamrock Rover - Shelbourne | MS 1 | pending | 54/100

