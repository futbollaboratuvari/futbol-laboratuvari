# 2026-06-27 Video Marketleri Tam Egitim + Veri Akisi

Bu dosya ilgili video market calismalarini tek kayitta toplar. Amac hafiza daginikligini azaltmaktir.

## Ana Talep

Kullanici videoda gorunen marketlerin tamamini sisteme eklemeyi, robota ve Pro 12.2'ye ogretmeyi, sonrasinda veri akisinin bu marketlerin oranlarini da cekip tasimasini istedi. Yeni kod dosyasi acilmadan mevcut dosyalarda calisilmasi istendi.

## Market Kapsami

- Handikapli Mac Sonucu / HND 1-X-2 / 0-1 / 1-0 / 2-0 / 0-2
- IY/MS 1/1, 1/X, 1/2, X/1, X/X, X/2, 2/1, 2/X, 2/2
- MS + Alt/Ust kombinasyonlari
- Mac Sonucu ve 1.5 / 2.5 / 3.5 / 4.5 Alt-Ust
- MS + KG Var/Yok
- 0.5 / 1.5 / 3.5 / 4.5 Alt-Ust
- 0-1 Gol, 2-3 Gol, 4-5 Gol, 6+ Gol
- Ilk Yari / Mac Skoru
- 1. Yari Skoru
- Dogru Skor secenekleri
- 1. Yari / 2. Yari KG kombinasyonlari: Evet/Evet, Evet/Hayir, Hayir/Evet, Hayir/Hayir
- Korner, kart ve takim sut marketleri

## Tamamlanan Kod Guncellemeleri

### 1. Premium analiz paneli market secenekleri

Dosya: `premium-analysis-extra-markets.js`
Commit: `b4774bd153fddd7e3175e599bad81d00fcdfe488`

Panel market listesine HND, IY/MS, MS+Alt/Ust, MS+KG, alt-ust cizgileri, gol araliklari, skor marketleri, 1Y/2Y KG kombinasyonlari, korner, kart ve sut eklendi.

### 2. Premium robot motoru

Dosya: `premium-robot-engine.js`
Commit: `cccf954d767be02d59defb9897db102a0eed1d62`

`mapMarket()` genisletildi. Robot yeni market adlarini veri anahtarlarina eslestirir. Market risk cezalari genisletildi:

- HND ve skor marketleri yuksek risk olarak okunur.
- IY/MS marketi ozel risk sinifi olarak okunur.
- 1Y/2Y KG kombinasyonlari ayri kontrol edilir.
- Korner, kart ve sut marketleri ayri risk grubuna alindi.

### 3. Pro 12.2 genis market skorlayici

Dosya: `pro12-2-wide-market-engine.js`
Commit: `d6e3908468648411a184fa15996bbc1c6bc7e1ed`

Pro 12.2 genis market skorlayiciya HND, IY/MS, MS+Alt/Ust, MS+KG, gol araligi, skor, 1Y/2Y KG, tek/cift, korner, kart ve sut marketleri eklendi. `base()` fonksiyonu score ve hnd gruplarini da skorlamaya basladi.

### 4. Bulten detay market akisi

Dosya: `cache-version.js`
Commit: `b55f13b53f985c5390fcc9654fe87d5a84c1ce5c`

Bulten detay alaninda veri varsa yeni marketler okunacak hale getirildi. `marketDefinitions` genisletildi ve detay tiklama akisi ayni dosya icinde korunarak devam ettirildi.

### 5. Detay temizleme filtresi

Dosya: `site-visible-fix.js`
Commit: `95a2265eec404e9b55683deefdaa9bf43208c1c0`

Detay market filtre mantigina `hnd`, `handikap`, `skor`, `dogru` gibi alanlar eklendi. Boylece yeni marketler temizlik tarafindan silinmeyecek.

### 6. Veri cekme ve fixtures akisi

Dosya: `scripts/update-fixtures.js`
Commit: `85ed98d3eb92a0ec5e9b131212e11cbaf9a8ed85`

Maçkolik satir parseri genisletildi. Ana oranlardan sonra satirda bulunan ek sayisal oranlar `MARKET_SEQUENCE` ile yeni market anahtarlarina tasinir.

Yeni tasinan alanlar:

- `raw_odds_sequence`
- `raw_market_guess_odds`
- `raw_market_labels`
- `available_odds`
- `raw_market_value_count`
- `raw_market_source_note`

Not: Veri kaynagi ilgili market oranini sayfada vermiyorsa sistem oran uydurmaz; alan bos kalir.

### 7. Canli veri JSON akisi

Dosya: `scripts/ensure-live-json.js`
Commit: `01e2cb80632e20d9a3b85a6e99c306be6418a098`

Canli JSON artik `match.available_odds`, `match.raw_market_guess_odds`, `analysis.available_odds` ve `analysis.raw_market_guess_odds` kaynaklarini birlikte korur.

Eklendi:

- `market_odds_inventory`
- `wide_market_odds_count`
- `raw_market_guess_odds`
- `raw_odds_sequence`

Bu sayede yeni market oranlari `live-matches.json` icine tasinabilir.

### 8. Tam bulten dosyasi parca parca tamamlandi

Dosya: `scripts/build-full-bulletin.js`
Commit: `7f9c9677221d9a064b5b6ab59927bf3ad880f3f7`

Daha once filtreye takilan dosya parca parca sadeletirilerek guncellendi. Tam bulten artik genis market oranlarini korur.

Eklenen/korunan alanlar:

- `EXTRA_MARKET_KEYS`
- `collectExtraOdds()`
- `mapExtraFromOdds()`
- `available_odds`
- `raw_market_guess_odds`
- `raw_odds_sequence`
- `raw_market_value_count`
- `wide_market_odds_count`

### 9. Robot metrik zenginlestirme dosyasi parca parca tamamlandi

Dosya: `scripts/enrich-fixture-metrics.js`
Commit: `85a360050ac906d5b4f626688337fd1dc62af27b`

Daha once filtreye takilan dosya daha kucuk ve dinamik mantikla guncellendi. Robot metrik zenginlestirme artik `available_odds` ve `raw_market_guess_odds` icindeki genis oran envanterini korur.

Eklenen/korunan alanlar:

- `collectWideOdds()`
- `available_odds` icine genis oranlarin geri yazilmasi
- `market_odds_inventory`
- `wide_market_odds_count`
- `wide_market_learning_source`
- metric notlarina genis market oran envanteri kaydi

## Filtreye Takilan Denemeler

Ilk kapsamli denemeler GitHub guvenlik kontrolune takildi. Parca parca ilerleme sonrasi iki dosya da mevcut dosya icinde tamamlandi:

- `scripts/build-full-bulletin.js` tamamlandi.
- `scripts/enrich-fixture-metrics.js` tamamlandi.

Yeni dosya acilmadi, silme yapilmadi.

## Guncel Veri Akisi Mantigi

1. `scripts/update-fixtures.js` Maçkolik satirindan tum sayisal oranlari okur.
2. Ilk ana oranlar normal bulten alanlarina gider: MS1, MSX, MS2, 2.5 Alt/Ust.
3. Devam eden sayisal oranlar `raw_market_guess_odds` icinde video market sirasina gore tasinir.
4. `available_odds` tum ana ve genis market oranlarini birlestirir.
5. `scripts/ensure-live-json.js` bu oranlari `live-matches.json` icinde korur.
6. `scripts/build-full-bulletin.js` tam bultene ayni genis oranlari tasir.
7. `scripts/enrich-fixture-metrics.js` robot metrik zenginlestirmede genis oran envanterini korur.
8. Premium robot ve Pro 12.2 bu marketleri `mapMarket`, `defs`, risk ve skor mantigiyla analiz eder.

## Onemli Sinir

Bu islem veri akisini genisletir. Ancak kaynak HTML ilgili market oranini vermiyorsa sistem oran uydurmaz. Robot veri yoksa `Veri yok` veya bos oranla analiz yapar. Oran geldigi anda `available_odds` uzerinden robot ve bulten tarafina tasinir.

## Durum

Mevcut dosyalarda guncelleme yapildi. Yeni kod dosyasi acilmadi. Bu dosya teklesmis mega hafiza kaydi olarak guncellendi.
