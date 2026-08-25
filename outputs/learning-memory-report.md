# Robot Öğrenme Hafızası Raporu

Oluşturma: 25.08.2026 23:52:17

## Özet

- Toplam tahmin: 1134
- Bekleyen tahmin: 784
- Kazanan tahmin: 141
- Kaybeden tahmin: 208
- Lig sayısı: 171
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 36, bekleyen 20, başarı %88, ağırlık 1.12
- 2.5 Alt: toplam 111, bekleyen 67, başarı %75, ağırlık 1.12
- MS 1: toplam 146, bekleyen 96, başarı %34, ağırlık 0.88
- MS 2: toplam 316, bekleyen 193, başarı %33, ağırlık 0.88
- MS X: toplam 366, bekleyen 250, başarı %31, ağırlık 0.88
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-25 | İngiltere Lig Kupası 2.Tur | Barnsley - Crewe | MS 1 | won | 45/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Clachnacuddin - Elgin | 2.5 Alt | won | 65/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Hamilton - Edinburg C. | 2.5 Alt | won | 67/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Queen Of South - Hibernian Ii | 2.5 Alt | won | 66/100
- 2026-08-25 | İngiltere Lig Kupası 2.Tur | Stevenage - Reading | 2.5 Üst | won | 73/100
- 2026-08-25 | İngiltere Lig Kupası 2.Tur | Fleetwood Town - Shrewsbury | 2.5 Üst | won | 75/100
- 2026-08-25 | İngiltere Lig Kupası 2.Tur | Sheffield Wed - Wolverhampton | 2.5 Alt | won | 56/100
- 2026-08-25 | İngiltere Lig Kupası 2.Tur | Birmingham - Brentford | 2.5 Üst | pending | 79/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Kelty Hearts - Clydebank Fc | 2.5 Alt | pending | 57/100
- 2026-08-25 | Suudi Arabistan Pro Lig | Al Taawon - Al Feiha | 2.5 Alt | won | 69/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Fraserburgh - Aberdeen Ii | MS 2 | lost | 33/100
- 2026-08-25 | Suudi Arabistan Pro Lig | Al Taawon - Al Feiha | 2.5 Üst | lost | 68/100
- 2026-08-25 | İngiltere Lig Kupası 2.Tur | Doncaster - Middlesbrough | MS 2 | won | 50/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Forfar - Formartine Unit | 2.5 Üst | pending | 64/100
- 2026-08-25 | Tanzanya Kuu Bara Ligi | Dodoma Jiji - Polisi Morogoro | 2.5 Alt | pending | 64/100

