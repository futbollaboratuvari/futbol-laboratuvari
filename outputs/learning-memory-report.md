# Robot Öğrenme Hafızası Raporu

Oluşturma: 03.09.2026 21:41:15

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1056
- Kazanan tahmin: 250
- Kaybeden tahmin: 194
- Lig sayısı: 215
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %87, ağırlık 1
- MS X: toplam 9, bekleyen 6, başarı %67, düz getiri %64, ağırlık 1
- 2.5 Üst: toplam 232, bekleyen 132, başarı %61, düz getiri %8, ağırlık 1
- MS 2: toplam 215, bekleyen 175, başarı %60, düz getiri %0, ağırlık 1
- MS 1: toplam 452, bekleyen 338, başarı %58, düz getiri %-5, ağırlık 1
- 2.5 Alt: toplam 589, bekleyen 403, başarı %52, düz getiri %-14, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-03 | Venezuela Premier Lig Clausura | Estudiantes Fc - Ucv | 2.5 Alt | pending | 61/100
- 2026-09-03 | Meksika Ascenso MX Apertura | Tepatitlan De - Dorados | 2.5 Üst | pending | 56/100
- 2026-09-03 | İsviçre Süper Lig | Lugano - Servette | 2.5 Alt | pending | 49/100
- 2026-09-03 | İskoçya Premiership | Hibernian - Hearts | 2.5 Alt | pending | 49/100
- 2026-09-03 | Kolombiya Primera A Clausura | America De Cal - Alianza Petrole | 2.5 Üst | pending | 53/100
- 2026-09-03 | Brezilya Kupa Çeyrek Final | Gremio (0) - (0) Internacional | 2.5 Alt | pending | 48/100
- 2026-09-03 | Venezuela Premier Lig Clausura | Academia Puert - Deportivo La Gu | MS 1 | pending | 48/100
- 2026-09-03 | Nikaragua Premier Lig Apertura | Managua - Diriangen | 2.5 Alt | pending | 52/100
- 2026-09-03 | Rusya Kupa Premier Lig Yolu Grup B | Dinamo Moskova - Akhmat Grozny | 2.5 Alt | pending | 50/100
- 2026-09-03 | Romanya Kupa Grup A | Asu Poli Timiş - Rapid Bükreş | 2.5 Üst | pending | 53/100
- 2026-09-03 | İtalya Kupa 2.Tur | Palermo - Mantova | MS 1 | pending | 56/100
- 2026-09-03 | Litvanya A Ligi | Banga - Fk Panevezys | 2.5 Alt | pending | 50/100
- 2026-09-03 | Kolombiya Primera A Clausura | Pereira - Independiente M | MS 2 | pending | 54/100
- 2026-09-03 | Cezayir 1.Lig | Js El Biar - Oued Akbou | MS 1 | pending | 44/100
- 2026-09-03 | Irak Premier Lig | Al Mosul - Al Zawraa | MS 2 | pending | 49/100

