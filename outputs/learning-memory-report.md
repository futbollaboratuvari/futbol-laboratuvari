# Robot Öğrenme Hafızası Raporu

Oluşturma: 04.09.2026 17:38:26

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1108
- Kazanan tahmin: 223
- Kaybeden tahmin: 169
- Lig sayısı: 228
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS 2: toplam 238, bekleyen 201, başarı %65, düz getiri %7, ağırlık 1
- 2.5 Üst: toplam 222, bekleyen 131, başarı %59, düz getiri %4, ağırlık 1
- MS 1: toplam 475, bekleyen 373, başarı %59, düz getiri %-3, ağırlık 1
- 2.5 Alt: toplam 556, bekleyen 396, başarı %53, düz getiri %-13, ağırlık 1
- MS X: toplam 9, bekleyen 7, başarı %50, düz getiri %24, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-04 | Cezayir 1.Lig | Js Kabylie - Rouisset | 2.5 Alt | pending | 57/100
- 2026-09-04 | Polonya Ekstraklasa | Piast Gliwice - Gks Katowice | MS 1 | pending | 46/100
- 2026-09-04 | Danimarka 2.Lig | B93 Kopenhag - Nastved | 2.5 Alt | pending | 48/100
- 2026-09-04 | Danimarka 3.Lig | Bronshoj - Helsingor | 2.5 Üst | pending | 53/100
- 2026-09-04 | Litvanya 1.Lig | Bfa - Babrungas | 2.5 Üst | pending | 53/100
- 2026-09-04 | Bahreyn Premier Lig | Khalidiya - Aali Fc | MS 1 | pending | 59/100
- 2026-09-04 | Avusturya ÖFB Kupası 2.Tur | Kapfenberg - Wspg Wels | MS 2 | pending | 44/100
- 2026-09-04 | Macaristan NB I | Vasas - Nyiregyhaza | MS 1 | pending | 49/100
- 2026-09-04 | Danimarka 1.Lig | Hobro - Hvidovre | 2.5 Alt | pending | 50/100
- 2026-09-04 | Mısır 2. Lig | Baladiyyat - Mega Sport | MS 1 | pending | 48/100
- 2026-09-04 | Şili Premier Lig | Concepcion - Audax Italiano | 2.5 Alt | pending | 60/100
- 2026-09-04 | Kosta Rika Premier Lig Apertura | Liberia - Inter San Carlo | MS 2 | pending | 52/100
- 2026-09-04 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Js Saoura - Horoya | 2.5 Alt | pending | 49/100
- 2026-09-04 | Belçika Challenger Pro Lig | Beerschot-Wilr - Patro Eisden | MS 1 | pending | 54/100
- 2026-09-04 | Bahreyn Premier Lig | Al Ittifaq Maq - Al Muharraq | MS 2 | pending | 57/100

