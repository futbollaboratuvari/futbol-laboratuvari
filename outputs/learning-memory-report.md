# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 07:49:09

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1327
- Kazanan tahmin: 90
- Kaybeden tahmin: 83
- Lig sayısı: 266
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 223, bekleyen 183, başarı %60, düz getiri %10, ağırlık 1
- MS 2: toplam 226, bekleyen 205, başarı %57, düz getiri %2, ağırlık 1
- MS 1: toplam 504, bekleyen 451, başarı %53, düz getiri %-10, ağırlık 1
- 2.5 Alt: toplam 535, bekleyen 478, başarı %46, düz getiri %-26, ağırlık 1
- KG Var: toplam 8, bekleyen 7, başarı %0, düz getiri %-100, ağırlık 1
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | İtalya Serie C Grup B | Gubbio - Latina | MS 1 | pending | 44/100
- 2026-09-12 | Bulgaristan 1.Lig | Cska Sofia - Arda Kardzhali | MS 1 | pending | 54/100
- 2026-09-12 | İsviçre Süper Lig | Lugano - Young Boys | MS 1 | pending | 46/100
- 2026-09-12 | Arnavutluk Süperlig | Teuta - Fk Vora | MS 1 | pending | 54/100
- 2026-09-12 | Finlandiya Veikkausliiga Şampiyonluk Grubu | Oulu - Gnistan | 2.5 Alt | pending | 54/100
- 2026-09-12 | Slovenya 2.SNL | Nd Slovan Ljub - Dren Vrhnika | 2.5 Alt | pending | 49/100
- 2026-09-12 | İngiltere 2.Lig | Colchester - Crewe | 2.5 Alt | pending | 63/100
- 2026-09-12 | Galler FAW Championship Güney | Cardiff Dracon - Baglan Dragons | 2.5 Alt | pending | 49/100
- 2026-09-12 | Türkiye TFF 1. Lig | Boluspor - Pendikspor | 2.5 Alt | pending | 48/100
- 2026-09-12 | Avusturya 1.Lig | Bregenz - Floridsdorfer | 2.5 Üst | pending | 54/100
- 2026-09-12 | Paraguay Intermedia Lig | Guairena - General Caballe | 2.5 Alt | pending | 52/100
- 2026-09-12 | İngiltere Kadınlar Premier Lig | West Ham Unite - London City (K) | MS 2 | pending | 58/100
- 2026-09-12 | Japonya J2 Lig | Omiya - Oita Trinita | 2.5 Üst | pending | 53/100
- 2026-09-12 | Güney Kore K Lig 2 | Asan Mugunghwa - Cheongju Fc | 2.5 Alt | pending | 52/100
- 2026-09-12 | Güney Kore K3 Ligi | Gangneung City - Gyeongju Hnp | 2.5 Alt | pending | 52/100

