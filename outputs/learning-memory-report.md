# Robot Öğrenme Hafızası Raporu

Oluşturma: 24.08.2026 14:01:20

## Özet

- Toplam tahmin: 945
- Bekleyen tahmin: 707
- Kazanan tahmin: 70
- Kaybeden tahmin: 167
- Lig sayısı: 154
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- MS X: toplam 365, bekleyen 250, başarı %31, ağırlık 0.88
- MS 2: toplam 286, bekleyen 186, başarı %28, ağırlık 0.88
- MS 1: toplam 80, bekleyen 58, başarı %27, ağırlık 0.88
- 2.5 Alt: toplam 43, bekleyen 43, başarı bekleniyor, ağırlık 1
- 2.5 Üst: toplam 12, bekleyen 12, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-24 | Arjantin Premier Lig 2. Aşama | Racing Club - Boca Juniors | MS 2 | pending | 39/100
- 2026-08-24 | Meksika Liga MX Apertura | Pumas Unam - Necaxa | 2.5 Alt | pending | 57/100
- 2026-08-24 | Meksika Ascenso MX Apertura | Cd Tapatio - Zacatecas | MS 1 | pending | 43/100
- 2026-08-24 | Nikaragua Premier Lig Apertura | Walter Ferrett - Unan Managua | 2.5 Üst | pending | 57/100
- 2026-08-24 | Kolombiya Primera A Clausura | Atletico Junio - Once Caldas | 2.5 Alt | pending | 66/100
- 2026-08-24 | Guatemala Ulusal Lig Apertura | Malacateco - Deportivo San P | 2.5 Alt | pending | 63/100
- 2026-08-24 | Guatemala Ulusal Lig Apertura | Mixco - Guastatoya | 2.5 Üst | pending | 61/100
- 2026-08-24 | Nikaragua Premier Lig Apertura | Jalapa - Matagalpa | 2.5 Üst | pending | 57/100
- 2026-08-24 | Honduras Ulusal Lig Apertura | Marathon - Real Espana | 2.5 Alt | pending | 70/100
- 2026-08-24 | El Salvador Primera Lig Apertura | Balboa - Fuerte San Fran | 2.5 Alt | pending | 70/100
- 2026-08-24 | Kolombiya Primera A Clausura | Deportivo Past - Llaneros | 2.5 Alt | pending | 70/100
- 2026-08-24 | Bolivya Premier Lig | Guabira - Blooming | 2.5 Alt | pending | 61/100
- 2026-08-24 | Brezilya Serie A | Chapecoense - Sao Paulo | 2.5 Alt | pending | 66/100
- 2026-08-24 | Brezilya Serie A | Santos - Mirassol | 2.5 Alt | pending | 62/100
- 2026-08-24 | Brezilya Serie B | Criciuma - Fortaleza Ce | MS 1 | pending | 43/100

