# Robot Öğrenme Hafızası Raporu

Oluşturma: 20.09.2026 01:15:13

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1213
- Kazanan tahmin: 159
- Kaybeden tahmin: 128
- Lig sayısı: 284
- Seçenek sayısı: 10

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 81, bekleyen 58, başarı %65, düz getiri %12, ağırlık 1
- 2.5 Üst: toplam 160, bekleyen 115, başarı %58, düz getiri %1, ağırlık 1
- 2.5 Alt: toplam 478, bekleyen 387, başarı %56, düz getiri %-5, ağırlık 1
- 3.5 Üst: toplam 33, bekleyen 22, başarı %55, düz getiri %9, ağırlık 1
- MS 1: toplam 417, bekleyen 338, başarı %54, düz getiri %-9, ağırlık 1
- KG Yok: toplam 60, bekleyen 54, başarı %50, düz getiri %-24, ağırlık 1
- MS X: toplam 13, bekleyen 11, başarı %50, düz getiri %25, ağırlık 1
- MS 2: toplam 221, bekleyen 191, başarı %47, düz getiri %-15, ağırlık 1
- İlk Yarı KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 30, bekleyen 30, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-20 | ABD MLS | Nashville Sc - Chicago | 3.5 Üst | pending | 67/100
- 2026-09-20 | ABD MLS | Colorado - Seattle | 2.5 Alt | pending | 69/100
- 2026-09-20 | ABD MLS | Salt Lake - Vancouver | MS 2 | pending | 66/100
- 2026-09-20 | Honduras Ulusal Lig Apertura | Real Espana - Depor Motagua | 2.5 Alt | pending | 71/100
- 2026-09-20 | Kosta Rika Premier Lig Apertura | Deportivo Sapr - Herediano | MS 1 | pending | 51/100
- 2026-09-20 | ABD USL | Phoenix Rising - El Paso Locomot | 2.5 Alt | pending | 56/100
- 2026-09-20 | ABD MLS | Portland - Atlanta Utd | MS 1 | pending | 59/100
- 2026-09-20 | ABD USL | Las Vegas Ligh - Hartford Athlet | 2.5 Üst | pending | 62/100
- 2026-09-20 | Meksika Liga MX Apertura | Club America - Guadalajara | 2.5 Üst | pending | 72/100
- 2026-09-20 | Japonya J3 Lig | Zweigen Kanaza - Renofa Yamaguch | 2.5 Alt | pending | 52/100
- 2026-09-20 | Venezuela Premier Lig Clausura | Deportivo La G - Depor Tachira | 2.5 Alt | pending | 63/100
- 2026-09-20 | Ekvador Pro Lig Copa Sudamericana Play Off | Emelec - Libertad | KG Yok | pending | 74/100
- 2026-09-20 | Kanada Premier Lig | Pacific Fc - Vancouver Fc | MS 2 | pending | 45/100
- 2026-09-20 | Nikaragua Premier Lig Apertura | Walter Ferrett - Jalapa | KG Var | pending | 54/100
- 2026-09-20 | ABD USL Lig 1 | Union Omaha - One Knoxville | 2.5 Alt | pending | 66/100

