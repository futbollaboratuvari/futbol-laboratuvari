# Robot Öğrenme Hafızası Raporu

Oluşturma: 29.08.2026 06:15:39

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1274
- Kazanan tahmin: 133
- Kaybeden tahmin: 93
- Lig sayısı: 218
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 171, bekleyen 141, başarı %83, ağırlık 1.12
- 2.5 Alt: toplam 579, bekleyen 492, başarı %60, ağırlık 1.06
- MS 1: toplam 487, bekleyen 430, başarı %54, ağırlık 1
- MS X: toplam 27, bekleyen 21, başarı %50, ağırlık 1
- MS 2: toplam 235, bekleyen 189, başarı %48, ağırlık 0.94
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-29 | ABD USL Lig 1 | Westchester Sc - Spokane Velocit | 2.5 Alt | pending | 55/100
- 2026-08-29 | ABD USL | Oakland Roots - Orange County B | MS 1 | pending | 51/100
- 2026-08-29 | İtalya Serie C Grup C | Internazionale - Team Altamura | 2.5 Alt | pending | 59/100
- 2026-08-29 | İtalya Serie C Grup C | Ss Monopoli 19 - Catania | MS 2 | pending | 42/100
- 2026-08-29 | Hollanda Eredivisie | Az Alkmaar - Go Ahead Eagles | MS 1 | pending | 60/100
- 2026-08-29 | Macaristan NB II | Kecskemeti - Kozarmisleny | 2.5 Alt | pending | 54/100
- 2026-08-29 | Slovenya 2.SNL | Rudar - Nk Bilje | 2.5 Alt | pending | 57/100
- 2026-08-29 | İsveç 2.Lig Norra Svealand | Skiljebo Sk - Sunnersta Aif | MS 2 | pending | 41/100
- 2026-08-29 | İskoçya 2.Lig | Spartans - Clyde | MS 1 | pending | 50/100
- 2026-08-29 | İngiltere Championship | Cardiff - Sheffield Utd | MS 2 | pending | 41/100
- 2026-08-29 | Tanzanya Kuu Bara Ligi | Tabora United - Dodoma Jiji | MS 1 | pending | 55/100
- 2026-08-29 | Birleşik Arap Emirlikleri Arap Körfez Ligi | Khorfakkan Clu - Al Dhafra | 2.5 Alt | pending | 53/100
- 2026-08-29 | İngiltere 2.Lig | Barnet - Cheltenham | MS 1 | pending | 56/100
- 2026-08-29 | Çin Halk Cumhuriyeti 1.Lig | Foshan Nanshi - Shenzhen Junior | 2.5 Alt | pending | 55/100
- 2026-08-29 | Güney Kore K3 Ligi | Daejeon Korail - Yangpyeong | MS 1 | pending | 53/100

