# Robot Öğrenme Hafızası Raporu

Oluşturma: 20.09.2026 23:47:10

## Özet

- Toplam tahmin: 2382
- Bekleyen tahmin: 1671
- Kazanan tahmin: 365
- Kaybeden tahmin: 346
- Lig sayısı: 343
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 336, bekleyen 266, başarı %57, düz getiri %3, ağırlık 1
- KG Var: toplam 159, bekleyen 92, başarı %54, düz getiri %-5, ağırlık 1
- MS 1: toplam 628, bekleyen 457, başarı %52, düz getiri %-16, ağırlık 1
- 2.5 Üst: toplam 257, bekleyen 152, başarı %51, düz getiri %-11, ağırlık 1
- 2.5 Alt: toplam 716, bekleyen 517, başarı %50, düz getiri %-16, ağırlık 1
- KG Yok: toplam 136, bekleyen 81, başarı %49, düz getiri %-16, ağırlık 1
- 3.5 Üst: toplam 65, bekleyen 28, başarı %49, düz getiri %-3, ağırlık 1
- MS X: toplam 19, bekleyen 12, başarı %43, düz getiri %10, ağırlık 1
- İkinci Yarı KG Yok: toplam 11, bekleyen 11, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 5, bekleyen 5, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 13, bekleyen 13, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-20 | Guatemala Ulusal Lig Apertura | Malacateco - Mixco | 2.5 Alt | pending | 72/100
- 2026-09-20 | Kolombiya Primera A Clausura | Llaneros - Atletico Nacion | 2.5 Üst | pending | 65/100
- 2026-09-20 | Honduras Ulusal Lig Apertura | Juticalpa - Marathon | 2.5 Üst | pending | 74/100
- 2026-09-20 | Arjantin Premier Lig 2. Aşama | Velez Sarsfiel - Tigre | KG Yok | pending | 65/100
- 2026-09-20 | Meksika Liga MX Apertura | Toluca - Santos Laguna | KG Yok | pending | 71/100
- 2026-09-20 | Meksika Liga MX Apertura | Pachuca - Club Tijuana | 2.5 Alt | pending | 70/100
- 2026-09-20 | El Salvador Primera Lig Apertura | Firpo - Balboa | KG Yok | pending | 72/100
- 2026-09-20 | Ekvador Pro Lig Şampiyonluk Grubu | Ldu Quito - Univ Catolica ( | 2.5 Üst | pending | 72/100
- 2026-09-20 | Kolombiya Primera A Clausura | Deportes Tolim - America De Cali | 2.5 Alt | pending | 64/100
- 2026-09-20 | Meksika Kadınlar Liga MX Apertura | Atletico San L - Pachuca (K) | MS 2 | pending | 54/100
- 2026-09-20 | ABD USL Lig 1 | Spokane Veloci - Athletic Club B | MS 1 | pending | 44/100
- 2026-09-20 | Honduras Ulusal Lig Apertura | Depor. Olimpia - Atlético Indepe | 2.5 Alt | pending | 50/100
- 2026-09-20 | Nikaragua Premier Lig Apertura | Rancho Santana - Managua | MS 2 | pending | 55/100
- 2026-09-20 | ABD USL | Sacramento Rep - San Antonio | 2.5 Alt | pending | 64/100
- 2026-09-20 | Guatemala Ulusal Lig Apertura | Suchitepequez - Xelaju | KG Var | pending | 74/100

