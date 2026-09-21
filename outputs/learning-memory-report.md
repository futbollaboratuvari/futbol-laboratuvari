# Robot Öğrenme Hafızası Raporu

Oluşturma: 22.09.2026 02:24:37

## Özet

- Toplam tahmin: 2540
- Bekleyen tahmin: 1727
- Kazanan tahmin: 416
- Kaybeden tahmin: 397
- Lig sayısı: 352
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 353, bekleyen 282, başarı %56, düz getiri %2, ağırlık 1
- KG Var: toplam 169, bekleyen 89, başarı %55, düz getiri %-3, ağırlık 1
- 2.5 Alt: toplam 771, bekleyen 540, başarı %53, düz getiri %-12, ağırlık 0.946
- 2.5 Üst: toplam 273, bekleyen 147, başarı %52, düz getiri %-9, ağırlık 1
- MS 1: toplam 662, bekleyen 470, başarı %50, düz getiri %-18, ağırlık 0.94
- 3.5 Üst: toplam 65, bekleyen 27, başarı %47, düz getiri %-6, ağırlık 1
- KG Yok: toplam 147, bekleyen 81, başarı %42, düz getiri %-28, ağırlık 1
- MS X: toplam 21, bekleyen 12, başarı %33, düz getiri %-15, ağırlık 1
- İkinci Yarı KG Yok: toplam 17, bekleyen 17, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 18, bekleyen 18, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-22 | Kolombiya Primera B Clausura | Real Santander - Orsomarso | 2.5 Alt | pending | 52/100
- 2026-09-22 | Kolombiya Primera A Clausura | Independiente - Jaguares | MS X | pending | 57/100
- 2026-09-22 | Şili Kupa Son 16 Turu | Cobreloa - Coquimbo Unido | 2.5 Alt | pending | 52/100
- 2026-09-22 | Kolombiya Primera A Clausura | Santa Fe - Deportivo Cali | 2.5 Üst | pending | 70/100
- 2026-09-22 | UEFA Kadınlar Şampiyonlar Ligi Lig Aşaması | Juventus (K) - Benfica (K) | MS 1 | pending | 50/100
- 2026-09-22 | Şili Kupa Son 16 Turu | Puerto Montt - Atletico Nublen | 2.5 Alt | pending | 51/100
- 2026-09-22 | Kolombiya Primera B Clausura | Independiente - Internacional P | 2.5 Alt | pending | 57/100
- 2026-09-22 | UEFA Kadınlar Şampiyonlar Ligi Lig Aşaması | Real Madrid (K - Psg (K) | MS 1 | pending | 48/100
- 2026-09-22 | Kolombiya Primera B Clausura | Atletico Fc - Tigres Fc | 2.5 Alt | pending | 55/100
- 2026-09-22 | Paraguay Kupa Son 16 Turu | 2 De Mayo - Sol De America | 2.5 Alt | pending | 52/100
- 2026-09-22 | Şili Kupa Son 16 Turu | Audax Italiano - Colo Colo | 2.5 Alt | pending | 61/100
- 2026-09-22 | Paraguay Kupası | 2 De Mayo - Sol De America | 2.5 Alt | pending | 52/100
- 2026-09-22 | Şili Kupası | Audax Italiano - Colo Colo | 2.5 Alt | pending | 61/100
- 2026-09-22 | Kolombiya Primera B, Kapanış | Atletico Fc - Tigres Fc | 2.5 Alt | pending | 55/100
- 2026-09-21 | Ekvador Pro Lig Küme Düşme Grubu | Manta - Orense | KG Yok | lost | 60/100

