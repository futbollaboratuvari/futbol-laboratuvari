# Robot Öğrenme Hafızası Raporu

Oluşturma: 30.08.2026 02:25:19

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1233
- Kazanan tahmin: 141
- Kaybeden tahmin: 126
- Lig sayısı: 211
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- 2.5 Üst: toplam 187, bekleyen 129, başarı %67, ağırlık 1.12
- MS 1: toplam 502, bekleyen 444, başarı %55, ağırlık 1.06
- MS 2: toplam 201, bekleyen 177, başarı %46, ağırlık 0.94
- 2.5 Alt: toplam 605, bekleyen 480, başarı %46, ağırlık 0.94
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-30 | Nikaragua Premier Lig Apertura | Export Sebaco - Real Esteli | MS 2 | pending | 49/100
- 2026-08-30 | Belçika Pro Lig | Union St.G - Anderlecht | 2.5 Üst | pending | 60/100
- 2026-08-30 | Portekiz Premier Lig | Nacional Madei - Estrela | 2.5 Üst | pending | 60/100
- 2026-08-30 | Belarus Premier Lig | Dnepr Mogilev - Isloch | MS 2 | pending | 49/100
- 2026-08-30 | Belçika Pro Lig | Antwerp - St. Truidense | 2.5 Alt | pending | 49/100
- 2026-08-30 | Slovenya 1.SNL | Nafta - Maribor | MS 2 | pending | 49/100
- 2026-08-30 | Türkiye Süper Lig | Samsunspor - Fenerbahçe | 2.5 Alt | pending | 55/100
- 2026-08-30 | Türkiye Süper Lig | Başakşehir Fk - Kasimpaşa | 2.5 Alt | pending | 57/100
- 2026-08-30 | Türkiye TFF 1. Lig | Manisa Futbol - Bodrum Fk | 2.5 Alt | pending | 52/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | Moron - San Miguel | MS 1 | pending | 53/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | All Boys - Chaco For Ever | MS 1 | pending | 47/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | Patronato - Almagro | MS 1 | pending | 54/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | Caseros - Ferro Carril Oe | MS 1 | pending | 44/100
- 2026-08-30 | Arjantin Ulusal Primera Lig | Atlanta - San Martin Sj | MS 1 | pending | 48/100
- 2026-08-30 | Uruguay Premier Lig Clausura | Penarol - Nacional Df | 2.5 Alt | pending | 66/100

