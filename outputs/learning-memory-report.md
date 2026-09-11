# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 00:48:50

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1140
- Kazanan tahmin: 192
- Kaybeden tahmin: 168
- Lig sayısı: 273
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 221, bekleyen 139, başarı %61, düz getiri %6, ağırlık 1
- MS 2: toplam 230, bekleyen 181, başarı %55, düz getiri %-3, ağırlık 1
- MS 1: toplam 496, bekleyen 392, başarı %55, düz getiri %-10, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 546, bekleyen 424, başarı %47, düz getiri %-24, ağırlık 0.94
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | ABD USL | New Mexico Uni - Indy Eleven | MS 1 | pending | 50/100
- 2026-09-12 | Honduras Ulusal Lig Apertura | Estrella Roja - Platense | 2.5 Üst | pending | 82/100
- 2026-09-12 | Kosta Rika Premier Lig Apertura | Perez Zeledon - Ad San Carlos | 2.5 Alt | pending | 57/100
- 2026-09-12 | ABD USL | Colorado Sprin - San Antonio | 2.5 Alt | pending | 57/100
- 2026-09-12 | Meksika Liga MX Apertura | Atlante - Pachuca | 2.5 Alt | pending | 56/100
- 2026-09-12 | Meksika Kadınlar Liga MX Apertura | Atlas (K) - Atlante (K) | MS 1 | pending | 49/100
- 2026-09-12 | Meksika Liga MX Apertura | Club Tijuana - Queretaro | 2.5 Üst | pending | 64/100
- 2026-09-12 | Arjantin Prim B Metro | Ituzaingo - Club Comunicaci | MS 2 | pending | 52/100
- 2026-09-12 | Arjantin Premier Lig 2. Aşama | Defensa Justic - Gimnasia Mendoz | 2.5 Alt | pending | 57/100
- 2026-09-12 | Arjantin Prim B Metro | De Merlo - Real Pilar | 2.5 Alt | pending | 47/100
- 2026-09-12 | ABD USL Lig 1 | One Knoxville - Naples | MS 1 | pending | 62/100
- 2026-09-12 | Kolombiya Primera A Clausura | Jaguares - Fortaleza | 2.5 Üst | pending | 62/100
- 2026-09-12 | Brezilya Serie A | Coritiba - Atletico Pr | 2.5 Üst | pending | 74/100
- 2026-09-12 | Peru Premier Lig Clausura | Cusco Fc - Melgar | 2.5 Üst | pending | 68/100
- 2026-09-12 | Bolivya Premier Lig | Real Potosi - Oriente Petrole | MS 1 | pending | 55/100

