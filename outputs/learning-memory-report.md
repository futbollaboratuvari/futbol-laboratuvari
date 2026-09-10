# Robot Öğrenme Hafızası Raporu

Oluşturma: 10.09.2026 04:26:34

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1110
- Kazanan tahmin: 214
- Kaybeden tahmin: 176
- Lig sayısı: 260
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 2, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 235, bekleyen 149, başarı %59, düz getiri %3, ağırlık 1
- MS 1: toplam 490, bekleyen 379, başarı %58, düz getiri %-6, ağırlık 1
- MS 2: toplam 216, bekleyen 162, başarı %52, düz getiri %-10, ağırlık 1
- 2.5 Alt: toplam 553, bekleyen 417, başarı %51, düz getiri %-17, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-10 | Uganda Premier Lig | Police - Updf | 2.5 Alt | pending | 46/100
- 2026-09-10 | Estonya Esiliiga A | Nomme United I - Tallinna Kalev | 2.5 Alt | pending | 48/100
- 2026-09-10 | İran Persian Gulf Pro Lig | Shams Azar Qaz - Gol Gohar Sirja | 2.5 Alt | pending | 51/100
- 2026-09-10 | Mısır 2. Lig | Mega Sport - Haras El Hodood | 2.5 Alt | pending | 49/100
- 2026-09-10 | ABD MLS Next Pro | Huntsville Cit - Chattanooga | 2.5 Alt | pending | 49/100
- 2026-09-10 | İran Persian Gulf Pro Lig | Esteghlal Khuz - Tractor Fc | MS 2 | pending | 58/100
- 2026-09-10 | İran Persian Gulf Pro Lig | Shams Azar Qaz - Gol Gohar Sirja | MS 2 | pending | 45/100
- 2026-09-10 | Letonya Virsliga | Super Nova - Fk Tukums 2000 | 2.5 Alt | pending | 50/100
- 2026-09-10 | UEFA Gençlik Ligi Lig Aşaması | Como U19 - Rb Leipzig U19 | MS 2 | pending | 45/100
- 2026-09-10 | Guatemala Ulusal Lig Apertura | Xelaju - Coban Imperial | 2.5 Üst | pending | 72/100
- 2026-09-10 | Estonya Esiliiga B | Tammeka Ii - Viljandi Tulevi | MS 1 | pending | 49/100
- 2026-09-10 | Birleşik Arap Emirlikleri Arap Körfez Ligi | Al Ain - Al Wasl | MS 1 | pending | 53/100
- 2026-09-10 | UEFA Şampiyonlar Ligi Lig Aşaması | Fenerbahçe - Roma | 2.5 Üst | pending | 76/100
- 2026-09-10 | UEFA Şampiyonlar Ligi Lig Aşaması | Psv Eindhoven - Shakhtar Donets | MS 1 | pending | 60/100
- 2026-09-10 | İsveç Superettan | Falkenberg - Oster | MS 1 | pending | 50/100

