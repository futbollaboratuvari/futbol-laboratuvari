# Robot Öğrenme Hafızası Raporu

Oluşturma: 24.08.2026 16:08:17

## Özet

- Toplam tahmin: 947
- Bekleyen tahmin: 685
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

- 2.5 Alt: toplam 43, bekleyen 26, başarı %100, ağırlık 1.12
- 2.5 Üst: toplam 12, bekleyen 8, başarı %100, ağırlık 1
- MS X: toplam 366, bekleyen 251, başarı %31, ağırlık 0.88
- MS 1: toplam 81, bekleyen 57, başarı %29, ağırlık 0.88
- MS 2: toplam 286, bekleyen 185, başarı %28, ağırlık 0.88
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-24 | Fransa Ligue 2 | Reims - Annecy | MS 1 | pending | 44/100
- 2026-08-24 | Arjantin Ulusal Primera Lig | Club Atletico - Rafaela | MS X | pending | 35/100
- 2026-08-24 | Arjantin Premier Lig 2. Aşama | Racing Club - Boca Juniors | MS 2 | lost | 39/100
- 2026-08-24 | Meksika Liga MX Apertura | Pumas Unam - Necaxa | 2.5 Alt | won | 78/100
- 2026-08-24 | Meksika Ascenso MX Apertura | Cd Tapatio - Zacatecas | MS 1 | won | 43/100
- 2026-08-24 | Nikaragua Premier Lig Apertura | Walter Ferrett - Unan Managua | 2.5 Üst | pending | 57/100
- 2026-08-24 | Kolombiya Primera A Clausura | Atletico Junio - Once Caldas | 2.5 Alt | won | 78/100
- 2026-08-24 | Guatemala Ulusal Lig Apertura | Malacateco - Deportivo San P | 2.5 Alt | won | 75/100
- 2026-08-24 | Guatemala Ulusal Lig Apertura | Mixco - Guastatoya | 2.5 Üst | won | 61/100
- 2026-08-24 | Nikaragua Premier Lig Apertura | Jalapa - Matagalpa | 2.5 Üst | pending | 57/100
- 2026-08-24 | Honduras Ulusal Lig Apertura | Marathon - Real Espana | 2.5 Alt | won | 82/100
- 2026-08-24 | El Salvador Primera Lig Apertura | Balboa - Fuerte San Fran | 2.5 Alt | won | 76/100
- 2026-08-24 | Kolombiya Primera A Clausura | Deportivo Past - Llaneros | 2.5 Alt | won | 82/100
- 2026-08-24 | Bolivya Premier Lig | Guabira - Blooming | 2.5 Alt | won | 72/100
- 2026-08-24 | Brezilya Serie A | Chapecoense - Sao Paulo | 2.5 Alt | won | 78/100

