# Robot Öğrenme Hafızası Raporu

Oluşturma: 08.09.2026 07:32:53

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1121
- Kazanan tahmin: 199
- Kaybeden tahmin: 180
- Lig sayısı: 238
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, düz getiri %93, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 232, bekleyen 134, başarı %60, düz getiri %2, ağırlık 1
- 2.5 Alt: toplam 530, bekleyen 397, başarı %56, düz getiri %-8, ağırlık 1
- MS 2: toplam 233, bekleyen 188, başarı %44, düz getiri %-19, ağırlık 1
- MS 1: toplam 501, bekleyen 400, başarı %44, düz getiri %-29, ağırlık 0.94

## Son Tahmin Kayıtları

- 2026-09-08 | İngiltere Ulusal Lig Kupası Grup B | Braintree - Fulham (B) | MS 1 | pending | 42/100
- 2026-09-08 | Meksika Kadınlar Liga MX Apertura Grup 1 | Atlante (K) - Juarez (K) | MS 2 | pending | 52/100
- 2026-09-08 | Güney Kore K Lig 1 | Ulsan - Fc Seoul | MS 2 | pending | 48/100
- 2026-09-08 | UEFA Şampiyonlar Ligi Lig Aşaması | Porto - Manchester City | KG Var | pending | 56/100
- 2026-09-08 | Copa Libertadores Çeyrek Final | Fluminense - Platense | 2.5 Üst | pending | 64/100
- 2026-09-08 | İngiltere Ulusal Lig Kupası Grup B | Braintree - Fulham (B) | 2.5 Alt | pending | 49/100
- 2026-09-08 | Mısır Premier Lig | Al Zamalek Cai - Abu Qair | 2.5 Alt | pending | 54/100
- 2026-09-08 | İngiltere FA Cup Eleme 1.Tur Tekrar | Fakenham Town - Ware | 2.5 Alt | pending | 48/100
- 2026-09-08 | İngiltere FA Cup Eleme 1.Tur Tekrar | Havant And W. - Chippenham Town | 2.5 Alt | pending | 49/100
- 2026-09-08 | İngiltere FA Cup Eleme 1.Tur Tekrar | Kettering - Wellingborough | MS 1 | pending | 52/100
- 2026-09-08 | UEFA Şampiyonlar Ligi Lig Aşaması | Porto - Manchester City | MS 2 | pending | 54/100
- 2026-09-08 | UEFA Şampiyonlar Ligi Lig Aşaması | B.Dortmund - Villarreal | MS 1 | pending | 50/100
- 2026-09-08 | UEFA Şampiyonlar Ligi Lig Aşaması | Real Madrid - Inter | MS 1 | pending | 56/100
- 2026-09-08 | UEFA Şampiyonlar Ligi Lig Aşaması | Lille - Real Betis | 2.5 Alt | pending | 61/100
- 2026-09-08 | İngiltere Lig Kupası 3.Tur | Millwall - Newcastle Utd | MS 2 | pending | 62/100

