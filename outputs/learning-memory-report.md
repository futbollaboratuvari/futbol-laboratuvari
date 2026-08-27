# Robot Öğrenme Hafızası Raporu

Oluşturma: 27.08.2026 23:37:15

## Özet

- Toplam tahmin: 1427
- Bekleyen tahmin: 1006
- Kazanan tahmin: 184
- Kaybeden tahmin: 236
- Lig sayısı: 208
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 67, bekleyen 40, başarı %89, ağırlık 1.12
- 2.5 Alt: toplam 234, bekleyen 160, başarı %62, ağırlık 1.12
- MS 1: toplam 245, bekleyen 174, başarı %44, ağırlık 0.94
- MS 2: toplam 355, bekleyen 223, başarı %36, ağırlık 0.88
- MS X: toplam 366, bekleyen 250, başarı %31, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-27 | UEFA Avrupa Ligi Play Off | Ferencvaros (1) - (0) Trabzonspor | 2.5 Alt | pending | 59/100
- 2026-08-27 | ABD USL | El Paso Locomo - Pittsburgh Rive | 2.5 Üst | won | 65/100
- 2026-08-27 | Brezilya Kupa Çeyrek Final | Palmeiras - Santos | 2.5 Üst | won | 64/100
- 2026-08-27 | Şili Premier Lig | Coquimbo Unido - Univ. Catolica | 2.5 Üst | won | 67/100
- 2026-08-27 | UEFA Konferans Ligi Play Off | Rakow Czestoch (2) - (2) Hajduk Split | MS 1 | pending | 45/100
- 2026-08-27 | Danimarka DBU Kupası 2.Tur | Vejle - Silkeborg | MS 1 | pending | 44/100
- 2026-08-27 | UEFA Avrupa Ligi Play Off | Fc Iberia (0) - (4) Jagiellonia | 2.5 Alt | pending | 59/100
- 2026-08-27 | UEFA Konferans Ligi Play Off | Qarabagh (1) - (0) Twente | MS 2 | pending | 36/100
- 2026-08-27 | CONCACAF Ligler Kupası Çeyrek Final | Toluca - Austin | 2.5 Alt | won | 56/100
- 2026-08-27 | Şili Kupa Grup E | Recoleta - O Higgins | 2.5 Alt | lost | 66/100
- 2026-08-27 | Kolombiya Primera A Clausura | Atletico Nacio - Deportivo Cali | 2.5 Üst | won | 70/100
- 2026-08-27 | CONCACAF Orta Amerika Kupası Grup A | Alajuelense - Plaza Amador | 2.5 Alt | lost | 68/100
- 2026-08-27 | CONCACAF Ligler Kupası Çeyrek Final | Club America - Columbus | 2.5 Alt | won | 56/100
- 2026-08-27 | Kolombiya Primera A Clausura | America De Cal - Atletico Junior | 2.5 Üst | won | 70/100
- 2026-08-27 | Arjantin Kupa Son 16 Turu | Platense - Instituto Cordo | MS 2 | pending | 36/100

