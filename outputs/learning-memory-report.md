# Robot Öğrenme Hafızası Raporu

Oluşturma: 31.08.2026 01:28:17

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1155
- Kazanan tahmin: 190
- Kaybeden tahmin: 155
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
- 2.5 Üst: toplam 210, bekleyen 130, başarı %68, ağırlık 1.12
- MS 1: toplam 488, bekleyen 414, başarı %55, ağırlık 1.06
- MS 2: toplam 192, bekleyen 161, başarı %52, ağırlık 1
- 2.5 Alt: toplam 604, bekleyen 446, başarı %49, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-31 | Arjantin Ulusal Primera Lig | Gimnasia Jujuy - Agropecuario | 2.5 Alt | pending | 53/100
- 2026-08-31 | Arjantin Premier Lig 2. Aşama | Tigre - Barracas | MS 1 | pending | 47/100
- 2026-08-31 | Arjantin Premier Lig 2. Aşama | Instituto Cord - San Lorenzo | MS 1 | pending | 46/100
- 2026-08-31 | Şili Premier Lig | Univ. Catolica - O Higgins | MS 1 | pending | 53/100
- 2026-08-31 | Kolombiya Primera A Clausura | Deportes Tolim - Depor Cucuta | 2.5 Üst | pending | 60/100
- 2026-08-31 | İsviçre Challenge Lig | Wil - Aarau | MS 2 | pending | 48/100
- 2026-08-31 | Türkiye Süper Lig | Beşiktaş - Çorum | MS 1 | pending | 54/100
- 2026-08-31 | Türkiye Süper Lig | Amed Sk - Trabzonspor | 2.5 Üst | pending | 60/100
- 2026-08-31 | İtalya Serie C Grup A | Novara - Folgore Carates | 2.5 Alt | pending | 50/100
- 2026-08-31 | Uruguay Premier Lig Clausura | Racing Montevi - Albion | 2.5 Alt | pending | 60/100
- 2026-08-31 | İtalya Serie A | Atalanta - Bologna | 2.5 Üst | pending | 74/100
- 2026-08-31 | Fransa Ligue 2 | Dijon - St Etienne | 2.5 Üst | pending | 60/100
- 2026-08-31 | İngiltere Premier Lig | Aston Villa - Arsenal | 2.5 Üst | pending | 60/100
- 2026-08-31 | İtalya Serie C Grup A | Albinoleffe - Ospitaletto | 2.5 Alt | pending | 49/100
- 2026-08-31 | İtalya Serie C Grup A | Renate - Cittadella | 2.5 Alt | pending | 48/100

