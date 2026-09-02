# Robot Öğrenme Hafızası Raporu

Oluşturma: 02.09.2026 21:09:33

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1082
- Kazanan tahmin: 234
- Kaybeden tahmin: 184
- Lig sayısı: 212
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 7, bekleyen 5, başarı %100, düz getiri %147, ağırlık 1
- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- 2.5 Üst: toplam 228, bekleyen 131, başarı %62, düz getiri %9, ağırlık 1
- MS 2: toplam 220, bekleyen 185, başarı %57, düz getiri %-4, ağırlık 1
- MS 1: toplam 461, bekleyen 360, başarı %56, düz getiri %-8, ağırlık 1
- 2.5 Alt: toplam 581, bekleyen 399, başarı %52, düz getiri %-14, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-02 | Arjantin Ulusal Primera Lig | Colegiales - Midland | MS X | pending | 43/100
- 2026-09-02 | İngiltere 1.Lig | Luton - Stockport | MS 2 | pending | 47/100
- 2026-09-02 | İtalya Serie C Kupası 2.Tur | Catania - Savoia | MS 1 | pending | 54/100
- 2026-09-02 | Yunanistan Kupa Lig Aşaması | Paok - Ofi | MS 1 | pending | 59/100
- 2026-09-02 | Şili Premier Lig | Coquimbo Unido - Univ De Concepc | 2.5 Alt | pending | 56/100
- 2026-09-02 | İngiltere Premier Lig Kupası Grup E | Preston North - Wolverhampton U | MS 1 | pending | 50/100
- 2026-09-02 | Bosna-Hersek Premier Lig | Siroki Brijeg - Sarajevo | MS 2 | pending | 44/100
- 2026-09-02 | Avusturya Bundesliga | Austria Vienna - Wattens | MS 1 | pending | 52/100
- 2026-09-02 | Hırvatistan 2.HNL | Jadran Lp - Dubrava Zagred | MS 1 | pending | 56/100
- 2026-09-02 | Polonya Kupa 1.Tur | Falubaz Zielon - Ruch Chorzow | 2.5 Üst | pending | 54/100
- 2026-09-02 | Polonya Kupa 1.Tur | Gornik Leczna - Stal Mielec | MS 1 | pending | 45/100
- 2026-09-02 | CONCACAF Ligler Kupası Yarı Final | Toluca - Club Leon | 2.5 Üst | pending | 53/100
- 2026-09-02 | CONCACAF Ligler Kupası Yarı Final | Club America - Monterrey | 2.5 Üst | pending | 53/100
- 2026-09-02 | İngiltere 1.Lig | Reading - Mansfield | MS 1 | pending | 50/100
- 2026-09-02 | İngiltere Premier Lig Kupası Grup E | Preston North - Wolverhampton U | MS 2 | pending | 46/100

