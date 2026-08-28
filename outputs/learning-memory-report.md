# Robot Öğrenme Hafızası Raporu

Oluşturma: 28.08.2026 08:30:16

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1121
- Kazanan tahmin: 171
- Kaybeden tahmin: 207
- Lig sayısı: 217
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 93, bekleyen 63, başarı %83, ağırlık 1.12
- 2.5 Alt: toplam 312, bekleyen 229, başarı %58, ağırlık 1.06
- MS 1: toplam 327, bekleyen 257, başarı %46, ağırlık 0.94
- MS 2: toplam 341, bekleyen 229, başarı %37, ağırlık 0.88
- MS X: toplam 267, bekleyen 184, başarı %30, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-28 | Galler FAW Championship Kuzey | Y Rhyl 1879 - Bala Town | 2.5 Alt | pending | 59/100
- 2026-08-28 | İsveç 2.Lig Vastra Götaland | Böljan - Qviding | 2.5 Alt | pending | 59/100
- 2026-08-28 | Almanya Bölgesel Lig Bayern | Ansbach 09 - Schwaben Augsbu | 2.5 Alt | pending | 58/100
- 2026-08-28 | Uruguay Kupa Ön Eleme Turu Grup 5 | Nacional Df - Albion | 2.5 Alt | pending | 60/100
- 2026-08-28 | Paraguay Kupa 3.Tur | Resistencia - Cerro Porteno | MS 2 | pending | 46/100
- 2026-08-28 | Arjantin Premier Lig 2. Aşama | Boca Juniors - Lanus | MS 1 | pending | 42/100
- 2026-08-28 | Meksika Liga MX Apertura | Atlante - Club Leon | 2.5 Alt | pending | 60/100
- 2026-08-28 | Meksika Liga MX Apertura | Necaxa - Cruz Azul | 2.5 Alt | pending | 72/100
- 2026-08-28 | Arjantin Ulusal Primera Lig | Gimnasia Y Tir - Chacarita Junio | MS 1 | pending | 60/100
- 2026-08-28 | Meksika Ascenso MX Apertura | Dorados - Monarcas | 2.5 Alt | pending | 59/100
- 2026-08-28 | Meksika Ascenso MX Apertura | Correcaminos U - Durango | 2.5 Üst | pending | 60/100
- 2026-08-28 | Honduras Ulusal Lig Apertura | Juticalpa - Upnfm | 2.5 Üst | pending | 60/100
- 2026-08-28 | Kosta Rika Premier Lig Apertura | Sporting San J - Inter San Carlo | MS 1 | pending | 49/100
- 2026-08-28 | Guatemala Ulusal Lig Apertura | Suchitepequez - Coban Imperial | 2.5 Üst | pending | 71/100
- 2026-08-28 | Meksika Liga MX Apertura | Club Tijuana - Pumas Unam | 2.5 Alt | pending | 74/100

