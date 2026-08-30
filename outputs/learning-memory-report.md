# Robot Öğrenme Hafızası Raporu

Oluşturma: 31.08.2026 00:16:00

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1140
- Kazanan tahmin: 190
- Kaybeden tahmin: 170
- Lig sayısı: 192
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- 2.5 Üst: toplam 200, bekleyen 125, başarı %64, ağırlık 1.12
- MS 1: toplam 499, bekleyen 417, başarı %54, ağırlık 1
- MS 2: toplam 202, bekleyen 164, başarı %53, ağırlık 1
- 2.5 Alt: toplam 594, bekleyen 431, başarı %47, ağırlık 0.94
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-31 | Nikaragua Premier Lig Apertura | San Marcos - Walter Ferretti | MS 2 | pending | 50/100
- 2026-08-31 | Kolombiya Primera A Clausura | Los Millionari - Inter Bogota | 2.5 Üst | pending | 60/100
- 2026-08-31 | Honduras Ulusal Lig Apertura | Real Espana - Choloma | MS 1 | pending | 60/100
- 2026-08-31 | Venezuela Premier Lig Clausura | Deportivo La G - Estudiantes Fc | MS 1 | pending | 58/100
- 2026-08-31 | El Salvador Primera Lig Apertura | Deportivo Fas - Firpo | 2.5 Alt | pending | 49/100
- 2026-08-31 | Peru Premier Lig Clausura | Cienciano - Cusco Fc | MS 1 | pending | 46/100
- 2026-08-31 | Şili Premier Lig | Coquimbo Unido - Huachipato | MS 1 | pending | 59/100
- 2026-08-31 | Arjantin Premier Lig 2. Aşama | Rivadavia - Racing Club | 2.5 Alt | pending | 56/100
- 2026-08-31 | Guatemala Ulusal Lig Apertura | Xelaju - Mixco | 2.5 Alt | pending | 53/100
- 2026-08-31 | Nikaragua Premier Lig Apertura | Unan Managua - Managua | MS 2 | pending | 54/100
- 2026-08-31 | Kolombiya Primera A Clausura | Deportivo Cali - Bucaramanga | 2.5 Alt | pending | 61/100
- 2026-08-31 | Meksika Liga MX Apertura | Monterrey - Atletico San Lu | MS 1 | pending | 57/100
- 2026-08-31 | Venezuela Premier Lig Clausura | Depor Tachira - Caracas Fc | MS 1 | pending | 59/100
- 2026-08-31 | Arjantin Ulusal Primera Lig | Godoy Cruz - San Telmo | 2.5 Alt | pending | 57/100
- 2026-08-31 | Brezilya Serie B | Regatas - Criciuma | 2.5 Alt | pending | 49/100

