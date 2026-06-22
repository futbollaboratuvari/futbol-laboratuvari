# Mega Hafıza Kaydı — Repo Tam Kontrol ve Çalışma Kuralı

Tarih: 2026-06-22
Proje: Futbol Laboratuvarı
Repo: futbollaboratuvari/futbol-laboratuvari
Branch: main

## En Önemli Çalışma Kuralı

Bundan sonra ChatGPT/GitHub işlemlerinde ana kural:

1. Kullanıcı ne istiyorsa sadece o yapılacak.
2. Ekstra düzeltme, ek öneri, yan işlem, "ben bunu da düzelttim" yaklaşımı yok.
3. GitHub/site/robot/admin/veri dosyalarında yazma işlemi için açık onay şarttır.
4. Açık onay cümlesi olmadan commit, push, force reset, update, delete, create file, branch taşıma yapılmayacak.
5. Okuma/kontrol/rapor ayrı; yazma ayrı kabul edilecek.
6. Kritik dosyalarda önce mevcut durum okunacak, sonra kullanıcıya net rapor verilecek.
7. Kullanıcı açıkça "GitHub'a uygula / kayıt et / değiştir" demediği sürece dosyaya dokunulmayacak.
8. Codex'e yönlendirme yapılmayacak; önce doğrudan GitHub/repo erişimi kullanılacak.

## Son Yaşanan Kritik Durum

Repo üzerinde yapılan yanlış müdahale sonucu kullanıcı önceden yaptığı site güncellemelerinin kaybolduğunu düşündü. İnceleme sonucunda robot ve site dosyalarının büyük kısmının silinmediği, ancak canlı veri dosyalarının boş olduğu görüldü.

Kullanıcının net talimatı:

- Sadece istenen işlem yapılacak.
- Onay alınmadan yazma işlemi yapılmayacak.
- Site, robot, veri dosyaları, admin panel ve GitHub işlemlerinde ekstra hamle yapılmayacak.

## Repo Genel Durum

Repo doğrulandı:

- Repository: futbollaboratuvari/futbol-laboratuvari
- Default branch: main
- Repo public
- Erişim yetkisi var, ancak bundan sonra yazma işlemi sadece açık onayla yapılacak.

## Ana Site Dosyaları

Ana site dosyaları repo içinde duruyor:

- index.html
- admin.html
- style.css
- premium-theme.css
- nav-theme.css
- header-fixes.css
- hero-vitrin.css
- script.js
- daily-matches-widget.js
- premium-robot-engine.js
- robot-dashboard.js
- premium-analysis-panel.js
- premium-panel-fix.js
- premium-state-panel.js
- cache-version.js
- site-human-language.js
- nav-routing.js

## index.html Durumu

index.html dosyası 20260622-robot-v2 sürümünde göründü.

Sayfada bulunan ana alanlar:

- Ana Sayfa
- Bugünün Maçları
- Canlı Veri Görünümü
- Kupon Merkezi
- Üyelik / Satın Al
- Özel Analiz
- Spor Toto
- Sonuçlar
- Performans
- Maç Kayıtları
- Yorum Köşesi
- Galeri
- Hakkımızda / Cem Kaplanoğlu

Tespit:

- daily-matches-widget HTML içinde statik ana section olarak değil, JavaScript ile sonradan ekleniyor.
- index.html içinde #yaklasan-maclar anchor alanı var.
- Site görünümü veri gelmediğinde hazırlık/bekleme durumunda kalıyor.

## daily-matches-widget.js Durumu

Dosya repo içinde duruyor.

İşlevleri:

- ./data/fixtures.json dosyasını okuyor.
- Bugünün maçlarını Europe/Istanbul tarihine göre filtreliyor.
- daily-matches-widget alanını JS ile oluşturuyor.
- Maçları tablo mantığıyla gösteriyor.
- Detay butonu var.
- KG, Alt/Üst, yarı marketleri, İY/MS, takım golü, gol aralığı gibi detay alanlarını okumaya çalışıyor.
- 5 dakikada bir yeniden yükleme yapıyor.

Tespit:

- Kart sistemi tam geçilmemiş.
- Eski tablo mantığı devam ediyor.
- Detay alanı var ama gerçek modern detay kartı seviyesinde değil.

## Veri Dosyaları Durumu

En kritik problem veri dosyalarında göründü.

Boş veya aktif veri üretmeyen dosyalar:

- data/fixtures.json boş görünüyor.
- data/live-matches.json boş görünüyor.
- data/robot-analysis.json boş görünüyor.
- data/analiz_sonuclari.json içinde active_items boş.
- data/daily-coupons.json içinde tüm kupon tipleri boş ve is_available false.

Bu nedenle canlı site:

- maç sayısı göstermiyor,
- aktif analiz göstermiyor,
- canlı veri göstermiyor,
- kupon alanlarını veri bekleniyor durumunda bırakıyor.

Ana sonuç:

Site/robot dosyaları silinmemiş; fakat canlı veri akışı boş olduğu için site boş/geri sarılmış gibi görünüyor.

## Robot Ana Dosyaları

Robot silinmemiştir. Ana robot dosyası duruyor:

- bu-klas-r-i-in-basit/src/robot.py

Robotun okuduğu ve kullandığı ana parçalar:

- api_secrets.py
- gunun_maclari_tarayici.py
- ham_veri_havuzu.py
- ilk_veri_toplayici.py
- kupon_motoru.py
- mackolik_veri_cekici.py
- performans_takip.py
- veri_kaynagi_yoneticisi.py

Robot çıktıları:

- outputs/bugunun_en_guclu_maclari.md
- outputs/basari_yuzdesi_raporu.md
- data/tahmin_gecmisi.json
- data/ham_mac_havuzu.json
- outputs/mackolik_veri_cekme_raporu.md

Robot canlı mod ve demo mod ayrımı yapıyor.
API key yoksa demo moda düşüyor.
API key varsa canlı kaynak deniyor.

## Robot Hafıza Sistemi

Robot hafıza motoru duruyor:

- tools/robot_memory_engine.py

Görevi:

- data/analiz_sonuclari.json
- data/robot-analysis.json
- data/live-matches.json
- data/daily-coupons.json

dosyalarını okuyup:

- data/robot_hafiza.json
- outputs/robot_hafiza_raporu.md

dosyalarını güncellemek.

Takip edilen marketler:

- KG Var
- İlk Yarı KG Var
- İkinci Yarı KG Var
- 2.5 Üst
- 3.5 Üst

Tespit:

- data/robot_hafiza.json dosyası var.
- Ama prediction_log boş.
- result_log boş.
- league_memory boş.
- team_memory boş.
- başarı oranları 0.

Yani hafıza sistemi var, fakat canlı veri gelmediği için içi dolmamış.

## GitHub Actions / Otomasyon

İki önemli workflow görüldü.

### .github/workflows/robot-memory.yml

- Manuel çalıştırma var: workflow_dispatch
- Günlük cron var: 20 3 * * *
- python tools/robot_memory_engine.py çalıştırıyor.
- data/robot_hafiza.json ve outputs/robot_hafiza_raporu.md dosyalarını commit/push yapıyor.

### .github/workflows/update-fixtures.yml

- 15 dakikada bir çalışacak şekilde ayarlı: */15 * * * *
- FOOTBALL_DATA_API_KEY, API_FOOTBALL_KEY, API_FOOTBALL_KEY2 secretlarını kullanıyor.
- node scripts/update-fixtures.js çalıştırıyor.
- Python robotu çalıştırıyor: bu-klas-r-i-in-basit/src/robot.py
- import-robot-raw-pool.js çalıştırıyor.
- raw-block-lite.js çalıştırıyor.
- update-analysis-report.js çalıştırıyor.
- band-lite.js çalıştırıyor.
- export-high-value-json.js çalıştırıyor.
- ensure-live-json.js çalıştırıyor.
- data ve outputs klasörlerini commit/push yapıyor.

Tespit:

Otomasyon dosyaları duruyor; ancak veri dosyaları boş kaldığı için workflow ya çalışmıyor, ya veri çekemiyor, ya da boş çıktı üretiyor.

## scripts/update-fixtures.js Durumu

Dosya duruyor.

Görevi:

- Maçkolik İddaa Programı sayfasını okumaya çalışıyor.
- Bugünün tarihini Europe/Istanbul saatine göre hesaplıyor.
- Bugünün maçlarını parse ediyor.
- fixtures.json, ham_mac_havuzu.json, tahmin_gecmisi.json, spor_toto_bulteni.json ve rapor dosyalarını yazıyor.
- Maç durumunu saatten tahmin ediyor: scheduled, live, finished.

Tespit:

Eğer Maçkolik okunamazsa veya maç bulunamazsa mevcut fixtures dosyasına düşüyor. Mevcut fixtures boşsa sonuç yine boş kalıyor.

## API Secret Sistemi

API secret dosyası duruyor:

- bu-klas-r-i-in-basit/src/api_secrets.py

Secret önceliği:

1. FOOTBALL_DATA_API_KEY
2. API_FOOTBALL_KEY
3. API_FOOTBALL_KEY2
4. Beta Mode

Tespit:

Repo içinde açık API key görünmedi. Dosya sadece env değişken adlarını kullanıyor.

## Admin Panel Durumu

admin.html şu an açık yönetim paneli değil.

Durum:

- Yönetim Alanı Kapalı
- Public admin paneli güvenlik nedeniyle kapatılmış.
- Gerçek yönetim işlemleri için özel backend / yetkili giriş sistemi gerektiği yazıyor.

## Premium Robot / Özel Analiz

premium-robot-engine.js duruyor.

Okuduğu dosyalar:

- data/fixtures.json
- data/robot_match_archive.json

Desteklediği marketler:

- MS 1/X/2
- 2.5 Alt/Üst
- KG Var/Yok
- 1Y KG
- 2Y KG
- 1Y/2Y KG kombinasyonları
- İY/MS kombinasyonları

Tespit:

Bu motorun çalışması için fixtures.json dolu olmalı. fixtures.json boş olduğu için özel analiz de veri bulamaz.

## Ödeme / Üyelik Dosyaları

Repo içinde PayTR ve üyelik altyapısı dosyaları göründü:

- api/paytr/create-payment.js
- api/paytr/callback.js
- api/_lib/paytr.js
- api/_lib/http.js
- api/_lib/plans.js
- api/_lib/membership.js
- api/me/start-trial.js
- api/me/subscription.js
- serverless/paytr/...
- vercel.json

Bu dosyalar sadece tespit edildi; içeriklerine müdahale edilmedi.

## Doküman / Hafıza Dosyaları

Repo içinde hafıza ve proje dokümanları duruyor:

- MEGA_HAFIZA.md
- MEGA_HAFIZA_OZEL_ANALIZ.md
- MEGA_HAFIZA_PRIVATE_ROBOT_GECIS_PLANI.md
- ROBOT_HAFIZA_ENTEGRASYON.md
- SITE_KORUMA_NOTU.md
- SAYFA_DUZENLEME_ILKELERI.md
- docs/GERCEK_VERI_ANALIZ_ILKELERI.md
- docs/PRO_ROBOT_KUPON_AKIS_ZORUNLULUGU.md
- docs/PREMIUM_ODEME_PLANI.md

## Kök Sebep Özeti

Sitenin geri sarılmış/bozulmuş görünmesinin ana nedeni şu anda şunlar:

1. fixtures.json boş.
2. live-matches.json boş.
3. robot-analysis.json boş.
4. analiz_sonuclari.json aktif analiz üretmiyor.
5. daily-coupons.json kuponları boş gösteriyor.
6. Robot hafızası mevcut ama dolu değil.
7. Admin panel kapalı.
8. Günlük maç görünümü hâlâ tablo mantığında.
9. Canlı veri workflow dosyası var ama çıktı üretimi boş kalmış.

## Kritik Sonuç

Robot silinmemiştir.
Site dosyaları silinmemiştir.
Workflow dosyaları silinmemiştir.
Veri akışı boş kaldığı için site boş/geri sarılmış gibi görünmektedir.

## Bundan Sonraki Zorunlu Kural

Bu kayıt bundan sonraki tüm Futbol Laboratuvarı çalışmalarında ana kural olarak kabul edilecek:

- Kullanıcı açıkça istemeden GitHub'a yazma yok.
- Kullanıcı açıkça istemeden dosya değiştirme yok.
- Kullanıcı açıkça istemeden commit/push/reset yok.
- Önce oku, sonra rapor ver.
- Kullanıcı "ONAYLIYORUM, uygula" demeden aksiyon alma.
- Sadece istenen işi yap.
- Ekstra öneri veya yan işlem yapma.
