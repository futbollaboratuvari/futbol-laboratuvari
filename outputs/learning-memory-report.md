# Robot Öğrenme Hafızası Raporu

Oluşturma: 09.09.2026 19:33:10

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1110
- Kazanan tahmin: 216
- Kaybeden tahmin: 174
- Lig sayısı: 255
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- MS X: toplam 3, bekleyen 2, başarı %100, düz getiri %146, ağırlık 1
- 2.5 Üst: toplam 232, bekleyen 146, başarı %63, düz getiri %9, ağırlık 1
- MS 1: toplam 499, bekleyen 386, başarı %54, düz getiri %-12, ağırlık 1
- 2.5 Alt: toplam 551, bekleyen 415, başarı %53, düz getiri %-13, ağırlık 1
- MS 2: toplam 212, bekleyen 160, başarı %52, düz getiri %-8, ağırlık 1
- KG Var: toplam 3, bekleyen 1, başarı %50, düz getiri %-4, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-09 | İspanya Federasyon Kupası Son 32 Turu | Torrent - Saguntino | 2.5 Üst | pending | 53/100
- 2026-09-09 | Kolombiya Kupa Son 16 Turu | Once Caldas - Alianza Petrole | MS 1 | pending | 59/100
- 2026-09-09 | İspanya De La Reina Kupası 1. Tur | Sport Extremad - Cacereno (K) | 2.5 Alt | pending | 50/100
- 2026-09-09 | İngiltere Ulusal Lig Kupası Grup C | Tamworth - Middlesbrough ( | MS 1 | pending | 58/100
- 2026-09-09 | İspanya Federasyon Kupası Son 32 Turu | Cacereno - Ud San Pedro | 2.5 Alt | pending | 55/100
- 2026-09-09 | İsveç Superettan | Sandvikens - Oddevold | MS 1 | pending | 51/100
- 2026-09-09 | Gürcistan Erovnuli Liga | Dinamo Batumi - Fc Iberia | 2.5 Üst | pending | 53/100
- 2026-09-09 | İspanya Federasyon Kupası Son 32 Turu | Compostela - Derio | 2.5 Üst | pending | 54/100
- 2026-09-09 | İspanya De La Reina Kupası 1. Tur | Burgos (K) - Bizkerre (K) | 2.5 Alt | pending | 53/100
- 2026-09-09 | Kadınlar U20 Dünya Kupası Grup C | Fransa U20 (K) - Ekvador U20 (K) | MS 1 | pending | 54/100
- 2026-09-09 | İspanya De La Reina Kupası 1. Tur | Sporting De Hu - Malaga (K) | 2.5 Alt | pending | 50/100
- 2026-09-09 | ABD MLS | Chicago - Inter Miami | MS 2 | pending | 56/100
- 2026-09-09 | İspanya Federasyon Kupası Son 32 Turu | Cacereno - Ud San Pedro | MS 1 | pending | 59/100
- 2026-09-09 | Venezuela Kupa 1.Tur Grup B | Atletico Barin - El Vigia | MS 1 | pending | 53/100
- 2026-09-09 | Venezuela Kupa 1.Tur Grup A | Academia Anzoa - Deportivo Petar | MS 1 | pending | 51/100

