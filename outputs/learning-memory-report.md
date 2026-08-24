# Robot Öğrenme Hafızası Raporu

Oluşturma: 24.08.2026 20:01:52

## Özet

- Toplam tahmin: 954
- Bekleyen tahmin: 692
- Kazanan tahmin: 92
- Kaybeden tahmin: 169
- Lig sayısı: 154
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 48, bekleyen 31, başarı %100, ağırlık 1.12
- 2.5 Üst: toplam 12, bekleyen 8, başarı %100, ağırlık 1
- MS X: toplam 366, bekleyen 251, başarı %31, ağırlık 0.88
- MS 1: toplam 83, bekleyen 59, başarı %29, ağırlık 0.88
- MS 2: toplam 286, bekleyen 185, başarı %28, ağırlık 0.88
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-24 | İzlanda Urvalsdeild | Breidablik - Fram | MS 1 | pending | 38/100
- 2026-08-24 | İspanya 2.Lig | Celta Vigo Ii - Fc Andorra | 2.5 Alt | pending | 64/100
- 2026-08-24 | Rusya Premier Lig | Baltika Kalini - Rubin Kazan | MS 1 | pending | 37/100
- 2026-08-24 | Fransa Ligue 2 | Reims - Annecy | 2.5 Alt | pending | 64/100
- 2026-08-24 | İngiltere Premier Lig 2 | Newcastle (B) - Tottenham U21 | 2.5 Alt | pending | 63/100
- 2026-08-24 | İzlanda Urvalsdeild | Breidablik - Fram | 2.5 Alt | pending | 63/100
- 2026-08-24 | Portekiz U23 Ulusal Şampiyona | Sporting Braga - Gil Vicente U23 | 2.5 Alt | pending | 63/100
- 2026-08-24 | Fransa Ligue 2 | Reims - Annecy | MS 1 | pending | 44/100
- 2026-08-24 | Arjantin Ulusal Primera Lig | Club Atletico - Rafaela | MS X | pending | 35/100
- 2026-08-24 | Arjantin Premier Lig 2. Aşama | Racing Club - Boca Juniors | MS 2 | lost | 39/100
- 2026-08-24 | Meksika Liga MX Apertura | Pumas Unam - Necaxa | 2.5 Alt | won | 78/100
- 2026-08-24 | Meksika Ascenso MX Apertura | Cd Tapatio - Zacatecas | MS 1 | won | 43/100
- 2026-08-24 | Nikaragua Premier Lig Apertura | Walter Ferrett - Unan Managua | 2.5 Üst | pending | 57/100
- 2026-08-24 | Kolombiya Primera A Clausura | Atletico Junio - Once Caldas | 2.5 Alt | won | 78/100
- 2026-08-24 | Guatemala Ulusal Lig Apertura | Malacateco - Deportivo San P | 2.5 Alt | won | 75/100

