# Robot Öğrenme Hafızası Raporu

Oluşturma: 19.09.2026 17:35:27

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1301
- Kazanan tahmin: 113
- Kaybeden tahmin: 86
- Lig sayısı: 293
- Seçenek sayısı: 10

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 165, bekleyen 131, başarı %65, düz getiri %17, ağırlık 1
- 2.5 Alt: toplam 508, bekleyen 436, başarı %61, düz getiri %6, ağırlık 1
- KG Var: toplam 63, bekleyen 58, başarı %60, düz getiri %1, ağırlık 1
- MS 2: toplam 223, bekleyen 198, başarı %52, düz getiri %-5, ağırlık 1
- MS 1: toplam 438, bekleyen 378, başarı %50, düz getiri %-23, ağırlık 1
- MS X: toplam 12, bekleyen 9, başarı %33, düz getiri %-17, ağırlık 1
- KG Yok: toplam 40, bekleyen 40, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- 3.5 Üst: toplam 22, bekleyen 22, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İlk Yarı KG Var: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- İkinci Yarı KG Var: toplam 28, bekleyen 28, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-19 | Peru Primera Ligi, Kapanış | Melgar - Sport Boys | KG Yok | pending | 68/100
- 2026-09-19 | Arjantin Primera Nacional | San Miguel - All Boys | MS 1 | pending | 50/100
- 2026-09-19 | Malta Premier Lig | Mosta Fc - Gzira United | 2.5 Üst | pending | 53/100
- 2026-09-19 | İspanya La Liga 2 | Cadiz - Girona | KG Var | pending | 70/100
- 2026-09-19 | Belçika 2. Lig, İlk Etap | Eupen - Rfc Liege | MS 1 | pending | 48/100
- 2026-09-19 | Peru Primera Ligi, Kapanış | Fc Cajamarca - Cusco Fc | MS 2 | pending | 55/100
- 2026-09-19 | İspanya La Liga | Celta Vigo - Santander | 2.5 Üst | pending | 72/100
- 2026-09-19 | İspanya La Liga 2 | Castellon - Tenerife | 2.5 Alt | pending | 71/100
- 2026-09-19 | Albania Kategori Super | Dinamo Tirana - Kf Laci | KG Var | pending | 54/100
- 2026-09-19 | Portekiz U23 Liga Next Gen | Benfica U23 - Torreense U23 | 2.5 Üst | pending | 55/100
- 2026-09-19 | Portekiz Kupası | Oliveirense - Penafiel | KG Var | pending | 55/100
- 2026-09-19 | Slovakya Superliga | Fk Kosice - Ruzomberok | MS 1 | pending | 54/100
- 2026-09-19 | Danimarka Süper Lig | Odense - Midtjylland | MS 2 | pending | 52/100
- 2026-09-19 | Çekya 1. Lig | Slovacko - Banik Ostrava | 2.5 Alt | pending | 52/100
- 2026-09-19 | Cezayir 2.Lig, Merkez-Batı | Gc Mascara - Rc Arbaa | 2.5 Alt | pending | 57/100

