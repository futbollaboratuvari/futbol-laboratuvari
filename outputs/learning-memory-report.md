# Robot Öğrenme Hafızası Raporu

Oluşturma: 30.08.2026 20:17:17

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1194
- Kazanan tahmin: 161
- Kaybeden tahmin: 145
- Lig sayısı: 204
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- 2.5 Üst: toplam 192, bekleyen 125, başarı %64, ağırlık 1.12
- MS 2: toplam 206, bekleyen 179, başarı %52, ağırlık 1
- MS 1: toplam 500, bekleyen 433, başarı %51, ağırlık 1
- 2.5 Alt: toplam 597, bekleyen 454, başarı %48, ağırlık 0.94
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-30 | Arjantin Premier Lig 2. Aşama | Independiente - Gimnasia Mendoz | 2.5 Alt | pending | 47/100
- 2026-08-30 | İtalya Serie A | Lazio - Genoa | MS 1 | pending | 50/100
- 2026-08-30 | İtalya Serie A | Cagliari - Inter | 2.5 Alt | pending | 54/100
- 2026-08-30 | Türkiye Süper Lig | Samsunspor - Fenerbahçe | MS 2 | pending | 51/100
- 2026-08-30 | İspanya Primera Lig RFEF Grup 2 | Antequera - Ud Ibiza | MS 1 | pending | 44/100
- 2026-08-30 | İspanya Primera Lig RFEF Grup 2 | Cd Aguilas - Alcorcon | MS 1 | pending | 44/100
- 2026-08-30 | İspanya Primera Lig RFEF Grup 2 | Atl Madrid Ii - Juventud Torrem | 2.5 Üst | pending | 60/100
- 2026-08-30 | Almanya 3. Lig | Viktoria Köln - Preussen Munste | MS 1 | pending | 50/100
- 2026-08-30 | İskoçya Premiership | Aberdeen - Glasgow Rangers | 2.5 Alt | pending | 51/100
- 2026-08-30 | İspanya Kadınlar Primera Lig | Athletic Club - Badalona (K) | 2.5 Üst | pending | 72/100
- 2026-08-30 | ABD USL | El Paso Locomo - Loudoun United | MS 1 | pending | 60/100
- 2026-08-30 | ABD MLS | Atlanta Utd - Charlotte | 2.5 Alt | pending | 44/100
- 2026-08-30 | Brezilya Serie A | Vasco Da Gama - Cruzeiro | 2.5 Üst | pending | 78/100
- 2026-08-30 | Meksika Liga MX Apertura | Pachuca - Guadalajara | 2.5 Alt | pending | 54/100
- 2026-08-30 | ABD USL Lig 1 | Greenville Tri - Naples | MS 1 | pending | 49/100

