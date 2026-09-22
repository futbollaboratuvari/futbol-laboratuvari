# Robot Öğrenme Hafızası Raporu

Oluşturma: 22.09.2026 21:11:00

## Özet

- Toplam tahmin: 2721
- Bekleyen tahmin: 1895
- Kazanan tahmin: 419
- Kaybeden tahmin: 407
- Lig sayısı: 378
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 382, bekleyen 309, başarı %57, düz getiri %5, ağırlık 1
- KG Var: toplam 185, bekleyen 102, başarı %54, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 803, bekleyen 569, başarı %52, düz getiri %-13, ağırlık 0.941
- 2.5 Üst: toplam 286, bekleyen 160, başarı %52, düz getiri %-9, ağırlık 1
- MS 1: toplam 713, bekleyen 519, başarı %50, düz getiri %-19, ağırlık 0.94
- 3.5 Üst: toplam 69, bekleyen 31, başarı %47, düz getiri %-6, ağırlık 1
- KG Yok: toplam 159, bekleyen 90, başarı %41, düz getiri %-31, ağırlık 1
- MS X: toplam 21, bekleyen 12, başarı %33, düz getiri %-15, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 28, bekleyen 28, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 26, bekleyen 26, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-22 | Kolombiya Primera A Clausura | Santa Fe - Deportivo Cali | 2.5 Üst | pending | 70/100
- 2026-09-22 | Şili Kupa Son 16 Turu | Cobreloa - Coquimbo Unido | 2.5 Alt | pending | 52/100
- 2026-09-22 | Kolombiya Primera A Clausura | Independiente - Jaguares | MS X | pending | 57/100
- 2026-09-22 | Kolombiya Primera B Clausura | Real Santander - Orsomarso | 2.5 Alt | pending | 52/100
- 2026-09-22 | Şili Kupa Son 16 Turu | Puerto Montt - Atletico Nublen | 2.5 Alt | pending | 52/100
- 2026-09-22 | Kolombiya Primera B Clausura | Independiente - Internacional P | MS 1 | pending | 48/100
- 2026-09-22 | Şili Kupası | Audax Italiano - Colo Colo | 2.5 Alt | pending | 60/100
- 2026-09-22 | Kolombiya Primera B, Kapanış | Atletico Fc - Tigres Fc | 2.5 Alt | pending | 55/100
- 2026-09-22 | Brezilya Seri B | Criciuma - Operario | 2.5 Alt | pending | 65/100
- 2026-09-22 | Paraguay Kupası | 2 De Mayo - Sol De America | 2.5 Üst | pending | 53/100
- 2026-09-22 | UEFA Kadınlar Şampiyonlar Ligi Lig Aşaması | Juventus (K) - Benfica (K) | MS 1 | pending | 51/100
- 2026-09-22 | UEFA Kadınlar Şampiyonlar Ligi Lig Aşaması | Real Madrid (K - Psg (K) | MS 1 | pending | 50/100
- 2026-09-22 | İngiltere FA Cup Eleme 2.Tur Tekrar | Farnborough - Uxbridge | MS 1 | pending | 47/100
- 2026-09-22 | İngiltere FA Cup Eleme 2.Tur Tekrar | Chippenham Tow - Yate Town | MS 1 | pending | 40/100
- 2026-09-22 | İngiltere Non League Premier Güney Merkez | Bury Town - Hitchin Town | MS 1 | pending | 53/100

