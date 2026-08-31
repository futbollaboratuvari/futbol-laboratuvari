# Robot Öğrenme Hafızası Raporu

Oluşturma: 31.08.2026 17:29:48

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1096
- Kazanan tahmin: 219
- Kaybeden tahmin: 185
- Lig sayısı: 193
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 2, başarı %100, ağırlık 1
- KG Var: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- 2.5 Üst: toplam 207, bekleyen 118, başarı %66, ağırlık 1.12
- MS 1: toplam 486, bekleyen 397, başarı %54, ağırlık 1
- MS 2: toplam 195, bekleyen 163, başarı %53, ağırlık 1
- 2.5 Alt: toplam 606, bekleyen 414, başarı %48, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-31 | Kolombiya Primera A Clausura | Deportes Tolim - Depor Cucuta | MS 1 | pending | 60/100
- 2026-08-31 | Tanzanya Kuu Bara Ligi | Kagera Sugar - Azam Fc | MS 2 | pending | 56/100
- 2026-08-31 | Türkiye Süper Lig | Amed Sk - Trabzonspor | MS 2 | pending | 52/100
- 2026-08-31 | İtalya Serie C Grup A | Novara - Folgore Carates | MS 1 | pending | 47/100
- 2026-08-31 | Norveç 3.Lig Grup 6 | Sarpsborg 08 I - Rade | MS 1 | pending | 47/100
- 2026-08-31 | Suudi Arabistan 1.Lig | Al Taee - Al-Jandal | 2.5 Üst | pending | 60/100
- 2026-08-31 | Slovakya 2.Lig | Malzenice - Mfk Bytca | 2.5 Alt | pending | 47/100
- 2026-08-31 | Litvanya A Ligi | Dziugas Telsia - Hegelmann | 2.5 Üst | pending | 60/100
- 2026-08-31 | Irak Premier Lig | Al Talaba - Naft | MS 1 | pending | 50/100
- 2026-08-31 | Finlandiya Veikkausliiga | Oulu - Seinajoen Jk | 2.5 Üst | pending | 60/100
- 2026-08-31 | Norveç 3.Lig Grup 2 | Spjelkavik - Molde 2 | MS 1 | pending | 53/100
- 2026-08-31 | Galler Premier Lig 1.Aşama | Colwyn Bay - Llandudno | 2.5 Üst | pending | 60/100
- 2026-08-31 | İngiltere Premier Lig 2 | Newcastle (B) - Fulham (B) | 2.5 Alt | pending | 48/100
- 2026-08-31 | Galler FAW Championship Güney | Newport City - Swansea Univers | 2.5 Alt | pending | 48/100
- 2026-08-31 | Kolombiya Primera A Clausura | Deportes Tolim - Depor Cucuta | 2.5 Alt | pending | 41/100

