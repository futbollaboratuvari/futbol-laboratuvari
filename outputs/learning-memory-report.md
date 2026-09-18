# Robot Öğrenme Hafızası Raporu

Oluşturma: 18.09.2026 07:26:00

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1161
- Kazanan tahmin: 187
- Kaybeden tahmin: 152
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
- 2.5 Üst: toplam 154, bekleyen 100, başarı %59, düz getiri %7, ağırlık 1
- 2.5 Alt: toplam 583, bekleyen 462, başarı %56, düz getiri %-4, ağırlık 1
- MS 2: toplam 246, bekleyen 199, başarı %55, düz getiri %5, ağırlık 1
- MS 1: toplam 495, bekleyen 394, başarı %51, düz getiri %-18, ağırlık 1
- MS X: toplam 9, bekleyen 5, başarı %50, düz getiri %22, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-18 | Galler Premier Lig 1.Aşama | Colwyn Bay - Barry Town | 2.5 Alt | pending | 50/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Ammanford - Penybont | 2.5 Alt | pending | 46/100
- 2026-09-18 | Macaristan NB I | Puskas Academy - Budapest Honved | 2.5 Alt | pending | 46/100
- 2026-09-18 | Litvanya 1.Lig | Lietava Jonava - Tauras | 2.5 Üst | pending | 54/100
- 2026-09-18 | Rusya FNL | Pfc Sochi - Ska-Khabarovsk | MS 1 | pending | 56/100
- 2026-09-18 | Meksika Ascenso MX Apertura | Durango - Cruz Azul Hidal | MS 1 | pending | 64/100
- 2026-09-18 | Malta Premier Lig Açılış | Marsaxlokk Fc - Hamrun | 2.5 Üst | pending | 53/100
- 2026-09-18 | Endonezya Süper Lig | Madura United - Psim Yogyakarta | 2.5 Üst | pending | 53/100
- 2026-09-18 | Brezilya Serie B | Vila Nova - America Mineiro | 2.5 Üst | pending | 64/100
- 2026-09-18 | İtalya Serie A | Monza - Sassuolo | MS 2 | pending | 61/100
- 2026-09-18 | Galler Premier Lig 1.Aşama | Caernarfon - Cambrian | MS 1 | pending | 55/100
- 2026-09-18 | Kuzey İrlanda Championship | Newry City Afc - Annagh United | 2.5 Alt | pending | 47/100
- 2026-09-18 | Cezayir 2.Lig Doğu | Mo Bejaia - Mo Constantine | 2.5 Alt | pending | 54/100
- 2026-09-18 | Fransa Ligue 1 | Monaco - Lens | 2.5 Alt | pending | 66/100
- 2026-09-18 | İspanya Primera Lig RFEF Grup 1 | Ud Logrones - Pontevedra | 2.5 Alt | pending | 54/100

