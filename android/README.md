# Futbol Laboratuvarı — Android / Google Play hazırlığı

Bu klasör Google Play için hazırlanacak Android uygulamanın izole başlangıç projesidir.

- Package: `org.futbollaboratuvari.app`
- Version: `0.1.0` / versionCode `1`
- compileSdk: 36
- targetSdk: 36
- minSdk: 23
- AGP: 8.13.2
- Java: 17

İlk sürüm mevcut Futbol Laboratuvarı web uygulamasını güvenli bir Android kabuğunda açar. Sonraki geliştirmelerde canlı veri/API, native maç ekranları, bildirimler, kullanıcı hesabı ve diğer özellikler bu uygulama katmanına taşınabilir.

## Google Play notu

31 Ağustos 2026'dan itibaren yeni uygulamalar ve güncellemeler Google Play'e gönderilirken Android 16 / API 36 veya daha üstünü hedeflemelidir. Bu nedenle başlangıç projesi targetSdk 36 ile hazırlanmıştır.

Play Console tarafında uygulama oluşturma, geliştirici doğrulaması, paket adı kaydı, mağaza görselleri, veri güvenliği beyanı, içerik derecelendirmesi ve test/release adımları ayrıca tamamlanmalıdır.
