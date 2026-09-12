# Robot Öğrenme Hafızası Raporu

Oluşturma: 13.09.2026 00:43:32

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1204
- Kazanan tahmin: 149
- Kaybeden tahmin: 147
- Lig sayısı: 263
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 533, bekleyen 429, başarı %58, düz getiri %-4, ağırlık 1
- 2.5 Üst: toplam 225, bekleyen 151, başarı %55, düz getiri %0, ağırlık 1
- MS X: toplam 5, bekleyen 3, başarı %50, düz getiri %61, ağırlık 1
- MS 1: toplam 512, bekleyen 438, başarı %45, düz getiri %-21, ağırlık 1
- MS 2: toplam 217, bekleyen 180, başarı %35, düz getiri %-30, ağırlık 1
- KG Var: toplam 8, bekleyen 3, başarı %20, düz getiri %-59, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-13 | ABD MLS Next Pro | New York City - Connecticut Uni | 2.5 Alt | pending | 50/100
- 2026-09-13 | ABD MLS Next Pro | Swope Park Ran - Los Angeles Ii | MS 2 | pending | 51/100
- 2026-09-13 | Arjantin Premier Lig 2. Aşama | Huracan - Racing Club | MS 1 | pending | 57/100
- 2026-09-13 | ABD MLS Next Pro | Austin Ii - Colorado Rapids | MS 1 | pending | 57/100
- 2026-09-13 | ABD MLS Next Pro | North Texas - Houston Dynamo | MS 2 | pending | 44/100
- 2026-09-13 | ABD MLS | San Diego - Philadelphia | MS 2 | pending | 60/100
- 2026-09-13 | Meksika Liga MX Apertura | Santos Laguna - Fc Juarez | 2.5 Alt | pending | 57/100
- 2026-09-13 | Guatemala Ulusal Lig Apertura | Municipal - Malacateco | 2.5 Alt | pending | 70/100
- 2026-09-13 | Meksika Liga MX Apertura | Guadalajara - Pumas Unam | MS 1 | pending | 68/100
- 2026-09-13 | Kolombiya Primera A Clausura | Depor Cucuta - Los Millionario | 2.5 Üst | pending | 55/100
- 2026-09-13 | Honduras Ulusal Lig Apertura | Atlético Indep - Juticalpa | MS 1 | pending | 55/100
- 2026-09-13 | ABD MLS Next Pro | Ventura County - Tacoma Defiance | MS 1 | pending | 48/100
- 2026-09-13 | ABD MLS Next Pro | San Jose Earth - Real Monarchs | MS 1 | pending | 55/100
- 2026-09-13 | Brezilya Serie B | Novorizontino - Cuiaba | MS 1 | pending | 68/100
- 2026-09-13 | Brezilya Serie B | Fortaleza Ce - Ceara | 2.5 Alt | pending | 73/100

