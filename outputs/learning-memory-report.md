# Robot Öğrenme Hafızası Raporu

Oluşturma: 25.08.2026 11:59:44

## Özet

- Toplam tahmin: 1098
- Bekleyen tahmin: 797
- Kazanan tahmin: 117
- Kaybeden tahmin: 183
- Lig sayısı: 169
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 28, bekleyen 18, başarı %100, ağırlık 1.12
- 2.5 Alt: toplam 95, bekleyen 68, başarı %85, ağırlık 1.12
- MS 1: toplam 140, bekleyen 105, başarı %40, ağırlık 0.88
- MS X: toplam 366, bekleyen 250, başarı %31, ağırlık 0.88
- MS 2: toplam 310, bekleyen 198, başarı %30, ağırlık 0.88
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-25 | Paraguay Kupa 3.Tur | Sol De America - Sportivo Trinid | 2.5 Alt | pending | 64/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Dumbarton - Celtic Ii | 2.5 Alt | pending | 63/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Kelty Hearts - Clydebank Fc | 2.5 Alt | pending | 64/100
- 2026-08-25 | İngiltere Lig Kupası 2.Tur | Watford - Peterborough | 2.5 Alt | pending | 70/100
- 2026-08-25 | Portekiz U23 Ulusal Şampiyona | Estoril U23 - Moreirense U23 | 2.5 Alt | pending | 64/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Dumbarton - Celtic Ii | MS 2 | pending | 38/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | East Fife - St. Mirren Ii | MS 1 | pending | 50/100
- 2026-08-25 | Irak Premier Lig | Al Golan - Al Shorta | 2.5 Alt | pending | 64/100
- 2026-08-25 | İsveç Superettan | Orebro - Varbergs | 2.5 Alt | pending | 63/100
- 2026-08-25 | Portekiz U23 Ulusal Şampiyona | Marítimo U23 - Estrela U23 | 2.5 Alt | pending | 64/100
- 2026-08-25 | Arjantin Premier Lig 2. Aşama | Talleres - Rosario Central | 2.5 Üst | won | 66/100
- 2026-08-25 | Çek Cumhuriyeti Kupa 2.Tur | Fk Varnsdorf - Usti Nad Labem | MS 2 | pending | 49/100
- 2026-08-25 | Brezilya Serie B | Sport Recife - America Mineiro | 2.5 Üst | won | 79/100
- 2026-08-25 | Brezilya Serie B | Athletic Club - Novorizontino | 2.5 Üst | won | 74/100
- 2026-08-25 | Brezilya Serie A | Botafogo - Atletico Pr | 2.5 Üst | won | 70/100

