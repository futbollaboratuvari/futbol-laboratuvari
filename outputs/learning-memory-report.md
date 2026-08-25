# Robot Öğrenme Hafızası Raporu

Oluşturma: 25.08.2026 08:00:02

## Özet

- Toplam tahmin: 1090
- Bekleyen tahmin: 789
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
- 2.5 Alt: toplam 89, bekleyen 62, başarı %85, ağırlık 1.12
- MS 1: toplam 139, bekleyen 104, başarı %40, ağırlık 0.88
- MS X: toplam 366, bekleyen 250, başarı %31, ağırlık 0.88
- MS 2: toplam 309, bekleyen 197, başarı %30, ağırlık 0.88
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-25 | İsveç Superettan | Orebro - Varbergs | 2.5 Alt | pending | 64/100
- 2026-08-25 | Portekiz U23 Ulusal Şampiyona | Marítimo U23 - Estrela U23 | 2.5 Alt | pending | 64/100
- 2026-08-25 | Arjantin Premier Lig 2. Aşama | Talleres - Rosario Central | 2.5 Üst | won | 66/100
- 2026-08-25 | Çek Cumhuriyeti Kupa 2.Tur | Fk Varnsdorf - Usti Nad Labem | MS 2 | pending | 50/100
- 2026-08-25 | Brezilya Serie B | Sport Recife - America Mineiro | 2.5 Üst | won | 79/100
- 2026-08-25 | Brezilya Serie B | Athletic Club - Novorizontino | 2.5 Üst | won | 74/100
- 2026-08-25 | Brezilya Serie A | Botafogo - Atletico Pr | 2.5 Üst | won | 70/100
- 2026-08-25 | Almanya Bölgesel Lig Kuzey Doğu | Leipzig - Chemnitzer | MS 1 | pending | 43/100
- 2026-08-25 | Irak Premier Lig | Zakho - Diala | MS 1 | pending | 46/100
- 2026-08-25 | Bolivya Premier Lig | Universitario - Nacional Potosi | MS 1 | pending | 39/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Cumbernauld Co - Kilmarnock Ii | 2.5 Alt | pending | 64/100
- 2026-08-25 | Paraguay Kupa 3.Tur | General Caball - Rubio Nu | 2.5 Alt | pending | 64/100
- 2026-08-25 | Portekiz U23 Ulusal Şampiyona | Sporting Cp U2 - Benfica U23 | 2.5 Alt | pending | 64/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Annan - Berwick | MS 1 | pending | 49/100
- 2026-08-25 | İskoçya Challenge Kupası Lig Aşaması | Clachnacuddin - Elgin | MS 2 | pending | 43/100

