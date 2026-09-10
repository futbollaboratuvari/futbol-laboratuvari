# Robot Öğrenme Hafızası Raporu

Oluşturma: 11.09.2026 00:13:14

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1100
- Kazanan tahmin: 215
- Kaybeden tahmin: 185
- Lig sayısı: 265
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 240, bekleyen 153, başarı %59, düz getiri %2, ağırlık 1
- MS 1: toplam 486, bekleyen 369, başarı %55, düz getiri %-10, ağırlık 1
- 2.5 Alt: toplam 552, bekleyen 415, başarı %52, düz getiri %-16, ağırlık 1
- MS 2: toplam 216, bekleyen 160, başarı %50, düz getiri %-10, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- MS X: toplam 3, bekleyen 2, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-11 | Arjantin Prim B Metro | Ituzaingo - Club Comunicaci | MS 2 | pending | 52/100
- 2026-09-11 | Arjantin Premier Lig 2. Aşama | Defensa Justic - Gimnasia Mendoz | 2.5 Alt | pending | 64/100
- 2026-09-11 | Arjantin Prim B Metro | De Merlo - Real Pilar | MS 2 | pending | 50/100
- 2026-09-11 | ABD USL Lig 1 | One Knoxville - Naples | MS 1 | pending | 62/100
- 2026-09-11 | Kolombiya Primera A Clausura | Jaguares - Fortaleza | 2.5 Üst | pending | 62/100
- 2026-09-11 | Brezilya Serie A | Coritiba - Atletico Pr | 2.5 Üst | pending | 69/100
- 2026-09-11 | Peru Premier Lig Clausura | Cusco Fc - Melgar | 2.5 Üst | pending | 66/100
- 2026-09-11 | Bolivya Premier Lig | Real Potosi - Oriente Petrole | MS 1 | pending | 56/100
- 2026-09-11 | Ekvador Pro Lig Serie B Küme Düşme Grubu | El Nacional - 22 De Julio | MS 1 | pending | 45/100
- 2026-09-11 | Arjantin Premier Lig 2. Aşama | Boca Juniors - Corboda Santiag | MS 1 | pending | 60/100
- 2026-09-11 | Meksika Liga MX Apertura | Necaxa - Puebla | 2.5 Alt | pending | 58/100
- 2026-09-11 | Arjantin Ulusal Primera Lig | Gimnasia Y Tir - Tristan | MS 1 | pending | 48/100
- 2026-09-11 | Meksika Ascenso MX Apertura | Correcaminos U - Cancun Fc | 2.5 Alt | pending | 58/100
- 2026-09-11 | ABD USL Lig 1 | Athletic Club - New York Cosmos | MS 1 | pending | 60/100
- 2026-09-11 | Meksika Kadınlar Liga MX Apertura | Cruz Azul (K) - Pumas Unam (K) | MS 1 | pending | 47/100

