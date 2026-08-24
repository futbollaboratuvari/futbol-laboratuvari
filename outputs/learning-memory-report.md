# Robot Öğrenme Hafızası Raporu

Oluşturma: 24.08.2026 13:56:03

## Özet

- Toplam tahmin: 914
- Bekleyen tahmin: 676
- Kazanan tahmin: 70
- Kaybeden tahmin: 167
- Lig sayısı: 153
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- MS X: toplam 365, bekleyen 250, başarı %31, ağırlık 0.88
- MS 2: toplam 285, bekleyen 185, başarı %28, ağırlık 0.88
- MS 1: toplam 76, bekleyen 54, başarı %27, ağırlık 0.88
- 2.5 Üst: toplam 6, bekleyen 6, başarı bekleniyor, ağırlık 1
- 2.5 Alt: toplam 23, bekleyen 23, başarı bekleniyor, ağırlık 1
- Güncel maç değil: toplam 159, bekleyen 158, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-24 | İngiltere Premier Lig | Fulham - Chelsea | 2.5 Üst | pending | 52/100
- 2026-08-24 | İtalya Serie C Grup C | Team Altamura - Ss Monopoli 196 | MS 2 | pending | 39/100
- 2026-08-24 | Arjantin Ulusal Primera Lig | Club Atletico - Rafaela | MS 1 | pending | 36/100
- 2026-08-24 | Portekiz U23 Ulusal Şampiyona | Sporting Braga - Gil Vicente U23 | MS 1 | pending | 43/100
- 2026-08-24 | Portekiz Premier Lig | Gil Vicente - Casa Pia | 2.5 Alt | pending | 61/100
- 2026-08-24 | Portekiz 2.Lig | Feirense - Porto (B) | 2.5 Alt | pending | 60/100
- 2026-08-24 | İzlanda Urvalsdeild | Breidablik - Fram | MS 2 | pending | 38/100
- 2026-08-24 | İspanya LaLiga | Malaga - D.La Coruna | 2.5 Alt | pending | 56/100
- 2026-08-24 | İspanya 2.Lig | Granada - Mallorca | 2.5 Alt | pending | 58/100
- 2026-08-24 | Rusya Premier Lig | Baltika Kalini - Rubin Kazan | 2.5 Alt | pending | 56/100
- 2026-08-24 | Belarus Premier Lig | Torpedo Zhodin - Dnepr Mogilev | MS 1 | pending | 45/100
- 2026-08-24 | Suudi Arabistan Pro Lig | Al Ittihad (Ci - Al Hazm | MS 1 | pending | 49/100
- 2026-08-24 | Hollanda Eerste Divisie | Utrecht (Ii) - Heracles | MS 2 | pending | 47/100
- 2026-08-24 | Hollanda Eerste Divisie | Psv (B) - Oss | MS 1 | pending | 46/100
- 2026-08-24 | İngiltere Premier Lig 2 | Sunderland (B) - Nottingham Fore | 2.5 Alt | pending | 54/100

