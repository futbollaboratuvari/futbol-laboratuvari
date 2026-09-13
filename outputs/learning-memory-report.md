# Robot Öğrenme Hafızası Raporu

Oluşturma: 13.09.2026 19:29:39

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1207
- Kazanan tahmin: 152
- Kaybeden tahmin: 141
- Lig sayısı: 256
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 572, bekleyen 465, başarı %63, düz getiri %5, ağırlık 1
- MS 1: toplam 515, bekleyen 435, başarı %51, düz getiri %-11, ağırlık 1
- 2.5 Üst: toplam 188, bekleyen 125, başarı %51, düz getiri %-10, ağırlık 1
- MS X: toplam 4, bekleyen 2, başarı %50, düz getiri %61, ağırlık 1
- MS 2: toplam 208, bekleyen 175, başarı %27, düz getiri %-48, ağırlık 1
- KG Var: toplam 13, bekleyen 5, başarı %25, düz getiri %-49, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-13 | İspanya 2.Lig | Tenerife - Leganes | MS 1 | pending | 53/100
- 2026-09-13 | Brezilya Serie B | Atletico Goian - Criciuma | 2.5 Alt | pending | 62/100
- 2026-09-13 | Venezuela Premier Lig Clausura | Rayo Zuliano - Portuguesa | 2.5 Alt | pending | 63/100
- 2026-09-13 | Brezilya Serie A | Flamengo - Corinthians | 2.5 Alt | pending | 63/100
- 2026-09-13 | Şili Premier Lig | Colo Colo - Concepcion | MS 1 | pending | 60/100
- 2026-09-13 | Yunanistan Süper Lig | Paok - Aris | 2.5 Üst | pending | 64/100
- 2026-09-13 | Arjantin Primera C | Jj Urquiza - Lamadrid | MS X | pending | 42/100
- 2026-09-13 | Suudi Arabistan Pro Lig | Diriyah - Abha | 2.5 Alt | pending | 61/100
- 2026-09-13 | Norveç 3.Lig Grup 2 | Ranheim Ii - Byasen | MS 1 | pending | 46/100
- 2026-09-13 | Arjantin Prim B Metro | Flandria - Camioneros Luja | MS 1 | pending | 44/100
- 2026-09-13 | İspanya Tercera Ligi Grup 9 | Motril - Torre Del Mar | MS 1 | pending | 51/100
- 2026-09-13 | İspanya Gençler Onur Ligi Grup 3 | Damm U18 - Badalona U19 | MS 1 | pending | 56/100
- 2026-09-13 | Arjantin Ulusal Primera Lig | Almirante - Ferro Carril Oe | MS X | pending | 42/100
- 2026-09-13 | Malta Premier Lig Açılış | Sliema - Mosta Fc | MS 1 | pending | 54/100
- 2026-09-13 | İtalya Serie A | Sassuolo - Juventus | KG Var | pending | 69/100

