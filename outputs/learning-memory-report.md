# Robot Öğrenme Hafızası Raporu

Oluşturma: 29.08.2026 00:06:31

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1146
- Kazanan tahmin: 165
- Kaybeden tahmin: 188
- Lig sayısı: 219
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 110, bekleyen 80, başarı %83, ağırlık 1.12
- 2.5 Alt: toplam 375, bekleyen 292, başarı %58, ağırlık 1.06
- MS 1: toplam 356, bekleyen 290, başarı %49, ağırlık 1
- MS 2: toplam 307, bekleyen 206, başarı %36, ağırlık 0.88
- MS X: toplam 192, bekleyen 119, başarı %33, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-29 | Nikaragua Premier Lig Apertura | Matagalpa - Rancho Santana | MS 1 | pending | 49/100
- 2026-08-29 | El Salvador Primera Lig Apertura | Alianza - Balboa | 2.5 Alt | pending | 62/100
- 2026-08-29 | Meksika Liga MX Apertura | Club America - Puebla | 2.5 Alt | pending | 63/100
- 2026-08-29 | ABD MLS | Colorado - Salt Lake | MS 1 | pending | 41/100
- 2026-08-29 | Kolombiya Primera A Clausura | Alianza Petrol - Atletico Nacion | 2.5 Alt | pending | 60/100
- 2026-08-29 | ABD USL | New Mexico Uni - San Antonio | 2.5 Üst | pending | 67/100
- 2026-08-29 | Honduras Ulusal Lig Apertura | Depor Motagua - Olancho | MS 1 | pending | 45/100
- 2026-08-29 | Kosta Rika Premier Lig Apertura | Perez Zeledon - Alajuelense | 2.5 Alt | pending | 58/100
- 2026-08-29 | ABD USL | Monterey Bay - Sacramento Repu | 2.5 Üst | pending | 59/100
- 2026-08-29 | ABD MLS | San Diego - Los Angeles | MS 1 | pending | 42/100
- 2026-08-29 | ABD MLS | Portland - Austin | MS 1 | pending | 46/100
- 2026-08-29 | ABD USL | Phoenix Rising - Indy Eleven | MS 1 | pending | 41/100
- 2026-08-29 | ABD USL | Las Vegas Ligh - Charleston Batt | 2.5 Alt | pending | 50/100
- 2026-08-29 | Meksika Liga MX Apertura | Santos Laguna - Tigres Uanl | MS 2 | pending | 44/100
- 2026-08-29 | ABD USL Lig 1 | Greenville Tri - Naples | 2.5 Alt | pending | 55/100

