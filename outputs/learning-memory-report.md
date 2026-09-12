# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 12:28:58

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1333
- Kazanan tahmin: 82
- Kaybeden tahmin: 85
- Lig sayısı: 265
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 223, bekleyen 182, başarı %56, düz getiri %3, ağırlık 1
- MS 2: toplam 228, bekleyen 210, başarı %50, düz getiri %-4, ağırlık 1
- MS 1: toplam 509, bekleyen 458, başarı %47, düz getiri %-19, ağırlık 1
- 2.5 Alt: toplam 528, bekleyen 472, başarı %46, düz getiri %-25, ağırlık 1
- KG Var: toplam 8, bekleyen 8, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Mc Alger (0) - (0) Nigelec | 2.5 Alt | pending | 50/100
- 2026-09-12 | İtalya Serie C Grup B | Forli - Vis Pasaro | 2.5 Alt | pending | 53/100
- 2026-09-12 | Venezuela Premier Lig Clausura | Academia Anzoa - Metropolitanos | 2.5 Alt | pending | 51/100
- 2026-09-12 | Arjantin Primera C | Beraza - Club Atlas | MS 1 | pending | 49/100
- 2026-09-12 | CAF Konfederasyon Kupası 1.Ön Eleme Turu | Asc Diambars (1) - (3) Es Zarzis | 2.5 Alt | pending | 56/100
- 2026-09-12 | Bahreyn Premier Lig | Al Ahli Manama - Al Ittifaq Maqa | 2.5 Üst | pending | 53/100
- 2026-09-12 | İspanya 2. Lig RFEF Grup 2 | Ebro - Reddis | MS 1 | pending | 47/100
- 2026-09-12 | Yunanistan Süper Lig | Olympiakos - Ofi | 2.5 Alt | pending | 49/100
- 2026-09-12 | İtalya Serie B | Catanzaro - Carrarese | 2.5 Üst | pending | 61/100
- 2026-09-12 | CAF Konfederasyon Kupası 1.Ön Eleme Turu | Kitara (2) - (1) Mogadishu City | 2.5 Üst | pending | 54/100
- 2026-09-12 | Norveç 3.Lig Grup 2 | Ntnui - Molde 2 | MS 1 | pending | 49/100
- 2026-09-12 | İngiltere FA Trophy 2. Eleme Turu | Loughborough U - Chasetown | MS 1 | pending | 48/100
- 2026-09-12 | İngiltere FA Trophy 2. Eleme Turu | Fakenham Town - Waltham Abbey | MS 2 | pending | 53/100
- 2026-09-12 | Hırvatistan 2.HNL | Hrvace - Dubrava Zagred | 2.5 Üst | pending | 53/100
- 2026-09-12 | İngiltere Ulusal Lig N / S Kuzey | Hebburn Town - Hednesford Town | 2.5 Alt | pending | 50/100

