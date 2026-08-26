# Robot Öğrenme Hafızası Raporu

Oluşturma: 26.08.2026 16:16:10

## Özet

- Toplam tahmin: 1312
- Bekleyen tahmin: 945
- Kazanan tahmin: 152
- Kaybeden tahmin: 214
- Lig sayısı: 198
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 52, bekleyen 35, başarı %88, ağırlık 1.12
- 2.5 Alt: toplam 178, bekleyen 124, başarı %72, ağırlık 1.12
- MS 1: toplam 213, bekleyen 160, başarı %38, ağırlık 0.88
- MS 2: toplam 343, bekleyen 217, başarı %33, ağırlık 0.88
- MS X: toplam 366, bekleyen 250, başarı %31, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-26 | Copa Sudamericana Son 16 Turu | River Plate (0) - (0) Santa Fe | 2.5 Alt | pending | 64/100
- 2026-08-26 | Hazırlık Kulüpler | Barcelona B - Reddis | MS 1 | pending | 42/100
- 2026-08-26 | Hazırlık Kulüpler | Oyonesa - San Ignacio | 2.5 Alt | pending | 64/100
- 2026-08-26 | Hazırlık Kulüpler | Terrassa - Vilanova | 2.5 Alt | pending | 64/100
- 2026-08-26 | Hazırlık Kulüpler | Real Unión De - Tenerife Ii | MS 2 | pending | 48/100
- 2026-08-26 | Hazırlık Kulüpler | Numancia - Utebo | 2.5 Üst | pending | 64/100
- 2026-08-26 | Hazırlık Kulüpler | Atletico Astor - Salamanca | 2.5 Üst | pending | 64/100
- 2026-08-26 | Suudi Arabistan 1.Lig | Al Bukayriyah - Al Akhdoud | 2.5 Alt | pending | 64/100
- 2026-08-26 | Macaristan NB III Güneybatı | Erdi Vse - Pecs | MS 2 | pending | 47/100
- 2026-08-26 | Venezuela Kupa 1.Tur Grup C | Caracas Fc - Fundacion Lara | MS 1 | pending | 49/100
- 2026-08-26 | UEFA Kadınlar Şampiyonlar Ligi 3. Eleme Turu | Psv Eindhoven - Koge (K) | 2.5 Alt | pending | 64/100
- 2026-08-26 | Güney Afrika PSL | Mamelodi Sundo - Amazulu | 2.5 Üst | pending | 64/100
- 2026-08-26 | Suudi Arabistan 1.Lig | Al Bukayriyah - Al Akhdoud | 2.5 Üst | pending | 64/100
- 2026-08-26 | Macaristan NB III Güneydoğu | Honved Ii - Szegedi Vse | MS 1 | pending | 40/100
- 2026-08-26 | Macaristan NB III Güneybatı | Pte-Peac - Budaors | MS 2 | pending | 37/100

