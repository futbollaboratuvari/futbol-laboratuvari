# Robot Öğrenme Hafızası Raporu

Oluşturma: 29.08.2026 12:11:38

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1219
- Kazanan tahmin: 156
- Kaybeden tahmin: 125
- Lig sayısı: 216
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 173, bekleyen 131, başarı %74, ağırlık 1.12
- 2.5 Alt: toplam 585, bekleyen 476, başarı %54, ağırlık 1
- MS 1: toplam 486, bekleyen 413, başarı %52, ağırlık 1
- MS 2: toplam 231, bekleyen 179, başarı %50, ağırlık 1
- MS X: toplam 23, bekleyen 18, başarı %40, ağırlık 0.88
- KG Var: toplam 2, bekleyen 2, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-29 | İzlanda 1.Lig | Völsungur - Ir Reykjavik | 2.5 Alt | pending | 49/100
- 2026-08-29 | İsveç 2.Lig Norra Svealand | Skiljebo Sk - Sunnersta Aif | 2.5 Alt | pending | 49/100
- 2026-08-29 | Macaristan NB III Güneydoğu | Szegedi Vse - Szolnok | 2.5 Alt | pending | 48/100
- 2026-08-29 | İzlanda 2.Lig | Kormakur - Kfa | 2.5 Alt | pending | 49/100
- 2026-08-29 | İzlanda 1.Lig | Grindavik - Hk Kopavogur | 2.5 Alt | pending | 48/100
- 2026-08-29 | İngiltere Championship | Watford - West Ham | KG Var | pending | 57/100
- 2026-08-29 | Hollanda Tweede Divisie | Jong Sparta - Hhc | 2.5 Alt | pending | 49/100
- 2026-08-29 | Ekvador Pro Lig | T.Universitari - Deportivo Cuenc | 2.5 Üst | won | 68/100
- 2026-08-29 | Uruguay Premier Lig Clausura | Montevideo Wan - Central Espanol | 2.5 Üst | won | 71/100
- 2026-08-29 | ABD USL Lig 1 | Westchester Sc - Spokane Velocit | 2.5 Alt | pending | 50/100
- 2026-08-29 | ABD USL | Oakland Roots - Orange County B | MS 1 | pending | 51/100
- 2026-08-29 | İtalya Serie C Grup C | Internazionale - Team Altamura | 2.5 Alt | pending | 54/100
- 2026-08-29 | İtalya Serie C Grup C | Ss Monopoli 19 - Catania | MS 2 | pending | 47/100
- 2026-08-29 | Hollanda Eredivisie | Az Alkmaar - Go Ahead Eagles | MS 1 | pending | 60/100
- 2026-08-29 | Macaristan NB II | Kecskemeti - Kozarmisleny | 2.5 Alt | pending | 49/100

