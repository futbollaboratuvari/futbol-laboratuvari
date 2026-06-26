# 2026-06-27 Gece Maclari Duzeltme Kaydi

## Istenen Is

Bultende 00:00-07:59 arasi maclarin gorunmesi istendi. Ekstra yazi veya etiket istenmedi.

## Bulunan Sorun

Ilk gece scripti yanlis yonu kontrol ediyordu. Onceki gunun erken saatlerini ariyordu.

Gercek ihtiyac sudur:

- Bugunun bulteni 08:00 sonrasindan basliyor.
- Erken saat maclari kaynakta yarin tarihinin 00:00-07:59 satirlari olarak durabiliyor.
- Bu yuzden bugun + yarin erken saatleri birlikte okunmali.

## Yapilan Duzeltme

`scripts/update-night-window.js` guncellendi.

Yeni kural:

- Bugunun tarihi okunur.
- Yarin tarihi hesaplanir.
- Bugun veya yarin tarihli olan ve saati 08:00'den kucuk maclar gece bultenine eklenir.
- Macin gercek tarihi korunur.
- Cikti `data/fixtures.json` ve `data/ham_mac_havuzu.json` icine yazilir.

## Baglanti

`package.json` icinde script zaten zincire baglidir:

- `update:fixtures`
- `update:all`

## Commit

- `fca8aef5f6733862e674377425571cfd48508540`

## Sonraki Kontrol

Actions calisinca `data/fixtures.json` kontrol edilecek. Beklenen sonuc: 00:00, 02:30, 05:00 gibi erken saat maclari da bultende gorunmeli.
