# Robot Öğrenme Hafızası Raporu

Oluşturma: 10.09.2026 12:09:49

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1099
- Kazanan tahmin: 212
- Kaybeden tahmin: 189
- Lig sayısı: 261
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 237, bekleyen 148, başarı %57, düz getiri %0, ağırlık 1
- MS 1: toplam 490, bekleyen 372, başarı %54, düz getiri %-11, ağırlık 1
- 2.5 Alt: toplam 552, bekleyen 413, başarı %50, düz getiri %-18, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- MS 2: toplam 215, bekleyen 162, başarı %49, düz getiri %-15, ağırlık 1
- MS X: toplam 3, bekleyen 3, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-10 | Ekvador Pro Lig Serie B Şampiyonluk Grubu | San Antonio - Atletico Fc | 2.5 Alt | pending | 58/100
- 2026-09-10 | Ekvador Pro Lig Serie B Küme Düşme Grubu | Cumbaya - Gualaceo | MS 1 | pending | 40/100
- 2026-09-10 | Paraguay Intermedia Lig | Sportivo Carap - Benjamin Aceval | 2.5 Alt | pending | 50/100
- 2026-09-10 | Gürcistan Erovnuli Liga | Dinamo Tiflis - Meshakhte | MS 1 | pending | 59/100
- 2026-09-10 | Özbekistan Super League | Xorazm Urganch - Sogdiyona Jizza | 2.5 Üst | pending | 53/100
- 2026-09-10 | Guatemala Ulusal Lig Apertura | Suchitepequez - Guastatoya | MS 1 | pending | 58/100
- 2026-09-10 | ABD MLS | Portland - St. Louis City | MS 2 | pending | 57/100
- 2026-09-10 | Mısır 2. Lig | Kahraba Ismail - El Daklyeh | 2.5 Alt | pending | 57/100
- 2026-09-10 | ABD MLS | Montreal - Charlotte | MS 2 | pending | 61/100
- 2026-09-10 | ABD MLS | Toronto - Nashville Sc | MS X | pending | 56/100
- 2026-09-10 | Brezilya Serie B | America Mineir - Nautico | 2.5 Üst | pending | 62/100
- 2026-09-10 | Guatemala Ulusal Lig Apertura | Comunicaciones - Marquense | 2.5 Alt | pending | 69/100
- 2026-09-10 | ABD MLS | Chicago - Inter Miami | MS 1 | pending | 55/100
- 2026-09-10 | ABD MLS | Austin - Colorado | 2.5 Alt | pending | 68/100
- 2026-09-10 | Brezilya Serie B | Atletico Goian - Ceara | 2.5 Üst | pending | 61/100

