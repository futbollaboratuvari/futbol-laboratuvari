# Robot Öğrenme Hafızası Raporu

Oluşturma: 03.09.2026 09:13:09

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1070
- Kazanan tahmin: 242
- Kaybeden tahmin: 188
- Lig sayısı: 215
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
- 2.5 Üst: toplam 233, bekleyen 133, başarı %62, düz getiri %10, ağırlık 1
- MS 2: toplam 215, bekleyen 176, başarı %62, düz getiri %3, ağırlık 1
- MS 1: toplam 454, bekleyen 345, başarı %58, düz getiri %-5, ağırlık 1
- 2.5 Alt: toplam 586, bekleyen 407, başarı %50, düz getiri %-16, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-03 | İtalya Serie C Kupası 2.Tur | Trento Calcio - Calvina | 2.5 Alt | pending | 54/100
- 2026-09-03 | Letonya Kupa Yarı Final | Daugava Riga - Riga Fc | 2.5 Alt | pending | 40/100
- 2026-09-03 | Türkiye TFF 1. Lig | Bursaspor - İstanbulspor | MS 1 | pending | 59/100
- 2026-09-03 | Uganda Premier Lig | Express - Kampala City | MS 2 | pending | 48/100
- 2026-09-03 | Belçika Pro Lig | Gent - Oh Leuven | 2.5 Üst | pending | 56/100
- 2026-09-03 | İsviçre Süper Lig | Basel - Sion | MS 2 | pending | 44/100
- 2026-09-03 | İtalya Serie C Kupası 2.Tur | Cittadella - Renate | 2.5 Alt | pending | 54/100
- 2026-09-03 | Polonya Kupa 1.Tur | Gks Tychy - Lks Lodz | MS 2 | pending | 45/100
- 2026-09-03 | Ürdün Premier Lig | Al Baqaa - Doqarah | MS 2 | pending | 48/100
- 2026-09-03 | Ekvador Pro Lig | Univ Catolica - Aucas | 2.5 Üst | pending | 60/100
- 2026-09-03 | Venezuela Premier Lig Clausura | Academia Anzoa - Monagas | 2.5 Üst | pending | 55/100
- 2026-09-03 | Ekvador Pro Lig | Deportivo Cuen - Guayaquil City | MS 1 | pending | 56/100
- 2026-09-03 | Ekvador Pro Lig | Libertad - Emelec | 2.5 Alt | pending | 65/100
- 2026-09-03 | Kolombiya Primera A Clausura | Pereira - Independiente M | 2.5 Alt | pending | 54/100
- 2026-09-03 | Meksika Ascenso MX Apertura | Tepatitlan De - Dorados | 2.5 Alt | pending | 50/100

