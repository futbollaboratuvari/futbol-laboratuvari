# Robot Öğrenme Hafızası Raporu

Oluşturma: 03.09.2026 02:21:53

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1089
- Kazanan tahmin: 230
- Kaybeden tahmin: 181
- Lig sayısı: 217
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 9, bekleyen 7, başarı %100, düz getiri %147, ağırlık 1
- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- 2.5 Üst: toplam 230, bekleyen 135, başarı %62, düz getiri %10, ağırlık 1
- MS 2: toplam 213, bekleyen 177, başarı %58, düz getiri %-4, ağırlık 1
- MS 1: toplam 457, bekleyen 356, başarı %56, düz getiri %-8, ağırlık 1
- 2.5 Alt: toplam 588, bekleyen 412, başarı %51, düz getiri %-15, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-03 | Ekvador Pro Lig | Libertad - Emelec | 2.5 Alt | pending | 67/100
- 2026-09-03 | Kolombiya Primera A Clausura | Pereira - Independiente M | 2.5 Alt | pending | 54/100
- 2026-09-03 | Meksika Ascenso MX Apertura | Tepatitlan De - Dorados | 2.5 Alt | pending | 50/100
- 2026-09-03 | Nikaragua Premier Lig Apertura | Matagalpa - Unan Managua | 2.5 Alt | pending | 49/100
- 2026-09-03 | Honduras Ulusal Lig Apertura | Depor. Olimpia - Platense | 2.5 Alt | pending | 61/100
- 2026-09-03 | Belçika Pro Lig | Gent - Oh Leuven | MS 1 | pending | 56/100
- 2026-09-03 | Polonya Ekstraklasa | Lech Poznan - Jagiellonia | MS 1 | pending | 54/100
- 2026-09-03 | İsviçre Süper Lig | Basel - Sion | MS 1 | pending | 45/100
- 2026-09-03 | İsviçre Süper Lig | Lugano - Servette | MS 1 | pending | 50/100
- 2026-09-03 | Polonya Kupa 1.Tur | Slask Wroclaw - Pogon Szczecin | 2.5 Üst | pending | 53/100
- 2026-09-03 | Uruguay Kupa Ön Eleme Turu Grup 5 | River Plate (U - Nacional Df | 2.5 Alt | pending | 54/100
- 2026-09-03 | Fransa Ligue 1 | Toulouse - Lille | 2.5 Alt | pending | 62/100
- 2026-09-03 | İskoçya Premiership | Hibernian - Hearts | 2.5 Üst | pending | 54/100
- 2026-09-03 | Fransa Ligue 3 | Rouen - Valenciennes | 2.5 Alt | pending | 53/100
- 2026-09-03 | İspanya LaLiga | Real Sociedad - Celta Vigo | 2.5 Üst | pending | 64/100

