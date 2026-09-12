# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 22:40:55

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1195
- Kazanan tahmin: 149
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

- 2.5 Alt: toplam 532, bekleyen 426, başarı %55, düz getiri %-9, ağırlık 1
- 2.5 Üst: toplam 220, bekleyen 147, başarı %52, düz getiri %-7, ağırlık 1
- MS X: toplam 5, bekleyen 3, başarı %50, düz getiri %61, ağırlık 1
- MS 1: toplam 514, bekleyen 434, başarı %46, düz getiri %-19, ağırlık 1
- MS 2: toplam 221, bekleyen 182, başarı %36, düz getiri %-31, ağırlık 1
- KG Var: toplam 8, bekleyen 3, başarı %20, düz getiri %-59, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | Meksika Ascenso MX Apertura | Tlaxcala - Cds Tampico Mad | 2.5 Üst | pending | 54/100
- 2026-09-12 | Cezayir 1.Lig | Cs Constantine - Aso Chlef | MS 1 | pending | 56/100
- 2026-09-12 | İspanya Tercera Ligi Grup 13 | Bala Azul - Mazarron Fc | MS 2 | pending | 42/100
- 2026-09-12 | Fransa Ligue 1 | Le Havre - Angers | 2.5 Üst | pending | 60/100
- 2026-09-12 | Arjantin Primera C | Estrella Del S - Yupanqui | MS 1 | pending | 48/100
- 2026-09-12 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Rahimo (1) - (4) Maghreb Fes | 2.5 Alt | won | 63/100
- 2026-09-12 | CAF Konfederasyon Kupası 1.Ön Eleme Turu | Kitara (2) - (1) Mogadishu City | 2.5 Alt | won | 62/100
- 2026-09-12 | İspanya LaLiga | Osasuna - Espanyol | 2.5 Alt | won | 70/100
- 2026-09-12 | İspanya Kadınlar Primera Lig | Madrid Cf (K) - Sevilla (K) | MS 1 | won | 64/100
- 2026-09-12 | İngiltere Ulusal Lig | Boston United - Wealdstone | MS 1 | lost | 59/100
- 2026-09-12 | İngiltere 2.Lig | Walsall - Rochdale | 2.5 Alt | won | 66/100
- 2026-09-12 | İngiltere Ulusal Lig | Halifax - Hornchurch | MS 1 | won | 67/100
- 2026-09-12 | İngiltere Ulusal Lig | Sutton United - Scunthorpe | 2.5 Alt | won | 61/100
- 2026-09-12 | İngiltere Championship | Swansea - Burnley | 2.5 Üst | won | 72/100
- 2026-09-12 | İngiltere Championship | Charlton - Portsmouth | 2.5 Alt | won | 71/100

