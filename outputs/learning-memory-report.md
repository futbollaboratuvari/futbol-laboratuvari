# Robot Öğrenme Hafızası Raporu

Oluşturma: 20.09.2026 04:23:52

## Özet

- Toplam tahmin: 2097
- Bekleyen tahmin: 1745
- Kazanan tahmin: 197
- Kaybeden tahmin: 155
- Lig sayısı: 336
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 139, bekleyen 107, başarı %72, düz getiri %29, ağırlık 1
- KG Yok: toplam 102, bekleyen 88, başarı %57, düz getiri %0, ağırlık 1
- 2.5 Alt: toplam 653, bekleyen 548, başarı %56, düz getiri %-5, ağırlık 1
- MS 1: toplam 570, bekleyen 478, başarı %55, düz getiri %-6, ağırlık 1
- 2.5 Üst: toplam 225, bekleyen 170, başarı %55, düz getiri %-4, ağırlık 1
- MS 2: toplam 290, bekleyen 256, başarı %50, düz getiri %-8, ağırlık 1
- 3.5 Üst: toplam 56, bekleyen 41, başarı %47, düz getiri %-6, ağırlık 1
- MS X: toplam 14, bekleyen 9, başarı %40, düz getiri %2, ağırlık 1
- İlk Yarı KG Yok: toplam 3, bekleyen 3, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 6, bekleyen 6, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 2, bekleyen 2, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-20 | Meksika Liga MX Apertura | Toluca - Santos Laguna | KG Yok | pending | 73/100
- 2026-09-20 | Arjantin Premier Lig 2. Aşama | Velez Sarsfiel - Tigre | KG Yok | pending | 65/100
- 2026-09-20 | Guatemala Ulusal Lig Apertura | Malacateco - Mixco | 2.5 Alt | pending | 72/100
- 2026-09-20 | Kolombiya Primera A Clausura | Llaneros - Atletico Nacion | 2.5 Üst | pending | 65/100
- 2026-09-20 | Meksika Liga MX Apertura | Pachuca - Club Tijuana | 2.5 Alt | pending | 69/100
- 2026-09-20 | Kosta Rika Primera Lig, Açılış | Ad San Carlos - Cs Cartagines | 2.5 Alt | pending | 67/100
- 2026-09-20 | Meksika Primera Ligi, Açılış | Queretaro - Club Leon | 2.5 Alt | pending | 60/100
- 2026-09-20 | Nikaragua Premier Lig Apertura | Rancho Santana - Managua | MS 2 | pending | 56/100
- 2026-09-20 | ABD USL Lig 1 | Spokane Veloci - Athletic Club B | 2.5 Üst | pending | 65/100
- 2026-09-20 | Meksika Kadınlar Liga MX Apertura | Atletico San L - Pachuca (K) | MS 2 | pending | 54/100
- 2026-09-20 | Kolombiya Primera A Clausura | Deportes Tolim - America De Cali | 2.5 Alt | pending | 64/100
- 2026-09-20 | Ekvador Pro Lig Şampiyonluk Grubu | Ldu Quito - Univ Catolica ( | 2.5 Üst | pending | 72/100
- 2026-09-20 | El Salvador Primera Lig Apertura | Firpo - Balboa | KG Yok | pending | 72/100
- 2026-09-20 | ABD USL | Sacramento Rep - San Antonio | 2.5 Alt | pending | 64/100
- 2026-09-20 | Meksika Ascenso MX Apertura | Cd Tapatio - Tlaxcala | MS 1 | pending | 50/100

