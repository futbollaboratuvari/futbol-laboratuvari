# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 04:35:53

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1163
- Kazanan tahmin: 184
- Kaybeden tahmin: 153
- Lig sayısı: 278
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 13, bekleyen 1, başarı %67, düz getiri %18, ağırlık 1
- 2.5 Üst: toplam 153, bekleyen 100, başarı %57, düz getiri %2, ağırlık 1
- 2.5 Alt: toplam 585, bekleyen 465, başarı %56, düz getiri %-5, ağırlık 1
- MS 2: toplam 247, bekleyen 200, başarı %55, düz getiri %5, ağırlık 1
- MS 1: toplam 493, bekleyen 392, başarı %51, düz getiri %-18, ağırlık 1
- MS X: toplam 9, bekleyen 5, başarı %50, düz getiri %22, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | Brezilya Serie B | Vila Nova - America Mineiro | 2.5 Üst | pending | 65/100
- 2026-09-18 | İtalya Serie A | Monza - Sassuolo | MS 2 | pending | 61/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Caernarfon - Cambrian | MS 1 | pending | 56/100
- 2026-09-18 | Kuzey İrlanda Championship | Newry City Afc - Annagh United | 2.5 Alt | pending | 47/100
- 2026-09-18 | Cezayir 2.Lig Doğu | Mo Bejaia - Mo Constantine | 2.5 Alt | pending | 54/100
- 2026-09-18 | Fransa Ligue 1 | Monaco - Lens | 2.5 Alt | pending | 66/100
- 2026-09-18 | İspanya Primera Lig RFEF Grup 1 | Ud Logrones - Pontevedra | 2.5 Alt | pending | 54/100
- 2026-09-18 | Portekiz Kupa 2.Tur | Real Massama - Academica | MS 2 | pending | 52/100
- 2026-09-18 | Paraguay Intermedia Lig | Depor Santani - Sol De America | 2.5 Alt | pending | 54/100
- 2026-09-18 | Fransa Ligue 1 | Monaco - Lens | MS 1 | pending | 64/100
- 2026-09-18 | Belçika Pro Lig | Gent - Standard Liege | 2.5 Üst | pending | 55/100
- 2026-09-18 | İrlanda Premier Lig | Derry City - Galway United | MS 1 | pending | 48/100
- 2026-09-18 | İrlanda Premier Lig | Dundalk - Shelbourne | 2.5 Alt | pending | 47/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Colwyn Bay - Barry Town | 2.5 Üst | pending | 53/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Briton Ferry - Trefelin | MS 1 | pending | 53/100

