# 2026-06-27 Gece Maçları Bülten Bağlantı Kaydı

## Kullanıcı Tespiti

Kullanıcı siteyi kontrol etti ve gece maçlarının Bugünün Maçları bülteninde görünmediğini söyledi.

## Kontrol Sonucu

Sorun doğrulandı.

- `daily-matches-widget.js` yalnızca `data/fixtures.json` dosyasını okuyordu.
- `daily-matches-widget.js` ayrıca sadece `match.date === today` olan maçları gösteriyordu.
- `data/fixtures.json` güncel kontrolde boş / kullanılabilir maç listesi üretmiyordu.
- Buna karşılık `data/live-matches.json` doluydu ve 147 maç içeriyordu.

`data/live-matches.json` son durum:

- `generated_at`: `2026-06-26T22:16:20.122Z`
- `date`: `2026-06-27`
- `source`: `Maçkolik canlı robot`
- `status`: `active`
- `current_window`: `147`
- `scheduled`: `147`

## Yapılan İş

Yeni köprü dosyası eklendi:

- `daily-matches-live-bridge.js`

Bu dosya:

1. Önce `data/live-matches.json` dosyasını okur.
2. `live-matches.json` içinde maç varsa bülteni oradan kurar.
3. Gece maçları dahil tüm canlı maç penceresini gösterir.
4. Eğer canlı veri yoksa yedek olarak `data/fixtures.json` dosyasına düşer.
5. Bülten başlığında `Gece maçları dahil` etiketi gösterir.
6. Maçları tarihe göre gruplar.
7. Saat, lig, maç, MS 1-X-2, Alt/Üst, KG Var/Yok sütunlarını gösterir.

## Bağlantı

`cache-version.js` içine şu yükleme eklendi:

- `daily-matches-live-bridge.js`

Bu sayede `index.html` kırılmadan yeni köprü dosyası yüklenecek.

## Commitler

- Gece maçları bülten köprüsü eklendi: `94885b38e9830e1b9865db310ca3c28b61fe71a1`
- Köprü cache zincirine bağlandı: `8ad69f936e6ce3e18790eda4e217eb22ae1e3774`

## Net Sonuç

Her şey tam değildi. Bugünün Maçları bülteni eski şekilde `fixtures.json` dosyasına bağlı kaldığı için gece maçları görünmüyordu.

Bu kırılma giderildi. Artık bülten canlı veri dosyasındaki `147` maçlık pencereyi okuyacak ve gece maçlarını da gösterecek.

## Kullanıcı Kontrolü

Canlı sayfada Ctrl+F5 ile sert yenileme yapılacak. Bülten başlığında şu ifade görünmeli:

- `Bugünün Maç Bülteni`
- `Gece maçları dahil`

Maç sayısı da canlı dosyadaki güncel pencereye göre gelmeli.
