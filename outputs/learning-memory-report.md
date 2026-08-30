# Robot Öğrenme Hafızası Raporu

Oluşturma: 31.08.2026 02:37:39

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1119
- Kazanan tahmin: 213
- Kaybeden tahmin: 168
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
- 2.5 Üst: toplam 209, bekleyen 122, başarı %67, ağırlık 1.12
- MS 1: toplam 488, bekleyen 405, başarı %55, ağırlık 1.06
- MS 2: toplam 192, bekleyen 160, başarı %53, ağırlık 1
- 2.5 Alt: toplam 605, bekleyen 428, başarı %51, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-31 | Portekiz Premier Lig | Braga - Guimaraes | 2.5 Alt | pending | 37/100
- 2026-08-31 | Arjantin Premier Lig 2. Aşama | Independiente - Gimnasia Mendoz | 2.5 Üst | pending | 63/100
- 2026-08-31 | Arjantin Ulusal Primera Lig | Gimnasia Jujuy - Agropecuario | 2.5 Alt | pending | 59/100
- 2026-08-31 | Arjantin Premier Lig 2. Aşama | Tigre - Barracas | MS 1 | pending | 53/100
- 2026-08-31 | Arjantin Premier Lig 2. Aşama | Instituto Cord - San Lorenzo | MS 1 | pending | 51/100
- 2026-08-31 | Şili Premier Lig | Univ. Catolica - O Higgins | MS 1 | pending | 58/100
- 2026-08-31 | Kolombiya Primera A Clausura | Deportes Tolim - Depor Cucuta | 2.5 Üst | pending | 60/100
- 2026-08-31 | İsviçre Challenge Lig | Wil - Aarau | MS 2 | pending | 48/100
- 2026-08-31 | Türkiye Süper Lig | Beşiktaş - Çorum | MS 1 | pending | 60/100
- 2026-08-31 | Türkiye Süper Lig | Amed Sk - Trabzonspor | 2.5 Üst | pending | 60/100
- 2026-08-31 | İtalya Serie C Grup A | Novara - Folgore Carates | 2.5 Alt | pending | 56/100
- 2026-08-31 | Uruguay Premier Lig Clausura | Racing Montevi - Albion | 2.5 Alt | pending | 60/100
- 2026-08-31 | İtalya Serie A | Atalanta - Bologna | 2.5 Üst | pending | 72/100
- 2026-08-31 | Fransa Ligue 2 | Dijon - St Etienne | 2.5 Üst | pending | 60/100
- 2026-08-31 | İngiltere Premier Lig | Aston Villa - Arsenal | 2.5 Üst | pending | 60/100

