# Robot Öğrenme Hafızası Raporu

Oluşturma: 10.09.2026 07:46:11

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1114
- Kazanan tahmin: 211
- Kaybeden tahmin: 175
- Lig sayısı: 259
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 237, bekleyen 151, başarı %59, düz getiri %3, ağırlık 1
- MS 1: toplam 487, bekleyen 377, başarı %57, düz getiri %-6, ağırlık 1
- MS 2: toplam 216, bekleyen 162, başarı %52, düz getiri %-10, ağırlık 1
- 2.5 Alt: toplam 555, bekleyen 421, başarı %51, düz getiri %-17, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- MS X: toplam 2, bekleyen 2, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-10 | İsveç Superettan | Ostersund - Brage | 2.5 Üst | pending | 54/100
- 2026-09-10 | UEFA Şampiyonlar Ligi Lig Aşaması | Slavia Prag - Lens | 2.5 Alt | pending | 49/100
- 2026-09-10 | Irak Premier Lig | Al Jawiya - Al Zawraa | 2.5 Alt | pending | 56/100
- 2026-09-10 | Cezayir 1.Lig | Usm Alger - Js El Biar | MS 1 | pending | 58/100
- 2026-09-10 | UEFA Şampiyonlar Ligi Lig Aşaması | Fenerbahçe - Roma | MS 2 | pending | 61/100
- 2026-09-10 | İsveç Superettan | Sundsvall - Orebro | 2.5 Alt | pending | 50/100
- 2026-09-10 | İsveç Superettan | Varbergs - Norrkoping | MS 2 | pending | 48/100
- 2026-09-10 | Vietnam V-Lig 1 | Viettel - Cand | 2.5 Alt | pending | 52/100
- 2026-09-10 | Mısır 2. Lig | Pharco - Baladiyyat | 2.5 Üst | pending | 49/100
- 2026-09-10 | Guatemala Ulusal Lig Apertura | Deportivo San - Mixco | 2.5 Alt | pending | 63/100
- 2026-09-10 | Uganda Premier Lig | Police - Updf | 2.5 Alt | pending | 45/100
- 2026-09-10 | Estonya Esiliiga A | Nomme United I - Tallinna Kalev | 2.5 Alt | pending | 48/100
- 2026-09-10 | İran Persian Gulf Pro Lig | Shams Azar Qaz - Gol Gohar Sirja | 2.5 Alt | pending | 51/100
- 2026-09-10 | Mısır 2. Lig | Mega Sport - Haras El Hodood | 2.5 Alt | pending | 49/100
- 2026-09-10 | ABD MLS Next Pro | Huntsville Cit - Chattanooga | 2.5 Alt | pending | 49/100

