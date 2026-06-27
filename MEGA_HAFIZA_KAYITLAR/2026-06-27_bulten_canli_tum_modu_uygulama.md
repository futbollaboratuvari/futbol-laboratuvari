# 2026-06-27 Bulten Canli Tum Modu Uygulama

## Talimat

Kullanici su 6 maddeyi verdi:

1. `daily-matches-widget.js` icinde tek bulten korunacak.
2. Uste `Canli` ve `Tum Bulten` mantigi eklenecek.
3. Canli mac basladiysa satirda dakika/skor gorunecek.
4. Baslamamis maclarda sadece saat gorunecek.
5. Sag kupon alani kalacak.
6. Yeni widget/bridge yok.

## Uygulanan Dosya

Sadece mevcut bulten dosyasi guncellendi:

- `daily-matches-widget.js`

Commit:

- `599d19229e7d14050b95020b5ed7878a53d40c18`

## Uygulama Ozeti

### Tek Bulten

- `INSTANCE_KEY` singleton korumasi duruyor.
- `WIDGET_ID` ayni: `daily-matches-widget`.
- Veri kaynak sirasi ayni:
  1. `data/full-bulletin.json`
  2. `data/live-matches.json`
  3. `data/fixtures.json`

### Canli / Tum Bulten

- State icine `mode` eklendi.
- Ust sekmeler eklendi:
  - `Tum Bulten`
  - `Canli`

### Canli Mac Gosterimi

- `isLiveMatch` fonksiyonu eklendi.
- Status, dakika, elapsed, skor alanlari kontrol ediliyor.
- Canli macta satirda CANLI etiketi, dakika ve skor gorunur.
- Baslamamis macta sadece saat gorunur.

### Sag Kupon Alani

- `Kuponum` alani korundu.
- Orana tiklayinca secim sag alana eklenir.
- Secim tekrar tiklama veya Sil butonuyla kaldirilir.

### Yeni Dosya Eklenmedi

- Yeni widget yok.
- Yeni bridge yok.
- Site/deploy konusuna girilmedi.

## Sonuc

Talimat verilen 6 madde mevcut tek bulten dosyasi icinde uygulandi.
