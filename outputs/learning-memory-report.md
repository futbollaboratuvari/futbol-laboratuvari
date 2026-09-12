# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 09:24:43

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1335
- Kazanan tahmin: 84
- Kaybeden tahmin: 81
- Lig sayısı: 266
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 221, bekleyen 183, başarı %61, düz getiri %13, ağırlık 1
- MS 2: toplam 231, bekleyen 210, başarı %57, düz getiri %2, ağırlık 1
- MS 1: toplam 501, bekleyen 452, başarı %49, düz getiri %-15, ağırlık 1
- 2.5 Alt: toplam 535, bekleyen 480, başarı %46, düz getiri %-27, ağırlık 1
- KG Var: toplam 8, bekleyen 7, başarı %0, düz getiri %-100, ağırlık 1
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | ABD USL | Phoenix Rising - Tulsa Roughneck | 2.5 Alt | pending | 57/100
- 2026-09-12 | Peru Premier Lig Clausura | Alianza Lima - Universitario | MS 1 | pending | 50/100
- 2026-09-12 | Venezuela Premier Lig Clausura | Academia Anzoa - Metropolitanos | MS 2 | pending | 51/100
- 2026-09-12 | Arjantin Prim B Metro | Arsenal Sarand - Urquiza | 2.5 Alt | pending | 57/100
- 2026-09-12 | Türkiye Süper Lig | Konyaspor - Trabzonspor | 2.5 Üst | pending | 68/100
- 2026-09-12 | CAF Konfederasyon Kupası 1.Ön Eleme Turu | Asc Diambars (1) - (3) Es Zarzis | MS 2 | pending | 43/100
- 2026-09-12 | İspanya 2. Lig RFEF Grup 5 | Albacete Ii - Atletico Tordes | MS 1 | pending | 48/100
- 2026-09-12 | Belçika Pro Lig | Westerlo - Standard Liege | MS 2 | pending | 46/100
- 2026-09-12 | Finlandiya Veikkausliiga Küme Düşme Grubu | Jaro - Seinajoen Jk | 2.5 Üst | pending | 46/100
- 2026-09-12 | Arnavutluk Süperlig | Partizan Tiran - Dinamo Tirana | MS 2 | pending | 44/100
- 2026-09-12 | Kazakistan Premier Lig | Ordabasy - Astana | MS 1 | pending | 51/100
- 2026-09-12 | Kuzey İrlanda Premiership | Portadown Fc - Larne Fc | 2.5 Alt | pending | 52/100
- 2026-09-12 | Türkiye 3.Lig 1.Grup | Küçükçekmece S - Galata | MS 1 | pending | 55/100
- 2026-09-12 | Norveç 3.Lig Grup 1 | Fk Union Carl - Nordstrand | MS 1 | pending | 56/100
- 2026-09-12 | Norveç 3.Lig Grup 3 | Fyllingsdalen - Gneist | MS 2 | pending | 50/100

