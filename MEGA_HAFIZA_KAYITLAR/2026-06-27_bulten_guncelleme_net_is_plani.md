# 2026-06-27 Bulten Guncelleme Net Is Plani

## Duzeltme

Kullanici hakli olarak surecin saptigini belirtti. Asil hedef deploy tartismasi degil, mevcut bulteni Nesine benzeri tek bulten haline getirmekti.

Bundan sonra konu dagitilmayacak.

## Ana Hedef

Sitede tek bir bulten olacak.

Mevcut bulten dosyasi guncellenecek:

- `daily-matches-widget.js`

Yeni bulten, yeni widget, yeni bridge eklenmeyecek.

## Referans

Kullanici Nesine bulten goruntusu videosu gonderdi.

Video referansindan alinacak ana yapi:

- Ustte spor/lig/arama/filtre hissi
- Sol tarafta mac listesi
- Sag tarafta kupon alani mantigi
- Satirlarda saat, lig, mac, oran kolonlari
- Market kolonlari: 1, X, 2, Alt, Ust, Var, Yok
- Lig/date gruplama
- Detay acilinca ayni satirin altinda ek marketler
- Mobilde yatay kaydirma veya kartlasan tek bulten

## Asama Plani

### Asama B1 — Mevcut bulten iskeleti korunacak

- `daily-matches-widget.js` icindeki tek motor korunacak.
- Singleton ve cleanup korunacak.
- Veri sirasi korunacak:
  1. `data/full-bulletin.json`
  2. `data/live-matches.json`
  3. `data/fixtures.json`

### Asama B2 — Nesine benzeri tablo duzeni

Mevcut dosya icinden gorunum guncellenecek.

Kolonlar:

- Saat
- Lig
- Mac
- 1
- X
- 2
- Alt
- Ust
- Var
- Yok
- Detay

### Asama B3 — Filtre ve baslik alani

Tek bultenin ustune:

- Bugun / Yarin erken maclar bilgisi
- Kaynak etiketi
- Mac sayisi
- Basit lig/arama filtresi

eklenecek.

### Asama B4 — Sag kupon alani mantigi

Nesine gorunumundeki sag kupon alaninin sitedeki karsiligi sade sekilde eklenecek.

- Secilen maclar listesi
- Secilen market
- Toplam secim sayisi
- Eski veriden kupon uydurma yok

### Asama B5 — Mobil uyum

Mobilde:

- Tablo yatay kaydirma ile bozulmadan calisacak.
- Detay alani tek satirin altinda acilacak.
- Bulten ust uste binmeyecek.

### Asama B6 — Test ve rapor

Her asama sonunda:

- Hangi dosya guncellendi yazilacak.
- Commit yazilacak.
- Mega hafizaya kaydedilecek.
- Bulten tek mi, ikinci widget var mi kontrol edilecek.

## Durdurulan Konular

- Deploy sorunu simdilik bulten guncelleme akisini durdurmayacak.
- Yeni deploy probe dosyasi eklenmeyecek.
- Yeni test dosyasi eklenmeyecek.
- Yeni frontend widget eklenmeyecek.

## Uygulama Kuralı

Her islem once mevcut dosya icinden yapilacak.

Ana dosya:

- `daily-matches-widget.js`

Gerekirse sadece stil duzenleme icin mevcut CSS dosyasi kullanilacak. Ama once inline mevcut bulten stili icinde kalinacak.
