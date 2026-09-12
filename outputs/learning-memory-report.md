# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 09:35:49

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1320
- Kazanan tahmin: 91
- Kaybeden tahmin: 89
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

- 2.5 Üst: toplam 221, bekleyen 177, başarı %59, düz getiri %10, ağırlık 1
- MS 2: toplam 231, bekleyen 210, başarı %57, düz getiri %2, ağırlık 1
- MS 1: toplam 500, bekleyen 447, başarı %49, düz getiri %-16, ağırlık 1
- 2.5 Alt: toplam 535, bekleyen 475, başarı %45, düz getiri %-27, ağırlık 1
- KG Var: toplam 9, bekleyen 8, başarı %0, düz getiri %-100, ağırlık 1
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | İzlanda 2.Lig | Kari - Haukar | MS 1 | pending | 46/100
- 2026-09-12 | İngiltere FA Trophy 2. Eleme Turu | Kidsgrove Athl - Stafford Ranger | 2.5 Alt | pending | 49/100
- 2026-09-12 | Japonya J1 Lig | V-Varen Nagasa - Nagoya | KG Var | pending | 61/100
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

