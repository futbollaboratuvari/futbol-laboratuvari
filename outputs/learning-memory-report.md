# Robot Öğrenme Hafızası Raporu

Oluşturma: 03.09.2026 04:20:17

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1068
- Kazanan tahmin: 242
- Kaybeden tahmin: 190
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
- 2.5 Üst: toplam 232, bekleyen 132, başarı %62, düz getiri %10, ağırlık 1
- MS 2: toplam 214, bekleyen 173, başarı %59, düz getiri %-2, ağırlık 1
- MS 1: toplam 455, bekleyen 346, başarı %58, düz getiri %-5, ağırlık 1
- 2.5 Alt: toplam 587, bekleyen 408, başarı %50, düz getiri %-16, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-03 | Ürdün Premier Lig | Al Baqaa - Doqarah | MS 2 | pending | 48/100
- 2026-09-03 | Ekvador Pro Lig | Univ Catolica - Aucas | 2.5 Üst | pending | 60/100
- 2026-09-03 | Venezuela Premier Lig Clausura | Academia Anzoa - Monagas | 2.5 Üst | pending | 55/100
- 2026-09-03 | Ekvador Pro Lig | Deportivo Cuen - Guayaquil City | MS 1 | pending | 56/100
- 2026-09-03 | Ekvador Pro Lig | Libertad - Emelec | 2.5 Alt | pending | 65/100
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

