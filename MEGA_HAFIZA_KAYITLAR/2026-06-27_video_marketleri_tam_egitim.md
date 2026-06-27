# 2026-06-27 Video Marketleri Tam Egitim

## Talep

Kullanici videoda gorunen su marketlerin tamamini sisteme eklemeyi istedi:

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

## Yapilan Islem

Yeni kod dosyasi acilmadi. Mevcut dosyalarda calisildi.

### 1. Premium analiz paneli market secenekleri

Dosya: `premium-analysis-extra-markets.js`
Commit: `b4774bd153fddd7e3175e599bad81d00fcdfe488`

Panel market listesine HND, IY/MS, MS+Alt/Ust, MS+KG, alt-ust cizgileri, gol araliklari, skor marketleri ve 1Y/2Y KG kombinasyonlari eklendi.

### 2. Premium robot motoru

Dosya: `premium-robot-engine.js`
Commit: `cccf954d767be02d59defb9897db102a0eed1d62`

`mapMarket()` genisletildi. Robot artik yeni market adlarini veri anahtarlarina eslestirir. Market risk cezalari da genisletildi:

- HND ve skor marketleri daha yuksek risk olarak okunur.
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

## Onemli Not

Bu guncelleme market mantigini, secilebilir market listesini ve robot/pro12.2 skorlayiciyi genisletir. Ancak oran verisi veri dosyalarinda yoksa market ekranda bos gorunmez; robot analizinde oran `Veri yok` olarak kalabilir.

## Durum

Mevcut dosyalarda guncelleme tamamlandi. Yeni kod dosyasi acilmadi.
