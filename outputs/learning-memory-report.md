# Robot Öğrenme Hafızası Raporu

Oluşturma: 08.09.2026 23:56:46

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1115
- Kazanan tahmin: 203
- Kaybeden tahmin: 182
- Lig sayısı: 239
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 3, bekleyen 2, başarı %100, düz getiri %93, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 237, bekleyen 137, başarı %61, düz getiri %5, ağırlık 1
- 2.5 Alt: toplam 534, bekleyen 396, başarı %56, düz getiri %-8, ağırlık 1
- MS 1: toplam 504, bekleyen 405, başarı %44, düz getiri %-27, ağırlık 0.94
- MS 2: toplam 220, bekleyen 174, başarı %41, düz getiri %-25, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-08 | Paraguay Intermedia Lig | General Caball - Resistencia | 2.5 Üst | pending | 54/100
- 2026-09-08 | ABD USL Kupası Yarı Final | Hartford Athle - Colorado Spring | 2.5 Alt | pending | 45/100
- 2026-09-08 | İngiltere Premier Lig Kupası Grup E | Fleetwood Town - Burnley U21 | MS 1 | pending | 46/100
- 2026-09-08 | İngiltere Ulusal Lig N / S Güney | Chesham United - Billericay Town | MS 1 | pending | 46/100
- 2026-09-08 | İngiltere Ulusal Lig N / S Kuzey | Southport - Morecambe | 2.5 Alt | pending | 54/100
- 2026-09-08 | İngiltere Ulusal Lig N / S Kuzey | Lynn Town - Hednesford Town | 2.5 Üst | pending | 53/100
- 2026-09-08 | İngiltere Ulusal Lig N / S Kuzey | Telford - Oxford City | MS 1 | pending | 42/100
- 2026-09-08 | Güney Kore K Lig 1 | Incheon Utd - Bucheon | 2.5 Üst | won | 59/100
- 2026-09-08 | ABD MLS Next Pro | Toronto Fc Ii - Columbus Crew I | MS 1 | pending | 45/100
- 2026-09-08 | ABD MLS Next Pro | New York City - New York Rb Ii | MS 2 | pending | 51/100
- 2026-09-08 | Copa Sudamericana Çeyrek Final | Santa Fe - Vasco Da Gama | MS 1 | pending | 45/100
- 2026-09-08 | Paraguay Intermedia Lig | General Caball - Resistencia | MS 1 | pending | 48/100
- 2026-09-08 | İngiltere Ulusal Lig N / S Güney | Maidenhead Utd - Torquay | 2.5 Üst | pending | 53/100
- 2026-09-08 | İngiltere FA Cup Eleme 1.Tur Tekrar | Buckhurst Hill - Yaxley | MS 1 | pending | 42/100
- 2026-09-08 | Irak Premier Lig | Al Gharraf - Al Shorta | 2.5 Alt | pending | 55/100

