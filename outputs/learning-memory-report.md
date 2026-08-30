# Robot Öğrenme Hafızası Raporu

Oluşturma: 30.08.2026 04:40:12

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1220
- Kazanan tahmin: 144
- Kaybeden tahmin: 136
- Lig sayısı: 210
- Seçenek sayısı: 7

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.

## En Güçlü Seçenek Hafızası

- KG Var: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- MS X: toplam 2, bekleyen 1, başarı %100, ağırlık 1
- 2.5 Üst: toplam 188, bekleyen 130, başarı %67, ağırlık 1.12
- MS 1: toplam 501, bekleyen 439, başarı %53, ağırlık 1
- MS 2: toplam 200, bekleyen 176, başarı %46, ağırlık 0.94
- 2.5 Alt: toplam 606, bekleyen 472, başarı %44, ağırlık 0.94
- KG Yok: toplam 1, bekleyen 1, başarı bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-08-30 | Ekvador Pro Lig | Guayaquil City - Ldu Quito | 2.5 Üst | pending | 71/100
- 2026-08-30 | Honduras Ulusal Lig Apertura | Genesis Pn - Marathon | 2.5 Üst | pending | 69/100
- 2026-08-30 | Venezuela Premier Lig Clausura | Carabobo - Zamora | 2.5 Üst | pending | 60/100
- 2026-08-30 | ABD USL | Monterey Bay - Sacramento Repu | 2.5 Alt | pending | 48/100
- 2026-08-30 | ABD USL | Louisville Cit - Detroit City | MS 1 | pending | 53/100
- 2026-08-30 | Umman Profesyonel Lig | Al Nasr - Fanja | 2.5 Alt | pending | 49/100
- 2026-08-30 | Nikaragua Premier Lig Apertura | Export Sebaco - Real Esteli | MS 2 | pending | 49/100
- 2026-08-30 | Belçika Pro Lig | Union St.G - Anderlecht | 2.5 Üst | pending | 60/100
- 2026-08-30 | Portekiz Premier Lig | Nacional Madei - Estrela | 2.5 Üst | pending | 60/100
- 2026-08-30 | Belarus Premier Lig | Dnepr Mogilev - Isloch | MS 2 | pending | 49/100
- 2026-08-30 | Belçika Pro Lig | Antwerp - St. Truidense | 2.5 Alt | pending | 44/100
- 2026-08-30 | Slovenya 1.SNL | Nafta - Maribor | MS 2 | pending | 51/100
- 2026-08-30 | Türkiye Süper Lig | Samsunspor - Fenerbahçe | 2.5 Alt | pending | 44/100
- 2026-08-30 | Türkiye Süper Lig | Başakşehir Fk - Kasimpaşa | 2.5 Alt | pending | 46/100
- 2026-08-30 | Türkiye TFF 1. Lig | Manisa Futbol - Bodrum Fk | 2.5 Alt | pending | 47/100

