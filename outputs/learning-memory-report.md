# Robot Öğrenme Hafızası Raporu

Oluşturma: 09.09.2026 09:39:06

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1109
- Kazanan tahmin: 214
- Kaybeden tahmin: 177
- Lig sayısı: 248
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 2, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 229, bekleyen 144, başarı %62, düz getiri %8, ağırlık 1
- MS 1: toplam 500, bekleyen 387, başarı %53, düz getiri %-14, ağırlık 1
- 2.5 Alt: toplam 550, bekleyen 414, başarı %53, düz getiri %-13, ağırlık 1
- MS 2: toplam 215, bekleyen 161, başarı %50, düz getiri %-12, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-09 | ABD USL Kupası Yarı Final | Hartford Athle - Colorado Spring | MS 1 | pending | 40/100
- 2026-09-09 | Brezilya Serie B | Cuiaba - Athletic Club | 2.5 Üst | pending | 65/100
- 2026-09-09 | ABD MLS | Montreal - Charlotte | MS 1 | pending | 49/100
- 2026-09-09 | Kolombiya Primera B Clausura | Independiente - Quindio | 2.5 Alt | pending | 66/100
- 2026-09-09 | Danimarka DBU Kupası 3.Tur | Nykobing - Middelfart | MS 1 | pending | 51/100
- 2026-09-09 | Andorra Süper Kupa | Inter Escaldes - Descaldes | MS 1 | pending | 51/100
- 2026-09-09 | Uruguay Kupa Ön Eleme Turu Grup 4 | Racing Montevi - Central Espanol | 2.5 Alt | pending | 62/100
- 2026-09-09 | İngiltere Championship | Norwich - Birmingham | 2.5 Üst | pending | 80/100
- 2026-09-09 | Danimarka DBU Kupası 3.Tur | Vanlose - Hillerod | MS 2 | pending | 56/100
- 2026-09-09 | Mısır Premier Lig | Al Mokawloon A - Al Ahly | 2.5 Alt | pending | 53/100
- 2026-09-09 | İspanya De La Reina Kupası 1. Tur | Celta De Vigo - Real Avilés (K) | MS 1 | pending | 57/100
- 2026-09-09 | Finlandiya Veikkausliiga Şampiyonluk Grubu | Helsinki - Inter Turku | 2.5 Üst | pending | 54/100
- 2026-09-09 | Gürcistan Erovnuli Liga | Samgurali - Dila Gori | 2.5 Alt | pending | 54/100
- 2026-09-09 | Uganda Premier Lig | Sc Villa - Express | 2.5 Alt | pending | 57/100
- 2026-09-09 | Özbekistan Super League | Otmk Olmaliq - Pakhtakor | 2.5 Alt | pending | 50/100

