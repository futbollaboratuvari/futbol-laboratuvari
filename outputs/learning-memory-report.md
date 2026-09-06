# Robot Öğrenme Hafızası Raporu

Oluşturma: 06.09.2026 22:32:08

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1143
- Kazanan tahmin: 184
- Kaybeden tahmin: 173
- Lig sayısı: 218
- Seçenek sayısı: 5

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 2, bekleyen 0, başarı %100, düz getiri %148, ağırlık 1
- 2.5 Üst: toplam 230, bekleyen 148, başarı %61, düz getiri %5, ağırlık 1
- 2.5 Alt: toplam 535, bekleyen 415, başarı %54, düz getiri %-10, ağırlık 1
- MS 2: toplam 232, bekleyen 185, başarı %45, düz getiri %-19, ağırlık 1
- MS 1: toplam 501, bekleyen 395, başarı %43, düz getiri %-28, ağırlık 0.94

## Son Tahmin Kayıtları

- 2026-09-06 | Norveç Eliteserien | Kristiansund - Tromso | 2.5 Alt | pending | 60/100
- 2026-09-06 | Kolombiya Primera A Clausura | Pereira - Los Millionario | 2.5 Alt | pending | 53/100
- 2026-09-06 | Brezilya Serie A | Botafogo - Palmeiras | MS 2 | pending | 50/100
- 2026-09-06 | İtalya Serie C Grup A | Ospitaletto - Union Arzignano | 2.5 Alt | pending | 57/100
- 2026-09-06 | CONCACAF Ligler Kupası Final | Toluca - Monterrey | MS 1 | pending | 49/100
- 2026-09-06 | Bosna-Hersek Premier Lig | Zrinjski - Siroki Brijeg | 2.5 Üst | pending | 54/100
- 2026-09-06 | Belçika Pro Lig | Waasland Bever - Oh Leuven | 2.5 Alt | lost | 49/100
- 2026-09-06 | Norveç Eliteserien | Kristiansund - Tromso | 2.5 Üst | lost | 57/100
- 2026-09-06 | İran Persian Gulf Pro Lig | Shahrdari Arak - Esteghlal | 2.5 Alt | pending | 50/100
- 2026-09-06 | İran Persian Gulf Pro Lig | Chadormalu - Shams Azar Qazv | 2.5 Alt | pending | 50/100
- 2026-09-06 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Asc Kara - Asec | 2.5 Alt | pending | 49/100
- 2026-09-06 | İzlanda Urvalsdeild | Thor Akureyri - Hafnarfjordur | 2.5 Alt | pending | 48/100
- 2026-09-06 | Belarus 1.Lig | Orsha - Ostrovets Fc | 2.5 Alt | pending | 48/100
- 2026-09-06 | Peru Premier Lig Clausura | Melgar - Adt | MS 1 | pending | 57/100
- 2026-09-06 | Peru Premier Lig Clausura | Deportivo Garc - Atletico Grau | 2.5 Alt | pending | 60/100

