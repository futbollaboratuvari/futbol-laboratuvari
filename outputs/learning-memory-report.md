# Robot Öğrenme Hafızası Raporu

Oluşturma: 22.09.2026 08:02:15

## Özet

- Toplam tahmin: 2660
- Bekleyen tahmin: 1834
- Kazanan tahmin: 419
- Kaybeden tahmin: 407
- Lig sayısı: 376
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 378, bekleyen 305, başarı %57, düz getiri %5, ağırlık 1
- KG Var: toplam 175, bekleyen 92, başarı %54, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 795, bekleyen 561, başarı %52, düz getiri %-13, ağırlık 0.941
- 2.5 Üst: toplam 283, bekleyen 157, başarı %52, düz getiri %-9, ağırlık 1
- MS 1: toplam 701, bekleyen 507, başarı %50, düz getiri %-19, ağırlık 0.94
- 3.5 Üst: toplam 67, bekleyen 29, başarı %47, düz getiri %-6, ağırlık 1
- KG Yok: toplam 156, bekleyen 87, başarı %41, düz getiri %-31, ağırlık 1
- MS X: toplam 21, bekleyen 12, başarı %33, düz getiri %-15, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 20, bekleyen 20, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 19, bekleyen 19, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 8, bekleyen 8, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-22 | Şili Kupa Son 16 Turu | Cobreloa - Coquimbo Unido | 2.5 Alt | pending | 52/100
- 2026-09-22 | Kolombiya Primera A Clausura | Santa Fe - Deportivo Cali | 2.5 Üst | pending | 70/100
- 2026-09-22 | Şili Kupası | Audax Italiano - Colo Colo | 2.5 Alt | pending | 61/100
- 2026-09-22 | Kolombiya Primera A Clausura | Independiente - Jaguares | MS X | pending | 57/100
- 2026-09-22 | Kolombiya Primera B Clausura | Real Santander - Orsomarso | 2.5 Alt | pending | 52/100
- 2026-09-22 | UEFA Kadınlar Şampiyonlar Ligi Lig Aşaması | Juventus (K) - Benfica (K) | MS 1 | pending | 48/100
- 2026-09-22 | Şili Kupa Son 16 Turu | Puerto Montt - Atletico Nublen | 2.5 Alt | pending | 52/100
- 2026-09-22 | Kolombiya Primera B Clausura | Independiente - Internacional P | 2.5 Alt | pending | 57/100
- 2026-09-22 | UEFA Kadınlar Şampiyonlar Ligi Lig Aşaması | Real Madrid (K - Psg (K) | MS 1 | pending | 48/100
- 2026-09-22 | İngiltere Non League Premier Güney | Chichester Cit - Chertsey Town | MS 2 | pending | 44/100
- 2026-09-22 | İngiltere Non League Premier Güney | Plymouth Parkw - Frome Town | MS 1 | pending | 42/100
- 2026-09-22 | İngiltere Non League Premier Güney Merkez | Bury Town - Hitchin Town | MS 1 | pending | 52/100
- 2026-09-22 | İngiltere Non League Premier Güney Merkez | Stratford Town - Bromsgrove Spor | 2.5 Üst | pending | 54/100
- 2026-09-22 | İngiltere Non League Premier Güney Merkez | Leiston - Peterborough Sp | MS 1 | pending | 41/100
- 2026-09-22 | İngiltere Non League Premier Güney Merkez | Rushall Olympi - Kettering | 2.5 Alt | pending | 47/100

