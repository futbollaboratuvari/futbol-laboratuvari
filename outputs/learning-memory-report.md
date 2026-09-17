# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 02:07:51

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1174
- Kazanan tahmin: 179
- Kaybeden tahmin: 147
- Lig sayısı: 279
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 9, bekleyen 6, başarı %67, düz getiri %63, ağırlık 1
- KG Var: toplam 13, bekleyen 2, başarı %64, düz getiri %14, ağırlık 1
- 2.5 Alt: toplam 587, bekleyen 469, başarı %57, düz getiri %-3, ağırlık 1
- 2.5 Üst: toplam 152, bekleyen 100, başarı %56, düz getiri %1, ağırlık 1
- MS 2: toplam 247, bekleyen 201, başarı %54, düz getiri %3, ağırlık 1
- MS 1: toplam 492, bekleyen 396, başarı %51, düz getiri %-17, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | Fransa Ligue 1 | Monaco - Lens | 2.5 Alt | pending | 66/100
- 2026-09-18 | İspanya Primera Lig RFEF Grup 1 | Ud Logrones - Pontevedra | 2.5 Alt | pending | 54/100
- 2026-09-18 | Portekiz Kupa 2.Tur | Real Massama - Academica | MS 2 | pending | 52/100
- 2026-09-18 | Paraguay Intermedia Lig | Depor Santani - Sol De America | 2.5 Alt | pending | 54/100
- 2026-09-18 | Fransa Ligue 1 | Monaco - Lens | MS 1 | pending | 64/100
- 2026-09-18 | Belçika Pro Lig | Gent - Standard Liege | 2.5 Üst | pending | 54/100
- 2026-09-18 | İrlanda Premier Lig | Derry City - Galway United | MS 1 | pending | 48/100
- 2026-09-18 | İrlanda Premier Lig | Dundalk - Shelbourne | 2.5 Alt | pending | 47/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Colwyn Bay - Barry Town | 2.5 Üst | pending | 52/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Briton Ferry - Trefelin | MS 1 | pending | 53/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Airbus Uk - Flint Town | MS 1 | pending | 46/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Gap Connahs Qu - Cardiff Mu | MS 1 | pending | 50/100
- 2026-09-18 | İrlanda 1.Lig | Wexford Youths - Cobh Ramblers | 2.5 Üst | pending | 53/100
- 2026-09-18 | İrlanda 1.Lig | Athlone - Kerry | 2.5 Alt | pending | 50/100
- 2026-09-18 | İrlanda 1.Lig | Finn Harps - Longford | 2.5 Alt | pending | 48/100

