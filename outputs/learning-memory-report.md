# Robot Öğrenme Hafızası Raporu

Oluşturma: 27.08.2026 13:56:23

## Özet

- Toplam tahmin: 1413
- Bekleyen tahmin: 1043
- Kazanan tahmin: 153
- Kaybeden tahmin: 216
- Lig sayısı: 208
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 62, bekleyen 44, başarı %89, ağırlık 1.12
- 2.5 Alt: toplam 228, bekleyen 173, başarı %71, ağırlık 1.12
- MS 1: toplam 243, bekleyen 189, başarı %37, ağırlık 0.88
- MS 2: toplam 354, bekleyen 228, başarı %33, ağırlık 0.88
- MS X: toplam 366, bekleyen 250, başarı %31, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-27 | Arjantin Kupa Son 16 Turu | Platense - Instituto Cordo | MS 2 | pending | 36/100
- 2026-08-27 | Meksika Ascenso MX Apertura | Alebrijes - Cd Tapatio | 2.5 Alt | pending | 59/100
- 2026-08-27 | Meksika Ascenso MX Apertura | Cancun Fc - Ca La Paz | MS 1 | pending | 39/100
- 2026-08-27 | Kolombiya Primera A Clausura | Inter Bogota - Deportivo Pasto | 2.5 Alt | pending | 60/100
- 2026-08-27 | CONCACAF Orta Amerika Kupası Grup C | Mixco - Alianza Fc | 2.5 Alt | pending | 60/100
- 2026-08-27 | CONCACAF Orta Amerika Kupası Grup C | Depor. Olimpia - Deportivo Sapri | 2.5 Üst | pending | 60/100
- 2026-08-27 | Cezayir 1.Lig | Es Setif - Es Ben Aknoun | 2.5 Alt | pending | 60/100
- 2026-08-27 | Kuveyt Premier Lig | Kazma - Al Tadhamon | MS 1 | pending | 43/100
- 2026-08-27 | Uruguay Kupa Ön Eleme Turu Grup 6 | Atl Fenix - Liverpool Monte | 2.5 Alt | pending | 60/100
- 2026-08-27 | UEFA Avrupa Ligi Play Off | Ferencvaros (1) - (0) Trabzonspor | 2.5 Üst | pending | 60/100
- 2026-08-27 | UEFA Avrupa Ligi Play Off | Anderlecht (3) - (0) Kairat Almaty | 2.5 Alt | pending | 59/100
- 2026-08-27 | UEFA Konferans Ligi Play Off | Austria Vienna (0) - (2) Braga | 2.5 Alt | pending | 60/100
- 2026-08-27 | UEFA Konferans Ligi Play Off | Borac Banja Lu (3) - (1) Vikingur Reykja | MS 1 | pending | 38/100
- 2026-08-27 | İspanya LaLiga | Celta Vigo - Osasuna | 2.5 Alt | pending | 80/100
- 2026-08-27 | UEFA Konferans Ligi Play Off | Rijeka (0) - (2) Midtjylland | 2.5 Alt | pending | 60/100

