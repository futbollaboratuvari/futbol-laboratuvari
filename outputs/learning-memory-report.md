# Robot Öğrenme Hafızası Raporu

Oluşturma: 28.08.2026 02:57:32

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1135
- Kazanan tahmin: 163
- Kaybeden tahmin: 201
- Lig sayısı: 217
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 93, bekleyen 66, başarı %89, ağırlık 1.12
- 2.5 Alt: toplam 308, bekleyen 234, başarı %62, ağırlık 1.12
- MS 1: toplam 328, bekleyen 262, başarı %42, ağırlık 0.94
- MS 2: toplam 342, bekleyen 230, başarı %36, ağırlık 0.88
- MS X: toplam 269, bekleyen 184, başarı %29, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

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
- 2026-08-28 | Avustralya NPL Tazmanya Ön Eleme Final | South Hobart - Kingborough Lio | MS 1 | pending | 37/100
- 2026-08-28 | Avustralya NPL Kuzey YGG Play-Off 1.Tur | Kahibah (2) - (1) New Lambton Fc | MS 1 | pending | 42/100
- 2026-08-28 | İngiltere Championship | Wrexham - Birmingham | 2.5 Üst | pending | 66/100
- 2026-08-28 | İspanya 2.Lig | Tenerife - Sporting Gijon | 2.5 Alt | pending | 73/100
- 2026-08-28 | İrlanda Premier Lig | Drogheda - Dundalk | 2.5 Üst | pending | 60/100

