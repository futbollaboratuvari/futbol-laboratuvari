# Robot Öğrenme Hafızası Raporu

Oluşturma: 31.08.2026 08:49:09

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1102
- Kazanan tahmin: 218
- Kaybeden tahmin: 180
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
- 2.5 Üst: toplam 208, bekleyen 118, başarı %67, ağırlık 1.12
- MS 1: toplam 486, bekleyen 400, başarı %55, ağırlık 1
- MS 2: toplam 191, bekleyen 159, başarı %53, ağırlık 1
- 2.5 Alt: toplam 609, bekleyen 421, başarı %49, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-31 | Venezuela Premier Lig Clausura | Ucv - Rayo Zuliano | 2.5 Alt | pending | 58/100
- 2026-08-31 | Venezuela Premier Lig Clausura | Academia Puert - Academia Anzoat | MS 1 | pending | 60/100
- 2026-08-31 | Şili Premier Lig | Univ. Catolica - O Higgins | 2.5 Alt | pending | 53/100
- 2026-08-31 | Türkiye Süper Lig | Beşiktaş - Çorum | 2.5 Alt | pending | 63/100
- 2026-08-31 | İtalya Serie A | Atalanta - Bologna | 2.5 Alt | pending | 62/100
- 2026-08-31 | Umman Profesyonel Lig | Sur - Al Shabab | 2.5 Alt | pending | 56/100
- 2026-08-31 | İngiltere Non League Premier Kuzey | Stockton Town - Redcar Athletic | 2.5 Alt | pending | 50/100
- 2026-08-31 | İngiltere Non League Premier Kuzey | Afc Emley - Guiseley | 2.5 Alt | pending | 52/100
- 2026-08-31 | Kazakistan Premier Lig | Yelimay Semey - Kairat Almaty | 2.5 Alt | pending | 50/100
- 2026-08-31 | İngiltere Ulusal Lig N / S Kuzey | Chorley - Brackley Town | 2.5 Alt | pending | 52/100
- 2026-08-31 | İngiltere Ulusal Lig N / S Güney | Hampton Richmo - Maidstone Unite | 2.5 Alt | pending | 50/100
- 2026-08-31 | İngiltere Non League Premier Kuzey | Ilkeston Town - Quorn | 2.5 Alt | pending | 50/100
- 2026-08-31 | Portekiz Premier Lig | Braga - Guimaraes | 2.5 Alt | pending | 54/100
- 2026-08-31 | Arjantin Premier Lig 2. Aşama | Independiente - Gimnasia Mendoz | 2.5 Üst | won | 63/100
- 2026-08-31 | Arjantin Ulusal Primera Lig | Gimnasia Jujuy - Agropecuario | 2.5 Alt | pending | 60/100

