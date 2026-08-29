# Robot Öğrenme Hafızası Raporu

Oluşturma: 29.08.2026 21:33:34

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1232
- Kazanan tahmin: 157
- Kaybeden tahmin: 111
- Lig sayısı: 216
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 191, bekleyen 142, başarı %71, ağırlık 1.12
- MS 2: toplam 200, bekleyen 164, başarı %61, ağırlık 1.06
- 2.5 Alt: toplam 601, bekleyen 489, başarı %55, ağırlık 1.06
- MS 1: toplam 501, bekleyen 430, başarı %54, ağırlık 1
- KG Var: toplam 3, bekleyen 3, başarı bekleniyor, ağırlık 1
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- MS X: toplam 3, bekleyen 3, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-29 | Meksika Liga MX Apertura | Pachuca - Guadalajara | 2.5 Üst | pending | 67/100
- 2026-08-29 | Norveç 3.Lig Grup 4 | Hinna - Vag Fk | MS 1 | pending | 45/100
- 2026-08-29 | Belarus 1.Lig | Ostrovets Fc - Volna Pinsk | MS 1 | pending | 45/100
- 2026-08-29 | Finlandiya Ykkönen | Oulun Ls - Tampere Utd | MS 1 | pending | 45/100
- 2026-08-29 | Japonya J1 Lig | Mito Hollyhock - Machida Zelvia | 2.5 Alt | pending | 70/100
- 2026-08-29 | Meksika Liga MX Apertura | Club Tijuana - Pumas Unam | 2.5 Alt | pending | 60/100
- 2026-08-29 | Meksika Liga MX Apertura | Atlante - Club Leon | 2.5 Alt | pending | 59/100
- 2026-08-29 | Arjantin Premier Lig 2. Aşama | Rosario Centra - Gimnasia La Pla | MS 1 | pending | 55/100
- 2026-08-29 | Suudi Arabistan Pro Lig | Al Kholood - Al Ahli (Cidde) | MS 2 | pending | 60/100
- 2026-08-29 | Hırvatistan 1.HNL | Istra - Dinamo Zagreb | KG Var | pending | 39/100
- 2026-08-29 | Birleşik Arap Emirlikleri Arap Körfez Ligi | Al Ain - Al Nasr | MS 1 | pending | 57/100
- 2026-08-29 | Avusturya 1.Lig | Avusturya Wien - Bregenz | MS 1 | pending | 49/100
- 2026-08-29 | Malta Premier Lig Açılış | Hamrun - Floriana | MS 1 | pending | 53/100
- 2026-08-29 | İspanya LaLiga | Real Sociedad - Espanyol | MS 1 | pending | 47/100
- 2026-08-29 | Macaristan NB III Kuzeybatı | Veszprem - Gyor Ii | 2.5 Alt | pending | 53/100

