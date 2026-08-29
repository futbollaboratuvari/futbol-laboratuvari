# Robot Öğrenme Hafızası Raporu

Oluşturma: 30.08.2026 00:50:18

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1279
- Kazanan tahmin: 116
- Kaybeden tahmin: 105
- Lig sayısı: 213
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- 2.5 Üst: toplam 185, bekleyen 136, başarı %65, ağırlık 1.12
- MS 1: toplam 505, bekleyen 457, başarı %50, ağırlık 1
- 2.5 Alt: toplam 605, bekleyen 504, başarı %49, ağırlık 1
- MS 2: toplam 200, bekleyen 178, başarı %46, ağırlık 0.94
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1
- MS X: toplam 2, bekleyen 2, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-30 | Slovenya 1.SNL | Nafta - Maribor | MS 2 | pending | 55/100
- 2026-08-30 | Türkiye Süper Lig | Samsunspor - Fenerbahçe | 2.5 Alt | pending | 57/100
- 2026-08-30 | Türkiye Süper Lig | Başakşehir Fk - Kasimpaşa | 2.5 Alt | pending | 59/100
- 2026-08-30 | Türkiye TFF 1. Lig | Manisa Futbol - Bodrum Fk | 2.5 Alt | pending | 52/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | Moron - San Miguel | MS 1 | pending | 60/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | All Boys - Chaco For Ever | MS 1 | pending | 60/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | Patronato - Almagro | MS 1 | pending | 60/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | Caseros - Ferro Carril Oe | MS 1 | pending | 59/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | Atlanta - San Martin Sj | MS 1 | pending | 60/100
- 2026-08-30 | Uruguay Premier Lig Clausura | Penarol - Nacional Df | 2.5 Alt | pending | 66/100
- 2026-08-30 | İtalya Serie A Kadınlar Kupası Grup B | Fiorentina (K) - Ternana (K) | MS 1 | pending | 59/100
- 2026-08-30 | İtalya Serie A | Lazio - Genoa | 2.5 Alt | pending | 60/100
- 2026-08-30 | İtalya Serie A | Cagliari - Inter | 2.5 Üst | pending | 67/100
- 2026-08-30 | Fransa Ligue 1 | Monaco - Marsilya | MS 1 | pending | 46/100
- 2026-08-30 | Yunanistan Süper Lig | Atromitos - Paok | 2.5 Üst | pending | 72/100

