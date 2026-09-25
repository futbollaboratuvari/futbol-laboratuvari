# Robot Öğrenme Hafızası Raporu

Oluşturma: 26.09.2026 00:20:48

## Özet

- Toplam tahmin: 3002
- Bekleyen tahmin: 2000
- Kazanan tahmin: 529
- Kaybeden tahmin: 473
- Lig sayısı: 468
- Seçenek sayısı: 13

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 366, bekleyen 274, başarı %58, düz getiri %4, ağırlık 1
- 2.5 Alt: toplam 859, bekleyen 560, başarı %55, düz getiri %-9, ağırlık 1
- 2.5 Üst: toplam 300, bekleyen 158, başarı %53, düz getiri %-7, ağırlık 1
- MS 1: toplam 757, bekleyen 527, başarı %52, düz getiri %-16, ağırlık 0.94
- KG Var: toplam 220, bekleyen 122, başarı %52, düz getiri %-8, ağırlık 1
- 3.5 Üst: toplam 90, bekleyen 47, başarı %51, düz getiri %1, ağırlık 1
- KG Yok: toplam 195, bekleyen 108, başarı %46, düz getiri %-21, ağırlık 0.94
- MS X: toplam 20, bekleyen 9, başarı %27, düz getiri %-30, ağırlık 1
- İY KG / 2Y KG Hayır / Hayır: toplam 105, bekleyen 105, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Yok: toplam 41, bekleyen 41, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Yok: toplam 12, bekleyen 12, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-26 | ABD USL | Orange County - Pittsburgh Rive | KG Var | pending | 70/100
- 2026-09-26 | El Salvador Primera Lig Apertura | Isidro Metapan - Cacahuatique | KG Var | pending | 69/100
- 2026-09-26 | Guatemala Ulusal Lig Apertura | Xelaju - Comunicaciones | 2.5 Alt | pending | 70/100
- 2026-09-26 | ABD MLS | Vancouver - Dc United | KG Var | pending | 72/100
- 2026-09-26 | ABD MLS | Los Angeles - Colorado | MS 1 | pending | 51/100
- 2026-09-26 | ABD MLS | San Jose - Portland | 3.5 Üst | pending | 59/100
- 2026-09-26 | Meksika Liga MX Apertura | Santos Laguna - Pachuca | 2.5 Alt | pending | 62/100
- 2026-09-26 | Meksika Liga MX Apertura | Tigres Uanl - Puebla | 2.5 Alt | pending | 70/100
- 2026-09-26 | El Salvador Primera Lig Apertura | Firpo - Aguila | 2.5 Üst | pending | 69/100
- 2026-09-26 | El Salvador Primera Lig Apertura | Inter Fa - Balboa | MS 1 | pending | 58/100
- 2026-09-26 | ABD MLS | Seattle - Minnesota Utd | MS 1 | pending | 57/100
- 2026-09-26 | ABD MLS | Austin - San Diego | 2.5 Alt | pending | 68/100
- 2026-09-26 | ABD MLS | Houston - Kansas | MS 1 | pending | 50/100
- 2026-09-26 | ABD MLS | Nashville Sc - Toronto | MS 1 | pending | 61/100
- 2026-09-26 | ABD MLS | Dallas - Los Angeles Fc | 3.5 Üst | pending | 58/100

