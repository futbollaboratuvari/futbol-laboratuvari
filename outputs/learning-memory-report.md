# Robot Öğrenme Hafızası Raporu

Oluşturma: 10.09.2026 16:52:20

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1092
- Kazanan tahmin: 218
- Kaybeden tahmin: 190
- Lig sayısı: 262
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 237, bekleyen 149, başarı %59, düz getiri %3, ağırlık 1
- MS 1: toplam 489, bekleyen 369, başarı %53, düz getiri %-13, ağırlık 1
- 2.5 Alt: toplam 552, bekleyen 411, başarı %52, düz getiri %-16, ağırlık 1
- MS 2: toplam 216, bekleyen 160, başarı %50, düz getiri %-10, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- MS X: toplam 3, bekleyen 2, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-10 | UEFA Şampiyonlar Ligi Lig Aşaması | Slavia Prag - Lens | MS 2 | pending | 45/100
- 2026-09-10 | Ürdün 1.Lig | Ethad Ar - Al Sareeh | 2.5 Alt | pending | 55/100
- 2026-09-10 | Ürdün 1.Lig | Amman - Hay Al-Amir Has | 2.5 Üst | pending | 53/100
- 2026-09-10 | Gürcistan Erovnuli Liga | Gagra - Torpedo Kutaisi | 2.5 Üst | pending | 53/100
- 2026-09-10 | İran Persian Gulf Pro Lig | Esteghlal - Peykan | MS 1 | pending | 58/100
- 2026-09-10 | Azerbaycan 1.Lig | Zaqatala - Baku Sportinq | 2.5 Üst | pending | 53/100
- 2026-09-10 | Ekvador Pro Lig Serie B Şampiyonluk Grubu | San Antonio - Atletico Fc | 2.5 Alt | pending | 57/100
- 2026-09-10 | Ekvador Pro Lig Serie B Küme Düşme Grubu | Cumbaya - Gualaceo | MS 1 | pending | 39/100
- 2026-09-10 | Paraguay Intermedia Lig | Sportivo Carap - Benjamin Aceval | 2.5 Alt | pending | 50/100
- 2026-09-10 | Gürcistan Erovnuli Liga | Dinamo Tiflis - Meshakhte | MS 1 | pending | 59/100
- 2026-09-10 | Özbekistan Super League | Xorazm Urganch - Sogdiyona Jizza | 2.5 Üst | pending | 53/100
- 2026-09-10 | Guatemala Ulusal Lig Apertura | Suchitepequez - Guastatoya | MS 1 | lost | 58/100
- 2026-09-10 | ABD MLS | Portland - St. Louis City | MS 2 | lost | 57/100
- 2026-09-10 | Mısır 2. Lig | Kahraba Ismail - El Daklyeh | 2.5 Alt | pending | 57/100
- 2026-09-10 | ABD MLS | Montreal - Charlotte | MS 2 | won | 61/100

