# 2026-06-26 Kupon Merkezi Veri Akışı Geliştirme Kaydı

## Kullanıcı ekran kontrolü

Kullanıcı ekran görüntüsünde Kupon Merkezi alanında şu durum göründü:

- Güncel Liste: Oranlı analiz bekleniyor
- Maç Sayısı: -
- Seçenek Sayısı: 0
- Durum: PRO analiz bekleniyor
- Dengeli / Yüksek Oranlı / Riskli kupon kutuları boş

## Repo kontrol sonucu

Veri akışı tamamen yok değil; fakat Kupon Merkezi resmi kupon dosyası boş olduğu için ekranda boş görünüyordu.

### Canlı veri dosyası

`data/live-matches.json` içinde veri var:

- `status`: active
- `current_window`: 55
- `active_analysis`: 55
- `watch_candidates`: 17
- `coupon_candidates`: 0

### Günlük kupon dosyası

`data/daily-coupons.json` içinde kuponlar hâlâ boş:

- `selected_matches: []`
- `is_available: false`

## Yapılan geliştirme

1. Yeni yedek veri akışı dosyası eklendi:
   - `kupon-center-fallback.js`

2. Kupon Merkezi canlı sayfa dil/temizlik katmanı güçlendirildi:
   - `site-human-language.js`

3. Kupon Merkezi artık sadece `daily-coupons.json` doluysa çalışmayacak. Aşağıdaki dosyalardan da izleme adayı çıkarabilecek:
   - `data/live-matches.json`
   - `data/analiz_sonuclari.json`
   - `data/daily-coupons.json`

4. Resmi kupon yoksa sistem izleme listesi gösterecek:
   - Dengeli İzleme Listesi
   - Yüksek Oran İzleme Listesi
   - Riskli Laboratuvar İzleme Listesi

5. Sayfa üstündeki sayaçlar canlı veriden güncellenecek:
   - Maç sayısı
   - Seçenek / aday sayısı
   - Güncel kaynak
   - Durum

## Güvenlik kuralı

Gerçek kupon yoksa sahte kesin kupon gösterilmez. Sistem izleme adayı dili kullanır. Son karar kullanıcıya aittir.

## Commitler

- `kupon-center-fallback.js` eklendi: `42c2203f14a5e8a2af503ccd71f133f819678bd9`
- `site-human-language.js` içine Kupon Merkezi yedek veri akışı bağlandı: `fd91684ae6aa11b3c19d6b5ff695bfa9733951b0`

## Not

Vercel kontrolü son committe build-rate-limit nedeniyle failure döndü. Bu kod hatası olarak görünmüyor; Vercel tarafında limit/dağıtım engeli mesajı var. GitHub Pages tarafında dosyalar repoya işlendi.

## Sıradaki kontrol

Canlı sayfa yenilendiğinde Kupon Merkezi şu şekilde kontrol edilecek:

- Maç Sayısı 55 veya güncel sayı olarak geliyor mu?
- Seçenek Sayısı 17 veya güncel izleme aday sayısı olarak geliyor mu?
- Kupon kutuları boş kalmak yerine izleme listesi kartları gösteriyor mu?
