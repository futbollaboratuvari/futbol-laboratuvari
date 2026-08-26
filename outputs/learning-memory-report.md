# Robot Öğrenme Hafızası Raporu

Oluşturma: 26.08.2026 14:53:48

## Özet

- Toplam tahmin: 1303
- Bekleyen tahmin: 936
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

- 2.5 Üst: toplam 50, bekleyen 33, başarı %88, ağırlık 1.12
- 2.5 Alt: toplam 174, bekleyen 120, başarı %72, ağırlık 1.12
- MS 1: toplam 212, bekleyen 159, başarı %38, ağırlık 0.88
- MS 2: toplam 341, bekleyen 215, başarı %33, ağırlık 0.88
- MS X: toplam 366, bekleyen 250, başarı %31, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-26 | Venezuela Kupa 1.Tur Grup C | Caracas Fc - Fundacion Lara | MS 1 | pending | 50/100
- 2026-08-26 | UEFA Kadınlar Şampiyonlar Ligi 3. Eleme Turu | Psv Eindhoven - Koge (K) | 2.5 Alt | pending | 64/100
- 2026-08-26 | Güney Afrika PSL | Mamelodi Sundo - Amazulu | 2.5 Üst | pending | 64/100
- 2026-08-26 | Suudi Arabistan 1.Lig | Al Bukayriyah - Al Akhdoud | 2.5 Üst | pending | 64/100
- 2026-08-26 | Macaristan NB III Güneydoğu | Honved Ii - Szegedi Vse | MS 1 | pending | 40/100
- 2026-08-26 | Macaristan NB III Güneybatı | Pte-Peac - Budaors | MS 2 | pending | 37/100
- 2026-08-26 | Belarus 1.Lig | Orsha - Dinamo Minsk Ii | MS 2 | pending | 37/100
- 2026-08-26 | Japonya İmparatorluk Kupası 2.Tur | V-Varen Nagasa - Ehime Fc | MS 1 | pending | 50/100
- 2026-08-26 | Japonya İmparatorluk Kupası 2.Tur | Sendai - Tochigi City | MS 1 | pending | 42/100
- 2026-08-26 | Venezuela Kupa 1.Tur Grup E | Mineros - Dinamo Puerto L | 2.5 Alt | pending | 64/100
- 2026-08-26 | Japonya İmparatorluk Kupası 2.Tur | Omiya - Vanraure | MS 1 | pending | 45/100
- 2026-08-26 | Japonya İmparatorluk Kupası 2.Tur | Niigata - Kagoshima Unite | 2.5 Alt | pending | 64/100
- 2026-08-26 | Venezuela Kupa 1.Tur Grup C | Aragua - Yaracuyanos | 2.5 Alt | pending | 64/100
- 2026-08-26 | Gürcistan David Kipiani Kupası Çeyrek Final | Gagra - Aragvi Dusheti | 2.5 Alt | pending | 59/100
- 2026-08-26 | UEFA Kadınlar Şampiyonlar Ligi 3. Eleme Turu | E. Frankfurt ( - Psg (K) | 2.5 Alt | pending | 62/100

