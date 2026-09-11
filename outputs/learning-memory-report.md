# Robot Öğrenme Hafızası Raporu

Oluşturma: 11.09.2026 16:34:12

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1163
- Kazanan tahmin: 183
- Kaybeden tahmin: 154
- Lig sayısı: 277
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 225, bekleyen 145, başarı %63, düz getiri %9, ağırlık 1
- MS 1: toplam 493, bekleyen 396, başarı %57, düz getiri %-9, ağırlık 1
- MS 2: toplam 228, bekleyen 183, başarı %56, düz getiri %-2, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 547, bekleyen 435, başarı %46, düz getiri %-25, ağırlık 0.94
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-11 | Polonya 1.Lig | Polonia Varşov - Polonia Bytom | 2.5 Alt | pending | 45/100
- 2026-09-11 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | As Sobemap (1) - (1) Enugu Rangers | MS 2 | pending | 55/100
- 2026-09-11 | Estonya Esiliiga B | Narva Trans Ii - Tallinna Infone | MS 1 | pending | 52/100
- 2026-09-11 | Kuzey İrlanda Championship | Strabane Athle - Newry City Afc | MS 2 | pending | 50/100
- 2026-09-11 | Ekvador Pro Lig Serie B Şampiyonluk Grubu | Deportivo Cuen - Cuniburo Fc | MS 2 | pending | 44/100
- 2026-09-11 | Avusturya 1.Lig | Wacker Innsbru - Voitsberg | MS 1 | pending | 46/100
- 2026-09-11 | Malta Premier Lig Açılış | Hamrun - Birzebbuga | MS 1 | pending | 57/100
- 2026-09-11 | Galler Premier Lig 1.Aşama | Barry Town - Llandudno | 2.5 Üst | pending | 53/100
- 2026-09-11 | Galler Premier Lig 1.Aşama | Haverfordwest - Briton Ferry | 2.5 Alt | pending | 47/100
- 2026-09-11 | Belçika Challenger Pro Lig | Kaa Gent Ii - Dender | MS 2 | pending | 52/100
- 2026-09-11 | Arjantin Kadınlar Primera A 2. Aşama | Belgrano (K) - Ferro Carril Oe | MS 1 | pending | 51/100
- 2026-09-11 | Ürdün 1.Lig | Aqaba - Al Yarmouk | 2.5 Alt | pending | 50/100
- 2026-09-11 | Botsvana Premier Lig | Tonota - Bdf Xi | MS 1 | pending | 51/100
- 2026-09-11 | Botsvana Premier Lig | Centre Chiefs - Nico United | MS 1 | pending | 48/100
- 2026-09-11 | Almanya Bölgesel Lig Bayern | Buchbach - Bayern Munich ( | MS 1 | pending | 49/100

