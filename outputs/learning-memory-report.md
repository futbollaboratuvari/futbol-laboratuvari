# Robot Öğrenme Hafızası Raporu

Oluşturma: 30.08.2026 10:25:57

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1200
- Kazanan tahmin: 151
- Kaybeden tahmin: 149
- Lig sayısı: 204
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- 2.5 Üst: toplam 192, bekleyen 125, başarı %61, ağırlık 1.06
- MS 1: toplam 495, bekleyen 426, başarı %51, ağırlık 1
- 2.5 Alt: toplam 605, bekleyen 468, başarı %45, ağırlık 0.94
- MS 2: toplam 203, bekleyen 178, başarı %44, ağırlık 0.94
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-30 | Kolombiya Primera A Clausura | Rionegro Aguil - Chico | MS 1 | pending | 59/100
- 2026-08-30 | Avusturya Bundesliga | Hartberg - Ried | 2.5 Üst | pending | 60/100
- 2026-08-30 | Kolombiya Primera A Clausura | Alianza Petrol - Atletico Nacion | 2.5 Üst | pending | 74/100
- 2026-08-30 | Kosta Rika Premier Lig Apertura | Perez Zeledon - Alajuelense | 2.5 Alt | pending | 54/100
- 2026-08-30 | ABD USL | Las Vegas Ligh - Charleston Batt | 2.5 Alt | pending | 54/100
- 2026-08-30 | Meksika Liga MX Apertura | Santos Laguna - Tigres Uanl | 2.5 Alt | pending | 45/100
- 2026-08-30 | ABD USL | Louisville Cit - Detroit City | 2.5 Alt | pending | 55/100
- 2026-08-30 | ABD USL | Oakland Roots - Orange County B | 2.5 Alt | pending | 53/100
- 2026-08-30 | Peru Premier Lig Clausura | Alianza Lima - Deportivo Garci | 2.5 Alt | pending | 55/100
- 2026-08-30 | ABD USL | Lexington - Colorado Spring | 2.5 Alt | pending | 53/100
- 2026-08-30 | ABD USL Lig 1 | Richmond Kicke - Forward Madison | 2.5 Alt | pending | 49/100
- 2026-08-30 | ABD USL Lig 1 | Westchester Sc - Spokane Velocit | MS 2 | pending | 41/100
- 2026-08-30 | Kolombiya Primera A Clausura | Jaguares - America De Cali | 2.5 Üst | pending | 72/100
- 2026-08-30 | Kolombiya Primera A Clausura | Los Millionari - Inter Bogota | MS 1 | pending | 60/100
- 2026-08-30 | Şili Premier Lig | Univ De Concep - Univ. De Şili | MS 2 | pending | 48/100

