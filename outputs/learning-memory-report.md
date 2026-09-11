# Robot Öğrenme Hafızası Raporu

Oluşturma: 11.09.2026 07:29:19

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1151
- Kazanan tahmin: 191
- Kaybeden tahmin: 158
- Lig sayısı: 276
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 224, bekleyen 141, başarı %61, düz getiri %7, ağırlık 1
- MS 1: toplam 492, bekleyen 393, başarı %57, düz getiri %-8, ağırlık 1
- MS 2: toplam 224, bekleyen 176, başarı %54, düz getiri %-4, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 554, bekleyen 438, başarı %49, düz getiri %-20, ağırlık 1
- MS X: toplam 3, bekleyen 2, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-11 | İrlanda Premier Lig | Shelbourne - Derry City | 2.5 Üst | pending | 53/100
- 2026-09-11 | Danimarka 2.Lig | Fremad Amager - Hellerup Ik | 2.5 Üst | pending | 54/100
- 2026-09-11 | CAF Konfederasyon Kupası 1.Ön Eleme Turu | Real Bamako (2) - (1) Vitesse Fc | 2.5 Alt | pending | 56/100
- 2026-09-11 | Çek Cumhuriyeti FNL | Usti Nad Labem - Jihlava | MS 1 | pending | 49/100
- 2026-09-11 | Birleşik Arap Emirlikleri Arap Körfez Ligi | Al Wahda - Al Sharjah | 2.5 Üst | pending | 54/100
- 2026-09-11 | Kuzey Makedonya 1.Lig | Aresimi - Skendija | MS 2 | pending | 58/100
- 2026-09-11 | Arjantin Prim B Metro | De Merlo - Real Pilar | 2.5 Alt | pending | 48/100
- 2026-09-11 | Galler Premier Lig 1.Aşama | Barry Town - Llandudno | 2.5 Alt | pending | 49/100
- 2026-09-11 | Vietnam V-Lig 1 | Bac Ninh - Clb Tp Ho Chi M | 2.5 Alt | pending | 57/100
- 2026-09-11 | Slovakya 2.Lig | Pohronie - Liptovsky Mikul | MS 2 | pending | 44/100
- 2026-09-11 | Kuzey Makedonya 1.Lig | Aresimi - Skendija | 2.5 Alt | pending | 49/100
- 2026-09-11 | ABD USL Lig 1 | Athletic Club - New York Cosmos | 2.5 Üst | pending | 73/100
- 2026-09-11 | İtalya Serie B | Pisa - Virtus Entella | 2.5 Üst | pending | 67/100
- 2026-09-11 | İtalya Serie B | Benevento - Verona | 2.5 Üst | pending | 65/100
- 2026-09-11 | İngiltere Premier Lig 2 | Stoke (B) - Wolverhampton U | 2.5 Alt | pending | 48/100

