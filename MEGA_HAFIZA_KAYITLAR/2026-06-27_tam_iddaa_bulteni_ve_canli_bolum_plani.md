# 2026-06-27 Tam Iddaa Bulteni ve Canli Bolum Plani

## Kullanici Istegi

Kullanici Nesine benzeri tam mac bulteni sistemi istiyor. Amac analiz veya kupon karti degil, once saglam bulten altyapisidir.

## Ana Hedef

Sitede tam iddaa bulteni gorunumu kurulacak:

- Saat
- Lig
- Mac
- MS 1
- MS X
- MS 2
- Alt
- Ust
- KG Var
- KG Yok
- Detay

Bulten bugunun programini gosterecek. Erken saat maclari kacmayacak. Baslayan maclar icin ayrica Canli Bolum olacak.

## Onemli Kural

Mevcut site kirilmayacak. Eski calisan dosyalar silinmeyecek. Yeni sistem once ayri dosyalarla kurulacak, sonra kontrollu sekilde sayfaya baglanacak.

## Asama 1 - Veri Modeli

Yeni temiz bulten veri dosyasi olusturulacak:

- `data/full-bulletin.json`

Bu dosya analizden bagimsiz olacak. Sadece mac bulteni icin kullanilacak.

Beklenen alanlar:

- `generated_at`
- `timezone`
- `source`
- `date_window`
- `match_count`
- `live_count`
- `scheduled_count`
- `matches`

Her mac icin alanlar:

- `date`
- `time`
- `league`
- `home`
- `away`
- `matchCode`
- `status`
- `minute`
- `score`
- `odds.ms1`
- `odds.msx`
- `odds.ms2`
- `odds.under25`
- `odds.over25`
- `odds.bttsYes`
- `odds.bttsNo`

## Asama 2 - Bulten Toplama Scripti

Yeni script eklenecek:

- `scripts/build-full-bulletin.js`

Bu scriptin gorevi:

1. Kaynaktan tam bulten verisini okumak.
2. Bugunun maclarini almak.
3. Erken saat penceresini kacirmamak.
4. Bugun + yarin 00:00-07:59 arasi maclari dahil etmek.
5. Maclari saat sirasina koymak.
6. `data/full-bulletin.json` dosyasina yazmak.
7. Bos veri gelirse eski veriyi uydurup gostermemek.

## Asama 3 - Canli Bolum Verisi

Ayni script veya ayri script su dosyayi uretecek:

- `data/live-now.json`

Bu dosya sadece baslayan veya canli olan karsilasmalari tasiyacak.

Beklenen alanlar:

- `generated_at`
- `live_count`
- `matches`

Canli mac alanlari:

- `time`
- `league`
- `home`
- `away`
- `minute`
- `score`
- `status`
- `last_update`

Not: GitHub Pages statik site oldugu icin gercek saniyelik canli akis API olmadan mumkun degildir. Ilk asamada sayfa JSON dosyasini belirli araliklarla yenileyecek. Kaynak veri guncellenirse Canli Bolum de guncellenecek.

## Asama 4 - Site Bulten Paneli

Yeni frontend dosyasi eklenecek:

- `full-bulletin-widget.js`

Bu dosya `data/full-bulletin.json` okuyacak ve Nesine benzeri tablo gorunumu basacak.

Ozellikler:

- Lig filtresi
- Saat sirasi
- Arama
- Mobil kaydirilabilir tablo
- Detay butonu
- Eski veri uyarisi

## Asama 5 - Canli Bolum Paneli

Yeni frontend dosyasi eklenecek:

- `live-now-widget.js`

Bu dosya `data/live-now.json` okuyacak.

Ozellikler:

- Baslayan maclar
- Dakika
- Skor
- Lig
- Mac
- Otomatik yenileme
- Canli mac yoksa sade mesaj

## Asama 6 - Kirilmadan Baglama

Once yeni dosyalar olusturulacak. Sonra `cache-version.js` uzerinden baglanacak.

`index.html` dogrudan degistirilmeyecek veya son asamaya kadar dokunulmayacak.

Baglanacak dosyalar:

- `full-bulletin-widget.js`
- `live-now-widget.js`

## Asama 7 - Otomatik Akis

`package.json` zincirine yeni script baglanacak:

- `build:bulletin`
- `update:all` icine `build-full-bulletin.js`

Actions zaten 30 dakikada bir calisiyor. Ilk etapta bu zincir kullanilacak. Gercek canli veri icin ileride daha sik kaynak veya API gerekecek.

## Asama 8 - Test ve Kanit

Her asamada kontrol edilecek:

1. `data/full-bulletin.json` dolu mu?
2. Ilk mac saati 08:00 oncesi varsa gorunuyor mu?
3. `data/live-now.json` sadece baslayan maclari gosteriyor mu?
4. Site eski kartlari kirmadan yeni bulteni gosteriyor mu?
5. Mobil tabloda kayma ve okunabilirlik iyi mi?

## Is Akisi

Her asama ayri kayit edilecek:

- Asama 1 kaydi
- Asama 2 kaydi
- Asama 3 kaydi
- Asama 4 kaydi
- Asama 5 kaydi
- Test kaydi

## Net Baslangic

Bir sonraki adim Asama 1 ve Asama 2'dir:

- `data/full-bulletin.json` modelini belirlemek.
- `scripts/build-full-bulletin.js` dosyasini kurmak.
