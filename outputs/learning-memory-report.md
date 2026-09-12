# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 18:57:55

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1317
- Kazanan tahmin: 86
- Kaybeden tahmin: 97
- Lig sayısı: 268
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 218, bekleyen 173, başarı %53, düz getiri %-3, ağırlık 1
- MS X: toplam 5, bekleyen 3, başarı %50, düz getiri %61, ağırlık 1
- 2.5 Alt: toplam 530, bekleyen 469, başarı %49, düz getiri %-20, ağırlık 1
- MS 2: toplam 228, bekleyen 203, başarı %44, düz getiri %-17, ağırlık 1
- MS 1: toplam 511, bekleyen 463, başarı %42, düz getiri %-27, ağırlık 1
- KG Var: toplam 8, bekleyen 6, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | Uruguay Premier Lig Clausura | Montevideo Wan - Nacional Df | 2.5 Üst | pending | 60/100
- 2026-09-12 | İspanya Tercera Ligi Grup 5 | Ue Cornella - Cerdanyola Del | MS 1 | pending | 60/100
- 2026-09-12 | Arjantin Prim B Metro | Talleres - Liniers | MS 1 | pending | 57/100
- 2026-09-12 | Irak Premier Lig | Diala - Al Gharraf | 2.5 Alt | pending | 57/100
- 2026-09-12 | Türkiye Süper Lig | Konyaspor - Trabzonspor | KG Var | pending | 58/100
- 2026-09-12 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Al Zamalek Cai (2) - (1) Port | 2.5 Alt | pending | 50/100
- 2026-09-12 | Kuzey İrlanda Premiership | Dungannon - Linfield | 2.5 Alt | pending | 50/100
- 2026-09-12 | Slovakya Süper Lig | Ruzomberok - Zemplin | 2.5 Alt | pending | 48/100
- 2026-09-12 | Fransa Kadınlar 1.Lig | Olympique Mars - Lens (K) | MS 1 | pending | 54/100
- 2026-09-12 | Türkiye 3.Lig 3.Grup | Malatya Yeşily - Kırıkkale Fk | MS 1 | pending | 50/100
- 2026-09-12 | Çin Halk Cumhuriyeti Süper Lig | Wuhan Three To - Henan Jianye | 2.5 Alt | pending | 56/100
- 2026-09-12 | İspanya LaLiga | Santander - Alaves | MS 2 | pending | 56/100
- 2026-09-12 | Fransa Ligue 2 | Sochaux - Nantes | 2.5 Alt | pending | 66/100
- 2026-09-12 | İngiltere Championship | Bolton - Cardiff | MS 1 | pending | 59/100
- 2026-09-12 | İngiltere 2.Lig | Crawley - Cheltenham | MS 2 | pending | 56/100

