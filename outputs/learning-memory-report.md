# Robot Öğrenme Hafızası Raporu

Oluşturma: 17.09.2026 10:52:47

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1087
- Kazanan tahmin: 234
- Kaybeden tahmin: 179
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

- MS X: toplam 8, bekleyen 5, başarı %67, düz getiri %63, ağırlık 1
- 2.5 Alt: toplam 597, bekleyen 440, başarı %60, düz getiri %2, ağırlık 1
- KG Var: toplam 14, bekleyen 2, başarı %58, düz getiri %4, ağırlık 1
- 2.5 Üst: toplam 162, bekleyen 92, başarı %57, düz getiri %4, ağırlık 1
- MS 1: toplam 488, bekleyen 366, başarı %53, düz getiri %-11, ağırlık 1
- MS 2: toplam 231, bekleyen 182, başarı %53, düz getiri %0, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-17 | Mısır 2. Lig | Derot - El Harby | 2.5 Alt | pending | 57/100
- 2026-09-17 | Brezilya Serie A | Botafogo - Gremio | MS 1 | won | 64/100
- 2026-09-17 | ABD USL Lig 1 | Chattanooga Re - Forward Madison | 2.5 Alt | won | 60/100
- 2026-09-17 | Copa Sudamericana Çeyrek Final | Atletico Mg (0) - (2) Santos | 2.5 Üst | won | 52/100
- 2026-09-17 | Arjantin Kupa Çeyrek Final | Rivadavia - Atletico Tucuma | 2.5 Alt | won | 57/100
- 2026-09-17 | Kadınlar U20 Dünya Kupası Son 16 Turu | Kuzey Kore U20 - Japonya U20 (K) | 2.5 Alt | pending | 55/100
- 2026-09-17 | Kazakistan Premier Lig | Astana - Kairat Almaty | 2.5 Üst | pending | 53/100
- 2026-09-17 | AFC Şampiyonlar Ligi 2 Grup F | Lion City - Bg Pathum Unite | MS 1 | pending | 49/100
- 2026-09-17 | Kolombiya Primera A Clausura | Bucaramanga - Independiente M | 2.5 Üst | pending | 70/100
- 2026-09-17 | UEFA Avrupa Ligi Lig Aşaması | Real Sociedad - Bournemouth | MS X | pending | 60/100
- 2026-09-17 | İspanya LaLiga | Malaga - Villarreal | KG Var | pending | 63/100
- 2026-09-17 | Mısır 2. Lig | Ismaily - Haras El Hodood | 2.5 Alt | pending | 50/100
- 2026-09-17 | ABD USL Lig 1 | Fort Wayne - One Knoxville | 2.5 Alt | lost | 61/100
- 2026-09-17 | ABD MLS Next Pro | Real Monarchs - Minnesota Unite | 2.5 Alt | pending | 48/100
- 2026-09-17 | Güney Afrika PSL | Orlando Pirate - Durban City | 2.5 Alt | pending | 56/100

