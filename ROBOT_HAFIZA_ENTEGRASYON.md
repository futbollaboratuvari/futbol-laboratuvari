# Futbol Laboratuvarı - Robot Hafıza Entegrasyonu

Bu entegrasyon robotun sadece günlük tahmin üretmesini değil, zamanla kendi performansını ölçmesini sağlar.

## Eklenen ana dosyalar

1. `data/robot_hafiza.json`
   - Ana hafıza dosyasıdır.
   - Tahmin kayıtları, sonuç kayıtları, market başarısı, lig hafızası, takım hafızası, oran aralığı başarısı ve yanılma kayıtlarını tutar.

2. `tools/robot_memory_engine.py`
   - Hafıza motorudur.
   - `data/analiz_sonuclari.json`, `data/robot-analysis.json`, `data/live-matches.json` ve `data/daily-coupons.json` dosyalarını okuyarak hafızayı günceller.

3. `.github/workflows/robot-memory.yml`
   - GitHub Actions otomasyonudur.
   - Her gün otomatik çalışır ve hafızayı günceller.
   - Manuel olarak GitHub > Actions > Robot Hafiza Motoru > Run workflow üzerinden de çalıştırılabilir.

4. `outputs/robot_hafiza_raporu.md`
   - Hafıza motoru çalışınca otomatik oluşur.
   - Market, lig, takım ve oran aralığı başarı raporlarını verir.

## Robotun artık takip edeceği alanlar

- Her tahminin tarihi
- Lig
- Maç adı
- Ev sahibi / deplasman
- Tahmin marketi
- Oran
- Risk seviyesi
- Güven skoru
- Sonuç
- Yanılma sebebi
- Veri kaynağı

## Başarı hesapları

Robot şu başlıklarda başarı oranı hesaplar:

- KG Var
- İlk Yarı KG Var
- İkinci Yarı KG Var
- 2.5 Üst
- 3.5 Üst
- Lig bazlı başarı
- Takım bazlı başarı
- Oran aralığı bazlı başarı
- Kupon tipi bazlı başarı

## Güvenlik kuralı

Robot kupon onaylamaz, para yatırmaz, para çekmez. Sistem yalnızca analiz, rapor ve kayıt üretir. Son karar kullanıcıya aittir.

## Güncel veri kuralı

Güncel veri yoksa robot eski veri uydurmaz. Boş kayıt ve rapor üretir.

## Siteye görünür bağlantı notu

Ana sitede zaten `robot-dashboard.js` içinde canlı veri, kupon, analiz ve sonuç dosyaları okunuyor. Hafıza sistemi bu dosyalarla aynı `data/` ve `outputs/` yapısına bağlandı. Site paneline ayrıca özel hafıza kartı eklemek istenirse `robot-dashboard.js` içine `./data/robot_hafiza.json` ve `./outputs/robot_hafiza_raporu.md` okunacak şekilde yeni bir görünüm eklenebilir.
