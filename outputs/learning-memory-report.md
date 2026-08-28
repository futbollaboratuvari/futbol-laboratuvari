# Robot Öğrenme Hafızası Raporu

Oluşturma: 28.08.2026 12:46:47

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1126
- Kazanan tahmin: 170
- Kaybeden tahmin: 203
- Lig sayısı: 218
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 96, bekleyen 66, başarı %83, ağırlık 1.12
- 2.5 Alt: toplam 327, bekleyen 244, başarı %58, ağırlık 1.06
- MS 1: toplam 335, bekleyen 266, başarı %46, ağırlık 0.94
- MS 2: toplam 329, bekleyen 221, başarı %37, ağırlık 0.88
- MS X: toplam 253, bekleyen 170, başarı %30, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-28 | Portekiz Premier Lig | Rio Ave - Sporting Cp | 2.5 Alt | pending | 59/100
- 2026-08-28 | ABD USL Lig 1 | Charlotte Inde - Alta | MS 1 | pending | 51/100
- 2026-08-28 | Meksika Liga MX Apertura | Atlante - Club Leon | 2.5 Üst | pending | 60/100
- 2026-08-28 | Meksika Liga MX Apertura | Club Tijuana - Pumas Unam | 2.5 Üst | pending | 75/100
- 2026-08-28 | İskoçya 2.Lig | Edinburg C. - Forfar | MS 1 | pending | 49/100
- 2026-08-28 | İngiltere Ulusal Lig N / S Kuzey | Oxford City - Buxton | MS 2 | pending | 34/100
- 2026-08-28 | İngiltere Ulusal Lig N / S Kuzey | Morecambe - Telford | MS 1 | pending | 43/100
- 2026-08-28 | İngiltere Non League Premier Kuzey | Ashton United - Gainsborough Tr | 2.5 Alt | pending | 54/100
- 2026-08-28 | Portekiz Kupa 1.Tur | Beira Mar - Uniao Lamas | 2.5 Alt | pending | 60/100
- 2026-08-28 | Polonya 2.Lig | Resovia Rzeszo - Sandecja Nowy S | MS 2 | pending | 37/100
- 2026-08-28 | İtalya Serie A | Ac Milan - Unione V. | MS 1 | pending | 53/100
- 2026-08-28 | Fransa Ligue 1 | Lille - Psg | 2.5 Üst | pending | 60/100
- 2026-08-28 | Galler Premier Lig 1.Aşama | Cardiff Mu - Briton Ferry | 2.5 Alt | pending | 53/100
- 2026-08-28 | İrlanda 1.Lig | Cobh Ramblers - Longford | 2.5 Alt | pending | 58/100
- 2026-08-28 | Hollanda Eerste Divisie | Roda - Breda | 2.5 Alt | pending | 54/100

