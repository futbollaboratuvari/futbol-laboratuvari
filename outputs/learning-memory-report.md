# Robot Öğrenme Hafızası Raporu

Oluşturma: 10.09.2026 01:01:51

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1111
- Kazanan tahmin: 214
- Kaybeden tahmin: 175
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
- 2.5 Üst: toplam 238, bekleyen 152, başarı %61, düz getiri %4, ağırlık 1
- MS 1: toplam 494, bekleyen 382, başarı %57, düz getiri %-6, ağırlık 1
- MS 2: toplam 214, bekleyen 160, başarı %52, düz getiri %-10, ağırlık 1
- 2.5 Alt: toplam 548, bekleyen 414, başarı %51, düz getiri %-17, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-10 | Guatemala Ulusal Lig Apertura | Xelaju - Coban Imperial | 2.5 Üst | pending | 72/100
- 2026-09-10 | Estonya Esiliiga B | Tammeka Ii - Viljandi Tulevi | MS 1 | pending | 49/100
- 2026-09-10 | Birleşik Arap Emirlikleri Arap Körfez Ligi | Al Ain - Al Wasl | MS 1 | pending | 53/100
- 2026-09-10 | UEFA Şampiyonlar Ligi Lig Aşaması | Fenerbahçe - Roma | 2.5 Üst | pending | 73/100
- 2026-09-10 | UEFA Şampiyonlar Ligi Lig Aşaması | Psv Eindhoven - Shakhtar Donets | MS 1 | pending | 60/100
- 2026-09-10 | İsveç Superettan | Falkenberg - Oster | MS 1 | pending | 50/100
- 2026-09-10 | İsveç Superettan | Sundsvall - Orebro | 2.5 Üst | pending | 54/100
- 2026-09-10 | İsveç Superettan | Varbergs - Norrkoping | 2.5 Alt | pending | 48/100
- 2026-09-10 | İsveç Superettan | Ostersund - Brage | MS 1 | pending | 54/100
- 2026-09-10 | Gürcistan Erovnuli Liga | Gagra - Torpedo Kutaisi | 2.5 Alt | pending | 50/100
- 2026-09-10 | Kosova Süper Lig | Dukagjini - Malisheva | 2.5 Üst | pending | 53/100
- 2026-09-10 | Cezayir 1.Lig | Es Ben Aknoun - Biskra | 2.5 Alt | pending | 53/100
- 2026-09-10 | İsviçre 1.Lig Promotion | Bulle - Amical Saint-Pr | MS 1 | pending | 57/100
- 2026-09-10 | Karadağ 1.Lig | Bokelj Kotor - Otrant | MS 2 | pending | 43/100
- 2026-09-10 | Karadağ 1.Lig | Buducnost - Jezero Plav | 2.5 Alt | pending | 57/100

