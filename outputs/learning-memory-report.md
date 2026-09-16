# Robot Öğrenme Hafızası Raporu

Oluşturma: 16.09.2026 20:08:06

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1133
- Kazanan tahmin: 205
- Kaybeden tahmin: 162
- Lig sayısı: 282
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 584, bekleyen 448, başarı %62, düz getiri %6, ağırlık 1
- 2.5 Üst: toplam 167, bekleyen 101, başarı %55, düz getiri %1, ağırlık 1
- MS 1: toplam 502, bekleyen 395, başarı %53, düz getiri %-11, ağırlık 1
- KG Var: toplam 14, bekleyen 4, başarı %50, düz getiri %-9, ağırlık 1
- MS X: toplam 7, bekleyen 3, başarı %50, düz getiri %22, ağırlık 1
- MS 2: toplam 226, bekleyen 182, başarı %48, düz getiri %-10, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-16 | İtalya Serie C Grup B | Vis Pasaro - Reggiana | 2.5 Üst | pending | 54/100
- 2026-09-16 | Almanya Bölgesel Lig Batı | B.Dortmund (Am - Westfalia Rhyne | MS 1 | pending | 56/100
- 2026-09-16 | Uruguay Kupa Ön Eleme Turu Grup 2 | Rentistas - Plaza Colonia | MS 1 | pending | 44/100
- 2026-09-16 | AFC Şampiyonlar Ligi 2 Grup E | Viettel - Melbourne Victo | 2.5 Alt | pending | 57/100
- 2026-09-16 | ABD USL Lig 1 | Chattanooga Re - Forward Madison | MS 1 | pending | 46/100
- 2026-09-16 | ABD MLS Next Pro | Real Monarchs - Minnesota Unite | MS 2 | pending | 49/100
- 2026-09-16 | İspanya Gençler Onur Ligi Grup 4 | Tomares U18 - Utrera U19 | MS 1 | pending | 49/100
- 2026-09-16 | İspanya Federasyon Kupası Son 16 Turu | Conil - Dos Hermanas 19 | MS 2 | pending | 46/100
- 2026-09-16 | Norveç NM Kupası 2.Tur | Bjarg - Bryne | MS 2 | pending | 46/100
- 2026-09-16 | Norveç NM Kupası 2.Tur | Pors Grenland - Stabaek | MS 2 | pending | 57/100
- 2026-09-16 | Norveç NM Kupası 2.Tur | Sotra Sk - Sogndal | MS 2 | pending | 46/100
- 2026-09-16 | Norveç NM Kupası 2.Tur | Levanger - Ranheim | MS 1 | pending | 45/100
- 2026-09-16 | Almanya Bölgesel Lig Kuzey | Phönix Lübeck - Todesfelde | MS 1 | pending | 59/100
- 2026-09-16 | Almanya Bölgesel Lig Kuzey | Eimsbutteler - Werder Bremen ( | MS 1 | pending | 52/100
- 2026-09-16 | İspanya LaLiga | Atletico Madri - Osasuna | 2.5 Alt | pending | 55/100

