# Robot Öğrenme Hafızası Raporu

Oluşturma: 11.09.2026 22:49:16

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1154
- Kazanan tahmin: 186
- Kaybeden tahmin: 160
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

- 2.5 Üst: toplam 220, bekleyen 139, başarı %63, düz getiri %10, ağırlık 1
- MS 1: toplam 495, bekleyen 397, başarı %56, düz getiri %-10, ağırlık 1
- MS 2: toplam 230, bekleyen 182, başarı %54, düz getiri %-5, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1
- 2.5 Alt: toplam 548, bekleyen 432, başarı %46, düz getiri %-26, ağırlık 0.94
- MS X: toplam 4, bekleyen 3, başarı %0, düz getiri %-100, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-11 | Almanya 2. Bundesliga | Darmstadt - Arminia Bielefe | MS 1 | pending | 59/100
- 2026-09-11 | Almanya 2. Bundesliga | Nürnberg - Hannover | MS 1 | pending | 57/100
- 2026-09-11 | İspanya Kadınlar Primera Lig | Deportivo De L - Real Madrid (K) | 2.5 Alt | pending | 51/100
- 2026-09-11 | İspanya LaLiga | Sevilla - Valencia | 2.5 Üst | pending | 65/100
- 2026-09-11 | Japonya J1 Lig | Vissel Kobe - Kashima | 2.5 Üst | won | 67/100
- 2026-09-11 | Meksika Kadınlar Liga MX Apertura | Cruz Azul (K) - Pumas Unam (K) | MS 2 | pending | 45/100
- 2026-09-11 | Meksika Kadınlar Liga MX Apertura | Atlas (K) - Atlante (K) | MS 1 | pending | 49/100
- 2026-09-11 | İrlanda Premier Lig | Drogheda - Sligo Rovers | 2.5 Alt | pending | 50/100
- 2026-09-11 | Kuzey İrlanda Premiership | Coleraine - Ballymena | 2.5 Alt | pending | 45/100
- 2026-09-11 | İtalya Serie C Grup C | Team Altamura - Bari | 2.5 Alt | pending | 54/100
- 2026-09-11 | İtalya Serie A | Unione V. - Fiorentina | MS 2 | pending | 45/100
- 2026-09-11 | Almanya Bölgesel Lig Kuzey Doğu | Erfurt - Rsv Eintracht | MS 1 | pending | 56/100
- 2026-09-11 | Letonya 1.Lig | Rezekne / Bjss - Super Nova Ii | MS 2 | pending | 57/100
- 2026-09-11 | Sırbistan Süper Lig | Zeleznicar Pan - Macva | 2.5 Alt | pending | 47/100
- 2026-09-11 | Polonya 2.Lig | Resovia Rzeszo - Falubaz Zielona | 2.5 Alt | pending | 46/100

