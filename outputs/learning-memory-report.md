# Robot Öğrenme Hafızası Raporu

Oluşturma: 12.09.2026 16:40:54

## Özet

- Toplam tahmin: 1500
- Bekleyen tahmin: 1337
- Kazanan tahmin: 81
- Kaybeden tahmin: 82
- Lig sayısı: 267
- Seçenek sayısı: 6

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçeneklerde isabet değil, kaydedilen oranlarla bir birimlik düz bahis getirisi ve güven aralığı hesaplanır.
- Küçük örneklem ve geniş güven aralığı varsa ağırlık nötr kalır; yalnız istatistiksel olarak ayrışan sonuçlar skoru etkiler.
- Pozitif ağırlık için sonuçların en az 7 farklı güne yayılması gerekir; kısa dönem yükselişleri terfi ettirilmez.
- Öğrenme etkisi takım/market kanıtına göre maç başına en fazla 3 veya 6 puanla sınırlandırılır.

## En Güçlü Seçenek Hafızası

- 2.5 Üst: toplam 216, bekleyen 176, başarı %55, düz getiri %0, ağırlık 1
- MS 2: toplam 232, bekleyen 213, başarı %53, düz getiri %0, ağırlık 1
- 2.5 Alt: toplam 529, bekleyen 471, başarı %50, düz getiri %-18, ağırlık 1
- MS 1: toplam 511, bekleyen 466, başarı %44, düz getiri %-22, ağırlık 1
- MS X: toplam 5, bekleyen 4, başarı %0, düz getiri %-100, ağırlık 1
- KG Var: toplam 7, bekleyen 7, başarı bekleniyor, düz getiri bekleniyor, ağırlık 1

## Son Tahmin Kayıtları

- 2026-09-12 | İspanya Gençler Onur Ligi Grup 3 | Huesca U18 - Atlético Monzón | MS 1 | pending | 52/100
- 2026-09-12 | İspanya Gençler Onur Ligi Grup 3 | Girona U19 - Sant Andreu U18 | MS 1 | pending | 56/100
- 2026-09-12 | Bulgaristan 1.Lig | Cska 1948 Sofi - Dunav 2010 | MS 1 | pending | 59/100
- 2026-09-12 | CAF Şampiyonlar Ligi 1.Ön Eleme Turu | Rahimo (1) - (4) Maghreb Fes | 2.5 Üst | pending | 53/100
- 2026-09-12 | Slovenya 2.SNL | Krsko - Krka Novo Mesto | MS 2 | pending | 50/100
- 2026-09-12 | İspanya Gençler Onur Ligi Grup 5 | Rayo Alcobenda - Mérida U19 | 2.5 Alt | pending | 50/100
- 2026-09-12 | İngiltere Ulusal Lig N / S Güney | Horsham - Chesham United | 2.5 Alt | pending | 49/100
- 2026-09-12 | İngiltere Ulusal Lig N / S Kuzey | Morecambe - Brackley Town | MS 1 | pending | 53/100
- 2026-09-12 | Kuzey İrlanda Premiership | Crusaders - Limavady United | MS 1 | pending | 49/100
- 2026-09-12 | Slovakya 2.Lig | Inter Bratisla - Petrzalka | 2.5 Üst | pending | 54/100
- 2026-09-12 | Galler FAW Championship Güney | Treowen Stars - Llantwit Major | MS 1 | pending | 59/100
- 2026-09-12 | Türkiye 2.Lig Beyaz Grup | İnegöl Kafkas - Somaspor | MS 1 | pending | 55/100
- 2026-09-12 | İngiltere Premier Lig | Crystal Palace - Ipswich | 2.5 Alt | pending | 61/100
- 2026-09-12 | Türkiye 3.Lig 1.Grup | Düzcespor - Beykoz Anadolu | MS 1 | pending | 52/100
- 2026-09-12 | Belarus 1.Lig | Slonim - Molodechno | MS 2 | pending | 47/100

