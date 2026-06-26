# 2026-06-26 Canlı Veri Akışı Kaydı

## Durum

- Canlı domain yayında: `https://futbollaboratuvari.org/`
- GitHub Pages ve HTTPS tamam.
- Site açılıyor.
- Sorun site yayını değil, robot verisinin siteye düzenli yazılmaması.

## Ana Sorun

Site şu anda canlı veri gibi görünse de GitHub reposundaki JSON dosyalarını okuyor. Robot bu dosyaları güncellemezse yeni maçlar sitede görünmez.

Türkiye - ABD gibi canlı maçların görünmemesinin sebebi, maçın ilgili JSON dosyalarına yazılmamış olmasıdır.

## Doldurulması Gereken Dosyalar

- `data/fixtures.json`
- `data/live-matches.json`
- `data/robot-analysis.json`
- `data/daily-coupons.json`
- `data/analiz_sonuclari.json`

## Canlı Akış Sırası

1. Robot güncel maçları canlı kaynaktan çeker.
2. Maçlar normalize edilir.
3. JSON dosyaları güncellenir.
4. Analiz, güven, risk ve öneri alanları üretilir.
5. Dosyalar GitHub reposuna gönderilir.
6. Site güncel JSON dosyalarını okuyarak canlı listeyi gösterir.

## Öncelik

Önce canlı maç verisi siteye akacak. Ondan sonra kartlarda tahminlerin, Günün Seçimi alanının, Kupon Merkezi'nin ve analiz yorumlarının neden görünmediği düzeltilecek.

## Çalışma Kuralı

Bu aşamada gereksiz tasarım değişikliği yapılmayacak. Öncelik veri hattıdır.

## Sonraki Kontrol Kaydı

Actions çalıştıktan sonra şu dosyaların gerçekten dolup dolmadığı kontrol edilecek:

- `data/fixtures.json`
- `data/live-matches.json`
- `data/robot-analysis.json`
- `data/daily-coupons.json`
- `data/analiz_sonuclari.json`

Kontrol mantığı:

1. Workflow başarılı mı çalıştı bakılacak.
2. JSON dosyalarında yeni `generated_at` zamanı var mı kontrol edilecek.
3. `fixtures.json` içinde güncel maç listesi var mı bakılacak.
4. `live-matches.json` içinde canlı / bitmiş / yaklaşan maç bilgisi var mı bakılacak.
5. `robot-analysis.json` içinde maç bazlı analiz üretilmiş mi bakılacak.
6. `daily-coupons.json` içinde Dengeli / Yüksek Oranlı / Riskli kupon kartlarını besleyen veri var mı bakılacak.
7. `analiz_sonuclari.json` içinde `active_items` boş mu dolu mu kontrol edilecek.

Bu kontrol tamamlanmadan kart tahmini, Günün Seçimi ve Kupon Merkezi düzeltmesine geçilmeyecek.
