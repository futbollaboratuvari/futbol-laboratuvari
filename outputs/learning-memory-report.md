# Robot Öğrenme Hafızası Raporu

Oluşturma: 30.08.2026 00:12:23

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1169
- Kazanan tahmin: 179
- Kaybeden tahmin: 152
- Lig sayısı: 217
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 3, bekleyen 2, başarı %100, ağırlık 1
- 2.5 Üst: toplam 192, bekleyen 128, başarı %69, ağırlık 1.12
- MS 2: toplam 195, bekleyen 153, başarı %52, ağırlık 1
- 2.5 Alt: toplam 609, bekleyen 467, başarı %51, ağırlık 1
- MS 1: toplam 497, bekleyen 415, başarı %49, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- MS X: toplam 3, bekleyen 3, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-30 | Peru Premier Lig Clausura | Cienciano - Cusco Fc | MS 1 | pending | 49/100
- 2026-08-30 | Şili Premier Lig | Coquimbo Unido - Huachipato | MS 1 | pending | 57/100
- 2026-08-30 | Arjantin Premier Lig 2. Aşama | Rivadavia - Racing Club | 2.5 Alt | pending | 73/100
- 2026-08-30 | Guatemala Ulusal Lig Apertura | Xelaju - Mixco | 2.5 Alt | pending | 66/100
- 2026-08-30 | Nikaragua Premier Lig Apertura | Unan Managua - Managua | MS 2 | pending | 55/100
- 2026-08-30 | Kolombiya Primera A Clausura | Deportivo Cali - Bucaramanga | 2.5 Alt | pending | 76/100
- 2026-08-30 | Meksika Liga MX Apertura | Monterrey - Atletico San Lu | MS 1 | pending | 60/100
- 2026-08-30 | Honduras Ulusal Lig Apertura | Estrella Roja - Depor. Olimpia | 2.5 Üst | pending | 72/100
- 2026-08-30 | El Salvador Primera Lig Apertura | Aguila - Fuerte San Fran | MS 1 | pending | 60/100
- 2026-08-30 | Kolombiya Primera A Clausura | Independiente - Llaneros | 2.5 Alt | pending | 75/100
- 2026-08-30 | Brezilya Serie A | Mirassol - Palmeiras | 2.5 Alt | pending | 72/100
- 2026-08-30 | Brezilya Serie A | Gremio - Chapecoense | 2.5 Alt | pending | 73/100
- 2026-08-30 | Şili Premier Lig | Colo Colo - Audax Italiano | MS 1 | pending | 58/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | San Martin Tuc - Club Atletico G | MS 1 | pending | 60/100
- 2026-08-30 | Brezilya Serie B | Vila Nova - Ceara | 2.5 Alt | pending | 73/100

