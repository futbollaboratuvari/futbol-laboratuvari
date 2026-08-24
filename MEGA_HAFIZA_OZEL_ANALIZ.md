# Futbol Laboratuvarı Mega Hafıza - Özel Analiz Alanı

Tarih: 2026-06-21

## Ana karar

Özel Analiz alanı Futbol Laboratuvarı sitesinin ana gelir alanı olacak. Bu alan sadece görsel bir panel değildir. Kullanıcının maç arayıp seçtiği, market seçtiği ve robotun o maça özel analiz ürettiği temel ürün alanıdır.

## Kullanıcı akışı

1. Kullanıcı Özel Analiz alanına girer.
2. Erişim kodu veya ileride üyelik doğrulaması ile panel açılır.
3. Kullanıcı takım adı, lig adı veya saat yazarak maç arar.
4. Sistem uzun maç listesini filtreler ve ilgili maçı gösterir.
5. Kullanıcı maç seçer.
6. Kullanıcı market seçer.
7. Analiz Başlat butonuna basar.
8. Robot maç ve markete özel analiz üretir.
9. Sonuç sağ panelde Robot Analizi olarak gösterilir.
10. Son analiz tarayıcı hafızasına ve analiz kuyruğuna alınır.

## Paket fikri

Ücretsiz kullanıcı: kilitli ön izleme ve sınırlı bilgi.
Günlük paket: sınırlı özel analiz hakkı.
Haftalık paket: daha yüksek analiz hakkı.
Aylık paket: düzenli kullanım hakkı.
VIP paket: yüksek oranlı kupon ve özel market analizi.

## Panelde olması gereken alanlar

- Bugünkü maçlar
- Maç arama motoru
- Market seçimi
- Robot güven puanı
- Risk seviyesi
- Oran ve olasılık
- Kısa robot yorumu
- Detaylı premium yorum
- Analiz geçmişi
- Kalan analiz hakkı
- Paket etiketi

## Robota öğretilen marketler

- KG Var / Yok
- 1Y KG Var / Yok
- 2Y KG Var / Yok
- 1Y/2Y KG Evet/Evet
- 1Y/2Y KG Hayır/Hayır
- 1Y/2Y KG Evet/Hayır
- 1Y/2Y KG Hayır/Evet
- 1Y KG %
- 2Y KG %
- 1Y KG % + 2Y KG %
- İY/MS 1’den 1
- İY/MS 1’den X
- İY/MS 1’den 2
- İY/MS X’ten 1
- İY/MS X’ten X
- İY/MS X’ten 2
- İY/MS 2’den 1
- İY/MS 2’den X
- İY/MS 2’den 2

## Robotun okuyacağı kaynaklar

- data/fixtures.json
- data/robot_match_archive.json
- odds
- oranlar
- detay_oranlar
- detailOdds
- raw_market_guess_odds
- analysis
- stats

## Mevcut teknik durum

Bu alan için kullanılan dosyalar:

- premium-analysis-panel.js
- premium-panel-fix.js
- premium-robot-engine.js
- cache-version.js
- index.html

Geçici kurucu erişim kodu: CEM-ANALIZ-2026

Gerçek sistemde bu kod mantığı sadece demo olarak kalacak. Daha sonra kullanıcı hesabı, ödeme sonrası erişim, analiz hakkı ve sunucu taraflı kontrol eklenecek.

## Son önemli commitler

- Aramalı maç seçici: 7d267edda8c5ba9681b1cfe05c5aacd1e5646bbf
- Panel fix ana sayfa bağlantısı: f5771485e7921398b31aa8ab4854930f57375a6d
- Cache panel fix: a6526e75f4369d1fb9d3e1c2df2db1350ace3617
- Premium robot engine: 7062939deb1d63c4e89a9e622ff3cd8b7a1a609b
- Premium robot engine cache: fbc020464db320582bbad458e5668a5e1b8fa819
- Premium robot engine direkt bağlantı: e7899c377a9af38cb0cbaee66f4a13c43aa97a83

## Faaliyet aşaması

Faaliyet aşamasında ilk yapılacaklar:

1. Kalan analiz hakkı alanı eklenecek.
2. Paket etiketi eklenecek.
3. Robot güven puanı görselleştirilecek.
4. Risk seviyesi daha net gösterilecek.
5. Premium sonuç kartı geliştirilecek.
6. Analiz geçmişi alanı eklenecek.
7. Ücretsiz kullanıcı için kilitli ön izleme geliştirilecek.
8. İleride gerçek ödeme ve üyelik kontrolüne geçilecek.

## 2026-08-23 V3 güncellemesi

Özel Analiz alanı, eski üst üste çalışan panel katmanları yerine tek ve mobil öncelikli bir akışa geçirildi.

Güncel kullanıcı akışı:

1. Kullanıcı Tek Maç veya Kupon modunu seçer. Varsayılan Tek Maçtır.
2. Sadece başlamamış maçlar arasından arama ve tarih filtresiyle seçim yapar.
3. Robot Önerisi, Maç Sonucu veya Gol Analizi türünü seçer. Gelişmiş marketler ayrı açılır alandadır.
4. Analizi başlattığında üyelik kodu ve kalan hak sunucuda kontrol edilir.
5. Sonuçta seçim, güven seviyesi, risk, üç kısa gerekçe ve açılır veri detayları gösterilir.
6. Güçlü ortak sinyal yoksa zorunlu tahmin yerine açıkça “Seçim yok” kararı verilir.
7. Sonuç tarayıcı geçmişi, son analiz kaydı ve analiz kuyruğuyla uyumlu biçimde saklanır.

Güncel ana dosyalar:

- index.html
- premium-analysis-v3.css
- premium-analysis-v3-core.js
- premium-analysis-v3.js
- server-membership-guard.js
- nav-routing.js
- cache-version.js
- tests/premium-analysis-v3.test.js

Veri kaynağı sırası full-bulletin.json ve güvenli yedek olarak two-day-bulletin.json dosyasıdır. Canlı, bitmiş, iptal ve ertelenmiş maçlar Özel Analiz listesine girmez. Eski premium dosyaları geri dönüş amacıyla repoda tutulur fakat V3 sayfasında yüklenmez.

## 2026-08-23 performans koruması

- V3 önce günlük maç widget'ının normalize ettiği yaklaşan maç listesini kullanır.
- full-bulletin.json eş zamanlı istekleri ortak kısa süreli ağ katmanında birleşir.
- two-day-bulletin.json yalnız ana bülten boş veya erişilemez olduğunda indirilir.
- Ana sayfa robot-analysis.json ve eski learning/premium eklentilerini başlangıçta yüklemez.
- Bu kurallar değiştirilirken V3 üyelik doğrulaması ve analiz hakkı tüketimi korunmalıdır.

## 2026-08-24 PRO 13 güncellemesi

- Robotun 0–100 değeri `model_score` yani sinyal gücüdür; kazanma olasılığı değildir.
- Sonuç olasılığı `estimated_probability`, marjı temizlenmiş piyasa karşılığı `market_probability`, aradaki fark `edge_percent` alanında tutulur.
- Gol/KG sinyalleri 1X2 marketlerini yükseltemez; her kanıt yalnız kendi market grubuna etki eder.
- Yüksek oran eşitlik bozucu değildir. Aday sırası model gücü, veri kapsamı, tahmini olasılık ve daha düşük oran düzenindedir.
- Orandan türetilmiş proxy metrik bağımsız kanıt değildir. Bağımsız sonuç/form verisi yoksa model puanı 64 ile sınırlanır, risk Yüksek ve veri niteliği Sınırlı olur.
- Değer etiketi için pozitif model–piyasa farkı ve bağımsız kanıt zorunludur.
- Tarayıcı büyük robot-analysis.json yerine `data/pro-analysis-index.json` kompakt akışını okur.
- PRO kaydı yoksa veya altı saatten eskiyse robot zorunlu seçim üretmez.
- Kupon ortak olasılığı ayak olasılıklarının çarpımıyla gösterilir; bağımsızlık varsayımı ve artan maç sayısı riski açıkça yazılır.
- Eski skor geçmişi olasılık kalibrasyonu değildir. Yeni tahmini olasılık örnekleri en az 30 sonuca ulaştığında Brier skoru açılır.
- Ayrıntılı araştırma ve eşikler `docs/OZEL_ANALIZ_PRO13_ARASTIRMA_VE_MIMARI.md` dosyasındadır.
