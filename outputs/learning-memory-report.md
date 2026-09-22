# Robot Öğrenme Hafızası Raporu

Oluşturma: 22.09.2026 16:31:33

## Özet

- Toplam tahmin: 2683
- Bekleyen tahmin: 1857
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

- MS 2: toplam 379, bekleyen 306, başarı %57, düz getiri %5, ağırlık 1
- KG Var: toplam 180, bekleyen 97, başarı %54, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 798, bekleyen 564, başarı %52, düz getiri %-13, ağırlık 0.941
- 2.5 Üst: toplam 283, bekleyen 157, başarı %52, düz getiri %-9, ağırlık 1
- MS 1: toplam 708, bekleyen 514, başarı %50, düz getiri %-19, ağırlık 0.94
- 3.5 Üst: toplam 68, bekleyen 30, başarı %47, düz getiri %-6, ağırlık 1
- KG Yok: toplam 156, bekleyen 87, başarı %41, düz getiri %-31, ağırlık 1
- MS X: toplam 21, bekleyen 12, başarı %33, düz getiri %-15, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 23, bekleyen 23, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 22, bekleyen 22, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 8, bekleyen 8, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-22 | Kolombiya Primera A Clausura | Santa Fe - Deportivo Cali | 2.5 Üst | pending | 70/100
- 2026-09-22 | Şili Kupa Son 16 Turu | Cobreloa - Coquimbo Unido | 2.5 Alt | pending | 52/100
- 2026-09-22 | Kolombiya Primera A Clausura | Independiente - Jaguares | MS X | pending | 57/100
- 2026-09-22 | Şili Kupa Son 16 Turu | Audax Italiano - Colo Colo | 2.5 Alt | pending | 61/100
- 2026-09-22 | Brezilya Serie B | Criciuma - Operario | 2.5 Alt | pending | 65/100
- 2026-09-22 | Kolombiya Primera B Clausura | Real Santander - Orsomarso | 2.5 Alt | pending | 52/100
- 2026-09-22 | UEFA Kadınlar Şampiyonlar Ligi Lig Aşaması | Juventus (K) - Benfica (K) | MS 1 | pending | 49/100
- 2026-09-22 | Şili Kupa Son 16 Turu | Puerto Montt - Atletico Nublen | 2.5 Alt | pending | 52/100
- 2026-09-22 | Kolombiya Primera B Clausura | Independiente - Internacional P | 2.5 Alt | pending | 57/100
- 2026-09-22 | UEFA Kadınlar Şampiyonlar Ligi Lig Aşaması | Real Madrid (K - Psg (K) | MS 1 | pending | 47/100
- 2026-09-22 | İngiltere FA Cup Eleme 2.Tur Tekrar | Farnborough - Uxbridge | MS 1 | pending | 54/100
- 2026-09-22 | İngiltere FA Cup Eleme 2.Tur Tekrar | Chippenham Tow - Yate Town | MS 1 | pending | 39/100
- 2026-09-22 | İngiltere Non League Premier Güney Merkez | Bury Town - Hitchin Town | MS 1 | pending | 52/100
- 2026-09-22 | İngiltere Non League Premier Güney Merkez | Stratford Town - Bromsgrove Spor | 2.5 Üst | pending | 54/100
- 2026-09-22 | İngiltere Non League Premier Güney Merkez | Leiston - Peterborough Sp | MS 1 | pending | 41/100

