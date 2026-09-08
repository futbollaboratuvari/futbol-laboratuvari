# Robot Öğrenme Hafızası Raporu

Oluşturma: 08.09.2026 16:37:06

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1118
- Kazanan tahmin: 200
- Kaybeden tahmin: 182
- Lig sayısı: 238
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 3, bekleyen 2, başarı %100, düz getiri %93, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 233, bekleyen 134, başarı %61, düz getiri %4, ağırlık 1
- 2.5 Alt: toplam 536, bekleyen 401, başarı %56, düz getiri %-9, ağırlık 1
- MS 1: toplam 501, bekleyen 401, başarı %44, düz getiri %-28, ağırlık 0.94
- MS 2: toplam 225, bekleyen 179, başarı %41, düz getiri %-25, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-08 | Paraguay Intermedia Lig | General Caball - Resistencia | 2.5 Alt | pending | 54/100
- 2026-09-08 | ABD USL Kupası Yarı Final | Hartford Athle - Colorado Spring | MS 1 | pending | 36/100
- 2026-09-08 | İskoçya Challenge Kupası Lig Aşaması | Annan - Motherwell Ii | MS 1 | pending | 57/100
- 2026-09-08 | İskoçya Challenge Kupası Lig Aşaması | Clyde - East Fife | MS 1 | pending | 42/100
- 2026-09-08 | Irak Premier Lig | Erbil Sc - Diala | 2.5 Alt | pending | 53/100
- 2026-09-08 | Mısır Premier Lig | Al Zamalek Cai - Abu Qair | 2.5 Üst | pending | 53/100
- 2026-09-08 | Suudi Arabistan 1.Lig | Al Anwar - Al Taee | MS 1 | pending | 47/100
- 2026-09-08 | İngiltere EFL Trophy Kuzey Grup H | Doncaster - Huddersfield | 2.5 Üst | pending | 71/100
- 2026-09-08 | Portekiz U23 Ulusal Şampiyona | Portimonense U - Felgueiras U23 | 2.5 Üst | pending | 53/100
- 2026-09-08 | Güney Kore K Lig 1 | Ulsan - Fc Seoul | KG Var | pending | 49/100
- 2026-09-08 | Paraguay Intermedia Lig | 3 De Noviembre - Sol De America | 2.5 Üst | pending | 53/100
- 2026-09-08 | Paraguay Intermedia Lig | Paraguari - Guairena | 2.5 Alt | pending | 56/100
- 2026-09-08 | Kosova Süper Lig | Kosova Vushtrr - Llapi | 2.5 Alt | pending | 53/100
- 2026-09-08 | Katar 2.Lig | Mesaimeer - Khuraitiat | 2.5 Alt | pending | 50/100
- 2026-09-08 | Portekiz U23 Ulusal Şampiyona | Rio Ave U23 - Torreense U23 | 2.5 Üst | pending | 54/100

