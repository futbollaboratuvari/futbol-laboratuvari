# Robot Öğrenme Hafızası Raporu

Oluşturma: 25.08.2026 14:50:40

## Özet

- Toplam tahmin: 1110
- Bekleyen tahmin: 809
- Kazanan tahmin: 117
- Kaybeden tahmin: 183
- Lig sayısı: 170
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 30, bekleyen 20, başarı %100, ağırlık 1.12
- 2.5 Alt: toplam 99, bekleyen 72, başarı %85, ağırlık 1.12
- MS 1: toplam 144, bekleyen 109, başarı %40, ağırlık 0.88
- MS X: toplam 366, bekleyen 250, başarı %31, ağırlık 0.88
- MS 2: toplam 312, bekleyen 200, başarı %30, ağırlık 0.88
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-25 | İngiltere Professional Development Lig | Wigan Athletic - Cardiff City U2 | 2.5 Alt | pending | 63/100
- 2026-08-25 | İngiltere Professional Development Lig | Wigan Athletic - Cardiff City U2 | MS 2 | pending | 38/100
- 2026-08-25 | Brezilya Serie B | Juventude - Regatas | MS 1 | pending | 43/100
- 2026-08-25 | İngiltere Non League Premier Kuzey | Workington - Rylands | 2.5 Alt | pending | 64/100
- 2026-08-25 | Kuveyt Premier Lig | Al Fahaheel - Al Qadsia | MS 2 | pending | 49/100
- 2026-08-25 | Tanzanya Kuu Bara Ligi | Namungo - Fountain Gate | MS 1 | pending | 41/100
- 2026-08-25 | Portekiz U23 Ulusal Şampiyona | Leixoes U23 - União De Leiria | 2.5 Üst | pending | 64/100
- 2026-08-25 | Irak Premier Lig | Al Zawraa - Naft Maysan | MS 1 | pending | 46/100
- 2026-08-25 | Güney Kore K Lig 1 | Fc Seoul - Bucheon | 2.5 Alt | pending | 62/100
- 2026-08-25 | Portekiz U23 Ulusal Şampiyona | Sporting Cp U2 - Benfica U23 | 2.5 Üst | pending | 64/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Bonnyrigg Rose - Rangers Ii | 2.5 Alt | pending | 63/100
- 2026-08-25 | Kazakistan Premier Lig | Tobol Kostanay - Kaisar | MS 1 | pending | 47/100
- 2026-08-25 | Paraguay Kupa 3.Tur | Sol De America - Sportivo Trinid | 2.5 Alt | pending | 64/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Dumbarton - Celtic Ii | 2.5 Alt | pending | 62/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Kelty Hearts - Clydebank Fc | 2.5 Alt | pending | 64/100

