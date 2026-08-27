# Robot Öğrenme Hafızası Raporu

Oluşturma: 27.08.2026 13:59:52

## Özet

- Toplam tahmin: 1419
- Bekleyen tahmin: 1007
- Kazanan tahmin: 177
- Kaybeden tahmin: 234
- Lig sayısı: 208
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 64, bekleyen 42, başarı %86, ağırlık 1.12
- 2.5 Alt: toplam 232, bekleyen 162, başarı %63, ağırlık 1.12
- MS 1: toplam 243, bekleyen 172, başarı %44, ağırlık 0.94
- MS 2: toplam 354, bekleyen 222, başarı %36, ağırlık 0.88
- MS X: toplam 366, bekleyen 250, başarı %31, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-27 | CONCACAF Ligler Kupası Çeyrek Final | Toluca - Austin | 2.5 Alt | pending | 60/100
- 2026-08-27 | Şili Kupa Grup E | Recoleta - O Higgins | 2.5 Alt | pending | 66/100
- 2026-08-27 | Kolombiya Primera A Clausura | Atletico Nacio - Deportivo Cali | 2.5 Üst | pending | 73/100
- 2026-08-27 | CONCACAF Orta Amerika Kupası Grup A | Alajuelense - Plaza Amador | 2.5 Alt | pending | 68/100
- 2026-08-27 | CONCACAF Ligler Kupası Çeyrek Final | Club America - Columbus | 2.5 Alt | pending | 59/100
- 2026-08-27 | Kolombiya Primera A Clausura | America De Cal - Atletico Junior | 2.5 Üst | pending | 73/100
- 2026-08-27 | Arjantin Kupa Son 16 Turu | Platense - Instituto Cordo | MS 2 | pending | 36/100
- 2026-08-27 | Meksika Ascenso MX Apertura | Alebrijes - Cd Tapatio | 2.5 Alt | pending | 59/100
- 2026-08-27 | Meksika Ascenso MX Apertura | Cancun Fc - Ca La Paz | MS 1 | pending | 39/100
- 2026-08-27 | Kolombiya Primera A Clausura | Inter Bogota - Deportivo Pasto | 2.5 Alt | pending | 60/100
- 2026-08-27 | CONCACAF Orta Amerika Kupası Grup C | Mixco - Alianza Fc | 2.5 Alt | pending | 60/100
- 2026-08-27 | CONCACAF Orta Amerika Kupası Grup C | Depor. Olimpia - Deportivo Sapri | 2.5 Üst | pending | 60/100
- 2026-08-27 | Cezayir 1.Lig | Es Setif - Es Ben Aknoun | 2.5 Alt | pending | 60/100
- 2026-08-27 | Kuveyt Premier Lig | Kazma - Al Tadhamon | MS 1 | pending | 43/100
- 2026-08-27 | Uruguay Kupa Ön Eleme Turu Grup 6 | Atl Fenix - Liverpool Monte | 2.5 Alt | pending | 60/100

