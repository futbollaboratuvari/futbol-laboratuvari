# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 23:42:28

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1196
- Kazanan tahmin: 148
- Kaybeden tahmin: 156
- Lig sayısı: 267
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 533, bekleyen 427, başarı %55, düz getiri %-9, ağırlık 1
- 2.5 Üst: toplam 223, bekleyen 150, başarı %52, düz getiri %-7, ağırlık 1
- MS X: toplam 5, bekleyen 3, başarı %50, düz getiri %61, ağırlık 1
- MS 1: toplam 511, bekleyen 432, başarı %46, düz getiri %-20, ağırlık 1
- MS 2: toplam 220, bekleyen 181, başarı %36, düz getiri %-31, ağırlık 1
- KG Var: toplam 8, bekleyen 3, başarı %20, düz getiri %-59, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | İtalya Serie B | Cesena - Cremonese | 2.5 Üst | pending | 69/100
- 2026-09-12 | Fransa Kadınlar 1.Lig | Fc Nantes (K) - Fleury 91 (K) | 2.5 Alt | pending | 61/100
- 2026-09-12 | Fransa Kadınlar 1.Lig | Saint Malo (K) - Montpellier (K) | 2.5 Alt | pending | 60/100
- 2026-09-12 | İtalya Serie A | Lazio - Ac Milan | 2.5 Üst | pending | 67/100
- 2026-09-12 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Djoliba (0) - (1) Club Africain | 2.5 Üst | pending | 57/100
- 2026-09-12 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Young Africans (1) - (1) Gaborone United | 2.5 Üst | pending | 62/100
- 2026-09-12 | Meksika Ascenso MX Apertura | Tlaxcala - Cds Tampico Mad | 2.5 Üst | pending | 54/100
- 2026-09-12 | Cezayir 1.Lig | Cs Constantine - Aso Chlef | MS 1 | pending | 56/100
- 2026-09-12 | İspanya Tercera Ligi Grup 13 | Bala Azul - Mazarron Fc | MS 2 | pending | 42/100
- 2026-09-12 | Fransa Ligue 1 | Le Havre - Angers | 2.5 Üst | pending | 60/100
- 2026-09-12 | Arjantin Primera C | Estrella Del S - Yupanqui | MS 1 | pending | 48/100
- 2026-09-12 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Rahimo (1) - (4) Maghreb Fes | 2.5 Alt | won | 63/100
- 2026-09-12 | CAF Konfederasyon Kupası 1.Ön Eleme Turu | Kitara (2) - (1) Mogadishu City | 2.5 Alt | won | 65/100
- 2026-09-12 | İspanya LaLiga | Osasuna - Espanyol | 2.5 Alt | won | 70/100
- 2026-09-12 | İspanya Kadınlar Primera Lig | Madrid Cf (K) - Sevilla (K) | MS 1 | won | 64/100

