# Robot Öğrenme Hafızası Raporu

Oluşturma: 16.09.2026 08:22:01

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1146
- Kazanan tahmin: 199
- Kaybeden tahmin: 155
- Lig sayısı: 279
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Alt: toplam 592, bekleyen 459, başarı %62, düz getiri %5, ağırlık 1
- 2.5 Üst: toplam 167, bekleyen 104, başarı %56, düz getiri %2, ağırlık 1
- MS 1: toplam 503, bekleyen 400, başarı %54, düz getiri %-9, ağırlık 1
- KG Var: toplam 14, bekleyen 4, başarı %50, düz getiri %-9, ağırlık 1
- MS X: toplam 7, bekleyen 3, başarı %50, düz getiri %22, ağırlık 1
- MS 2: toplam 217, bekleyen 176, başarı %46, düz getiri %-10, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-16 | İspanya Federasyon Kupası Son 16 Turu | Saguntino - Navalcarnero | 2.5 Alt | pending | 55/100
- 2026-09-16 | Ekvador Pro Lig Serie B Şampiyonluk Grubu | Deportivo Cuen - San Antonio | 2.5 Alt | pending | 66/100
- 2026-09-16 | İspanya Federasyon Kupası Son 16 Turu | Comillas - Sestao | 2.5 Alt | pending | 55/100
- 2026-09-16 | İspanya Federasyon Kupası Son 16 Turu | Derio - Salamanca | 2.5 Alt | pending | 53/100
- 2026-09-16 | İspanya Federasyon Kupası Son 16 Turu | Huelva - Cacereno | 2.5 Alt | pending | 55/100
- 2026-09-16 | İspanya Federasyon Kupası Son 16 Turu | Orihuela - Murcia | 2.5 Alt | pending | 53/100
- 2026-09-16 | UEFA Avrupa Ligi Lig Aşaması | Ac Milan - Benfica | MS 2 | pending | 56/100
- 2026-09-16 | Mısır Premier Lig | Ghazl El Mehal - Al Zamalek Cair | MS 2 | pending | 50/100
- 2026-09-16 | İspanya Federasyon Kupası Son 16 Turu | Ud Santa Marta - Bergantinos | 2.5 Alt | pending | 52/100
- 2026-09-16 | Norveç NM Kupası 2.Tur | Gamle Oslo - Lyn Oslo | MS 2 | pending | 57/100
- 2026-09-16 | Norveç NM Kupası 2.Tur | Jerv - Egersunds | MS 2 | pending | 45/100
- 2026-09-16 | İspanya Gençler Onur Ligi Grup 4 | Atlético Zabal - Alhendín U19 | 2.5 Alt | pending | 50/100
- 2026-09-16 | Ruanda Ulusal Futbol Ligi | As Kigali - Al Hilal Omdurm | 2.5 Alt | pending | 54/100
- 2026-09-16 | AFC Şampiyonlar Ligi 2 Grup E | Fc Seoul - Persib | 2.5 Üst | pending | 54/100
- 2026-09-16 | Tayland 2.Lig | Chainat Hornbi - Esan Pattaya | 2.5 Üst | pending | 54/100

