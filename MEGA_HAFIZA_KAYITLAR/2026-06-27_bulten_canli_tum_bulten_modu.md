# 2026-06-27 Bulten Canli / Tum Bulten Modu

## Kullanici Talimati

Kullanici net olarak su maddeleri verdi:

1. `daily-matches-widget.js` icinde tek bulten korunacak.
2. Uste `Canli` ve `Tum Bulten` mantigi eklenecek.
3. Canli mac basladiysa satirda dakika/skor gorunecek.
4. Baslamamis maclarda sadece saat gorunecek.
5. Sag kupon alani kalacak.
6. Yeni widget/bridge yok.

## Yapilan Islem

Sadece mevcut dosya guncellendi:

- `daily-matches-widget.js`

Commit:

- `599d19229e7d14050b95020b5ed7878a53d40c18`

## Korunanlar

- Tek motor korundu.
- Singleton korundu.
- Cleanup korundu.
- Veri sirasi korundu:
  1. `data/full-bulletin.json`
  2. `data/live-matches.json`
  3. `data/fixtures.json`
- Sag kupon alani korundu.
- Yeni widget eklenmedi.
- Yeni bridge eklenmedi.

## Eklenenler

### Canli / Tum Bulten modu

State icine `mode` eklendi:

- `all`
- `live`

Ust sekmeler:

- `Tum Bulten`
- `Canli`

### Canli Mac Algilama

Canli maclar su verilerden algilanir:

- status alanlari: live, in_play, playing, 1h, 2h, ht, first_half, second_half, devam, canli, basladi/basladi varyantlari
- minute / elapsed / liveMinute alanlari
- skor varsa ve mac scheduled/not_started degilse

### Satir Durumu

Canli mac:

- CANLI etiketi
- dakika
- skor

Baslamamis mac:

- sadece saat

### Sag Kupon Alani

Orana tiklayinca secim sagdaki `Kuponum` alanina eklenmeye devam eder.

### Detay Alani

Detay butonu ayni satirin altinda ek marketleri acmaya devam eder.

## Sonuc

Kullanici talimatindaki 6 madde mevcut tek bulten dosyasi icinde uygulandi. Site/deploy konusu ele alinmadi. Yeni dosya veya bridge eklenmedi.
