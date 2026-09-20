# Robot Öğrenme Hafızası Raporu

Oluşturma: 21.09.2026 01:34:50

## Özet

- Toplam tahmin: 2424
- Bekleyen tahmin: 1698
- Kazanan tahmin: 374
- Kaybeden tahmin: 352
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

- MS 2: toplam 339, bekleyen 269, başarı %57, düz getiri %3, ağırlık 1
- KG Var: toplam 162, bekleyen 90, başarı %56, düz getiri %-2, ağırlık 1
- 2.5 Üst: toplam 264, bekleyen 156, başarı %52, düz getiri %-8, ağırlık 1
- MS 1: toplam 636, bekleyen 464, başarı %52, düz getiri %-16, ağırlık 1
- 2.5 Alt: toplam 730, bekleyen 526, başarı %50, düz getiri %-17, ağırlık 1
- KG Yok: toplam 141, bekleyen 86, başarı %49, düz getiri %-16, ağırlık 1
- 3.5 Üst: toplam 65, bekleyen 28, başarı %49, düz getiri %-3, ağırlık 1
- MS X: toplam 19, bekleyen 11, başarı %38, düz getiri %-4, ağırlık 1
- İkinci Yarı KG Yok: toplam 13, bekleyen 13, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 5, bekleyen 5, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 13, bekleyen 13, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-21 | Kolombiya Primera A Clausura | Deportes Tolim - America De Cali | 2.5 Alt | pending | 64/100
- 2026-09-21 | Honduras Ulusal Lig Apertura | Depor. Olimpia - Atlético Indepe | 2.5 Alt | pending | 50/100
- 2026-09-21 | Ekvador Pro Lig Şampiyonluk Grubu | Ldu Quito - Univ Catolica ( | 2.5 Üst | pending | 72/100
- 2026-09-21 | El Salvador Primera Lig Apertura | Firpo - Balboa | KG Yok | pending | 72/100
- 2026-09-21 | Meksika Liga MX Apertura | Pachuca - Club Tijuana | 2.5 Alt | pending | 70/100
- 2026-09-21 | Meksika Liga MX Apertura | Toluca - Santos Laguna | KG Yok | pending | 71/100
- 2026-09-21 | Arjantin Premier Lig 2. Aşama | Velez Sarsfiel - Tigre | KG Yok | pending | 65/100
- 2026-09-21 | Kosta Rika Premier Lig Apertura | Ad San Carlos - Cs Cartagines | 2.5 Alt | pending | 66/100
- 2026-09-21 | Guatemala Ulusal Lig Apertura | Malacateco - Mixco | 2.5 Alt | pending | 72/100
- 2026-09-21 | Kolombiya Primera A Clausura | Llaneros - Atletico Nacion | 2.5 Üst | pending | 65/100
- 2026-09-21 | Honduras Ulusal Lig Apertura | Juticalpa - Marathon | 2.5 Üst | pending | 74/100
- 2026-09-21 | Meksika Liga MX Apertura | Queretaro - Club Leon | 2.5 Üst | pending | 62/100
- 2026-09-21 | Honduras Ulusal Lig Apertura | Juticalpa - Marathon | 2.5 Üst | pending | 74/100
- 2026-09-21 | El Salvador Primera Lig Apertura | Alianza - Municipal Limen | KG Yok | pending | 70/100
- 2026-09-21 | El Salvador Primera Lig Apertura | Platense - Aguila | KG Var | pending | 82/100

