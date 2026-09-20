# Robot Öğrenme Hafızası Raporu

Oluşturma: 20.09.2026 08:26:50

## Özet

- Toplam tahmin: 2154
- Bekleyen tahmin: 1612
- Kazanan tahmin: 288
- Kaybeden tahmin: 254
- Lig sayısı: 337
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 293, bekleyen 246, başarı %60, düz getiri %13, ağırlık 1
- KG Var: toplam 144, bekleyen 91, başarı %59, düz getiri %5, ağırlık 1
- 2.5 Üst: toplam 231, bekleyen 149, başarı %56, düz getiri %-1, ağırlık 1
- MS 1: toplam 583, bekleyen 440, başarı %52, düz getiri %-14, ağırlık 1
- 3.5 Üst: toplam 57, bekleyen 36, başarı %52, düz getiri %5, ağırlık 1
- 2.5 Alt: toplam 673, bekleyen 510, başarı %51, düz getiri %-14, ağırlık 1
- KG Yok: toplam 105, bekleyen 78, başarı %44, düz getiri %-24, ağırlık 1
- MS X: toplam 15, bekleyen 9, başarı %33, düz getiri %-15, ağırlık 1
- İlk Yarı KG Yok: toplam 3, bekleyen 3, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 6, bekleyen 6, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-20 | Guatemala Ulusal Lig Apertura | Malacateco - Mixco | 2.5 Alt | pending | 72/100
- 2026-09-20 | Kolombiya Primera A Clausura | Llaneros - Atletico Nacion | 2.5 Üst | pending | 65/100
- 2026-09-20 | Meksika Liga MX Apertura | Toluca - Santos Laguna | KG Yok | pending | 71/100
- 2026-09-20 | Arjantin Premier Lig 2. Aşama | Velez Sarsfiel - Tigre | KG Yok | pending | 65/100
- 2026-09-20 | Meksika Liga MX Apertura | Pachuca - Club Tijuana | 2.5 Alt | pending | 69/100
- 2026-09-20 | Nikaragua Premier Lig Apertura | Rancho Santana - Managua | MS 2 | pending | 56/100
- 2026-09-20 | ABD USL Lig 1 | Spokane Veloci - Athletic Club B | 2.5 Üst | pending | 65/100
- 2026-09-20 | Meksika Kadınlar Liga MX Apertura | Atletico San L - Pachuca (K) | MS 2 | pending | 54/100
- 2026-09-20 | Kolombiya Primera A Clausura | Deportes Tolim - America De Cali | 2.5 Alt | pending | 65/100
- 2026-09-20 | Ekvador Pro Lig Şampiyonluk Grubu | Ldu Quito - Univ Catolica ( | 2.5 Üst | pending | 72/100
- 2026-09-20 | El Salvador Primera Lig Apertura | Firpo - Balboa | KG Yok | pending | 72/100
- 2026-09-20 | ABD USL | Sacramento Rep - San Antonio | 2.5 Alt | pending | 64/100
- 2026-09-20 | Meksika Ascenso MX Apertura | Cd Tapatio - Tlaxcala | MS 1 | pending | 49/100
- 2026-09-20 | Kosta Rika Premier Lig Apertura | Alajuelense - Inter San Carlo | MS 1 | pending | 62/100
- 2026-09-20 | Guatemala Ulusal Lig Apertura | Suchitepequez - Xelaju | KG Var | pending | 74/100

