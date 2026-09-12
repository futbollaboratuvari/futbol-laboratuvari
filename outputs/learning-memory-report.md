# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 20:14:26

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1318
- Kazanan tahmin: 86
- Kaybeden tahmin: 96
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

- 2.5 Üst: toplam 218, bekleyen 173, başarı %53, düz getiri %-3, ağırlık 1
- MS X: toplam 5, bekleyen 3, başarı %50, düz getiri %61, ağırlık 1
- 2.5 Alt: toplam 531, bekleyen 470, başarı %49, düz getiri %-20, ağırlık 1
- MS 2: toplam 228, bekleyen 204, başarı %46, düz getiri %-13, ağırlık 1
- MS 1: toplam 510, bekleyen 462, başarı %42, düz getiri %-27, ağırlık 1
- KG Var: toplam 8, bekleyen 6, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | Brezilya Serie A | Botafogo - Bragantino | 2.5 Alt | pending | 58/100
- 2026-09-12 | Ekvador Pro Lig | Ldu Quito - Deportivo Cuenc | 2.5 Alt | pending | 59/100
- 2026-09-12 | Kosta Rika Premier Lig Apertura | Inter San Carl - Puntarenas Fc | 2.5 Alt | pending | 53/100
- 2026-09-12 | Fransa Ligue 1 | Paris Fc - Lyon | MS 1 | pending | 55/100
- 2026-09-12 | Bolivya Premier Lig | Gualberto Vill - Nacional Potosi | MS 2 | pending | 46/100
- 2026-09-12 | Arjantin Prim B Metro | Laferrere - San Carlos | 2.5 Alt | pending | 57/100
- 2026-09-12 | Uruguay Premier Lig Clausura | Montevideo Wan - Nacional Df | 2.5 Üst | pending | 60/100
- 2026-09-12 | İspanya Tercera Ligi Grup 5 | Ue Cornella - Cerdanyola Del | MS 1 | pending | 60/100
- 2026-09-12 | Arjantin Prim B Metro | Talleres - Liniers | MS 1 | pending | 57/100
- 2026-09-12 | Irak Premier Lig | Diala - Al Gharraf | 2.5 Alt | pending | 57/100
- 2026-09-12 | Türkiye Süper Lig | Konyaspor - Trabzonspor | KG Var | pending | 58/100
- 2026-09-12 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Al Zamalek Cai (2) - (1) Port | 2.5 Alt | pending | 50/100
- 2026-09-12 | Kuzey İrlanda Premiership | Dungannon - Linfield | 2.5 Alt | pending | 50/100
- 2026-09-12 | Slovakya Süper Lig | Ruzomberok - Zemplin | 2.5 Alt | pending | 48/100
- 2026-09-12 | Fransa Kadınlar 1.Lig | Olympique Mars - Lens (K) | MS 1 | pending | 54/100

