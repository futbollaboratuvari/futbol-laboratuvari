# Robot Öğrenme Hafızası Raporu

Oluşturma: 29.08.2026 05:19:33

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1270
- Kazanan tahmin: 133
- Kaybeden tahmin: 97
- Lig sayısı: 218
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 171, bekleyen 141, başarı %83, ağırlık 1.12
- 2.5 Alt: toplam 572, bekleyen 485, başarı %60, ağırlık 1.06
- MS 1: toplam 487, bekleyen 428, başarı %53, ağırlık 1
- MS 2: toplam 235, bekleyen 189, başarı %48, ağırlık 0.94
- MS X: toplam 34, bekleyen 26, başarı %38, ağırlık 0.88
- KG Var: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-29 | Slovakya Süper Lig | Dukla Banska B - Kfc Komarno | 2.5 Alt | pending | 57/100
- 2026-08-29 | İtalya Serie A Kadınlar Kupası Grup C | Ac Milan (K) - Como (K) | MS 1 | pending | 53/100
- 2026-08-29 | İtalya Serie A | Juventus - Parma | 2.5 Alt | pending | 64/100
- 2026-08-29 | Fransa Ligue 1 | Auxerre - Angers | 2.5 Alt | pending | 68/100
- 2026-08-29 | Fransa Ligue 1 | Lorient - Troyes | 2.5 Alt | pending | 71/100
- 2026-08-29 | Fransa Ligue 1 | Lyon - Le Havre | MS 1 | pending | 60/100
- 2026-08-29 | Fransa Ligue 1 | Brest - Toulouse | 2.5 Alt | pending | 68/100
- 2026-08-29 | Belçika Pro Lig | Cercle Brugge - Lommel | MS 1 | pending | 58/100
- 2026-08-29 | Belçika Pro Lig | Oh Leuven - Standard Liege | 2.5 Üst | pending | 60/100
- 2026-08-29 | Bosna-Hersek Premier Lig | Sarajevo - Zrinjski | 2.5 Alt | pending | 60/100
- 2026-08-29 | Avusturya Bundesliga | Lask Linz - Altach | MS 1 | pending | 60/100
- 2026-08-29 | Macaristan NB I | Ujpest - Vasas | MS 1 | pending | 47/100
- 2026-08-29 | Hırvatistan 2.HNL | Karlovac 1919 - Opatija | 2.5 Alt | pending | 60/100
- 2026-08-29 | Arjantin Premier Lig 2. Aşama | Riestra - Velez Sarsfield | MS X | pending | 27/100
- 2026-08-29 | Suudi Arabistan Pro Lig | Al Fateh - Al Ittihad (Cid | MS 2 | pending | 37/100

