# Robot Öğrenme Hafızası Raporu

Oluşturma: 27.08.2026 17:29:30

## Özet

- Toplam tahmin: 1423
- Bekleyen tahmin: 1011
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
- 2.5 Alt: toplam 233, bekleyen 163, başarı %63, ağırlık 1.12
- MS 1: toplam 245, bekleyen 174, başarı %44, ağırlık 0.94
- MS 2: toplam 355, bekleyen 223, başarı %36, ağırlık 0.88
- MS X: toplam 366, bekleyen 250, başarı %31, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-27 | UEFA Konferans Ligi Play Off | Rakow Czestoch (2) - (2) Hajduk Split | MS 1 | pending | 45/100
- 2026-08-27 | Danimarka DBU Kupası 2.Tur | Vejle - Silkeborg | MS 1 | pending | 44/100
- 2026-08-27 | UEFA Avrupa Ligi Play Off | Fc Iberia (0) - (4) Jagiellonia | 2.5 Alt | pending | 59/100
- 2026-08-27 | UEFA Konferans Ligi Play Off | Qarabagh (1) - (0) Twente | MS 2 | pending | 36/100
- 2026-08-27 | CONCACAF Ligler Kupası Çeyrek Final | Toluca - Austin | 2.5 Alt | pending | 60/100
- 2026-08-27 | Şili Kupa Grup E | Recoleta - O Higgins | 2.5 Alt | pending | 66/100
- 2026-08-27 | Kolombiya Primera A Clausura | Atletico Nacio - Deportivo Cali | 2.5 Üst | pending | 73/100
- 2026-08-27 | CONCACAF Orta Amerika Kupası Grup A | Alajuelense - Plaza Amador | 2.5 Alt | pending | 68/100
- 2026-08-27 | CONCACAF Ligler Kupası Çeyrek Final | Club America - Columbus | 2.5 Alt | pending | 59/100
- 2026-08-27 | Kolombiya Primera A Clausura | America De Cal - Atletico Junior | 2.5 Üst | pending | 73/100
- 2026-08-27 | Arjantin Kupa Son 16 Turu | Platense - Instituto Cordo | MS 2 | pending | 36/100
- 2026-08-27 | Meksika Ascenso MX Apertura | Alebrijes - Cd Tapatio | 2.5 Alt | pending | 59/100
- 2026-08-27 | Meksika Ascenso MX Apertura | Cancun Fc - Ca La Paz | MS 1 | pending | 46/100
- 2026-08-27 | Kolombiya Primera A Clausura | Inter Bogota - Deportivo Pasto | 2.5 Alt | pending | 60/100
- 2026-08-27 | CONCACAF Orta Amerika Kupası Grup C | Mixco - Alianza Fc | 2.5 Alt | pending | 60/100

