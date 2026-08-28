# Robot Öğrenme Hafızası Raporu

Oluşturma: 28.08.2026 15:15:01

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

- 2.5 Üst: toplam 99, bekleyen 69, başarı %83, ağırlık 1.12
- 2.5 Alt: toplam 332, bekleyen 249, başarı %58, ağırlık 1.06
- MS 1: toplam 336, bekleyen 267, başarı %46, ağırlık 0.94
- MS 2: toplam 329, bekleyen 221, başarı %37, ağırlık 0.88
- MS X: toplam 244, bekleyen 161, başarı %30, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-28 | Hazırlık Kulüpler | Real Unión De - San Miguel | 2.5 Alt | pending | 59/100
- 2026-08-28 | Hazırlık Kulüpler | Sanluqueno - Real Betis Ii | 2.5 Alt | pending | 59/100
- 2026-08-28 | İrlanda Premier Lig | Galway United - Shelbourne | 2.5 Üst | pending | 60/100
- 2026-08-28 | Hollanda Eerste Divisie | Oss - Utrecht (Ii) | 2.5 Alt | pending | 54/100
- 2026-08-28 | Norveç 3.Lig Grup 1 | Fk Union Carl - Kfum Ii | MS 1 | pending | 49/100
- 2026-08-28 | Hazırlık Kulüpler | Yeclano - Alcoyano | 2.5 Alt | pending | 60/100
- 2026-08-28 | Hazırlık Kulüpler | Portugalete - G.Torrelavega | 2.5 Alt | pending | 60/100
- 2026-08-28 | Mısır 2. Lig | Masar - Derot | 2.5 Üst | pending | 60/100
- 2026-08-28 | Mısır Premier Lig | Enppi - Wadi Degla | MS 2 | pending | 32/100
- 2026-08-28 | Belarus Premier Lig | Vitebsk - Naftan | 2.5 Üst | pending | 60/100
- 2026-08-28 | Portekiz Premier Lig | Rio Ave - Sporting Cp | 2.5 Alt | pending | 61/100
- 2026-08-28 | ABD USL Lig 1 | Charlotte Inde - Alta | MS 1 | pending | 51/100
- 2026-08-28 | Meksika Liga MX Apertura | Atlante - Club Leon | 2.5 Üst | pending | 60/100
- 2026-08-28 | Meksika Liga MX Apertura | Club Tijuana - Pumas Unam | 2.5 Üst | pending | 75/100
- 2026-08-28 | İskoçya 2.Lig | Edinburg C. - Forfar | MS 1 | pending | 49/100

