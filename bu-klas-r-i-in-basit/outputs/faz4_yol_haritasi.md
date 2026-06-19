# Faz 4 Yol Haritasi

## Amac

Faz 4'un amaci Futbol Laboratuvari'ni sadece tahmin ureten sistem olmaktan cikarip, kendi tahmin performansini olcen ve zamanla iyilestirmeye hazir bir sisteme donusturmektir.

## Mevcut Durum

| Baslik | Durum |
|---|---|
| Faz 1 veri toplama altyapisi | Tamamlandi |
| Faz 2 analiz katmani | Tamamlandi |
| Faz 2 confidence ve ham veri havuzu | Tamamlandi |
| Faz 3 kupon motoru | Tamamlandi |
| Kupon motoru robot akisina baglanti | Tamamlandi |
| Performans takip semasi | Tamamlandi |
| Basari yuzdesi raporu | Ilk surum tamamlandi |
| API_FOOTBALL_KEY | Bu oturumda tanimli degil |
| Turkiye gercek league_id cekimi | Anahtar bekliyor |
| 1000+ maclik ham havuz | Anahtar ve canli API bekliyor |

## Kritik Engel

Bu oturumda `API_FOOTBALL_KEY` ortam degiskeni tanimli degil. Bu nedenle:

- Turkiye liglerinin gercek `league_id` degerleri canli API'den cekilemedi.
- API-Football fixture verisiyle ham havuz buyutulemedi.
- 1000+ maclik veri havuzu bu oturumda olusturulamadi.

Gercek `league_id` degerleri tahmin edilerek dosyaya yazilmadi. Bu degerler yalnizca API-Football `/leagues?country=Turkey` yanitindan geldikten sonra kaydedilecek.

## Faz 4 P0 - Canli Turkiye Lig ID Cekimi

Hedef:

- `API_FOOTBALL_KEY` ortam degiskeni tanimli iken `src/turkiye_ligleri_canli.py` calistirilacak.
- API-Football `/leagues?country=Turkey` endpointi okunacak.
- Su ligler gercek `league_id` degerleriyle eslestirilecek:
  - Super Lig
  - 1. Lig
  - 2. Lig
  - 3. Lig
  - Turkiye Kupasi
  - Super Kupa

Basari kriteri:

- `outputs/veri_buyutme_raporu.md` icinde her hedef lig icin `league_id` gorunur.
- Eslesmeyen ligler acikca raporlanir.

## Faz 4 P1 - 1000+ Maclik Ham Veri Havuzu

Hedef:

- API-Football uzerinden Turkiye ligleri ve oncelikli Avrupa ligleri icin fixture/sonuc verisi cekilecek.
- Her mac ortak semaya normalize edilecek.
- `data/ham_mac_havuzu.json` dosyasina `match_id` ile tekrar etmeden eklenecek.

Oncelikli kaynaklar:

1. API-Football Turkiye ligleri
2. football-data.org erisilebilir Avrupa ligleri
3. API-Football Avrupa ligleri

Basari kriteri:

- `data/ham_mac_havuzu.json` icinde en az 1000 benzersiz mac bulunur.
- `outputs/veri_buyutme_raporu.md` lig bazli mac sayilarini gosterir.
- Confidence skorlarinda veri miktari kaynakli artis gorulur.

## Faz 4 P2 - Tahmin Performans Takibi

Tamamlanan ilk surum:

- `src/performans_takip.py` olusturuldu.
- `data/tahmin_gecmisi.json` semasi olusturuldu.
- `outputs/basari_yuzdesi_raporu.md` ilk raporu olusturuldu.
- `src/robot.py` kupon onerilerini tahmin gecmisine ekleyecek sekilde guncellendi.

Sonraki isler:

- Bitmis mac sonuclari API'den yeniden cekilecek.
- Bekleyen tahminler `match_id` ile mac sonucuna eslestirilecek.
- KG Var ve Ust 2.5 marketleri otomatik `won/lost` olarak dogrulanacak.
- Sonuc dogrulama raporu olusturulacak.

## Faz 4 P3 - Basari Yuzdesi ve Kalibrasyon

Izlenecek metrikler:

| Metrik | Aciklama |
|---|---|
| Genel basari yuzdesi | Tum sonuclanan tahminlerde won / won+lost |
| Market bazli basari | KG Var, Ust 2.5, Ilk Yari KG, Ikinci Yari KG |
| Lig bazli basari | Her lig/kupa icin ayri basari |
| Confidence bazli basari | Low, medium, high, very_high tahmin performansi |
| Risk bazli basari | Dusuk, orta, yuksek, cok yuksek risk seviyeleri |

Basari kriteri:

- `outputs/basari_yuzdesi_raporu.md` gercek sonuclanmis tahminlerle dolmaya baslar.
- Confidence yuksek tahminlerin gercek basari orani raporlanir.

## Faz 4 P4 - Robot Akisi

Hedef tek tik akis:

```text
run_robot.bat
->
src/robot.py
->
veri cek
->
ham havuzu buyut
->
analiz et
->
confidence hesapla
->
kupon olustur
->
tahmin gecmisine kaydet
->
basari yuzdesi raporunu guncelle
->
outputs/bugunun_en_guclu_maclari.md
```

Mevcut durum:

- Veri cekme ve analiz akisi hazir.
- Kupon motoru robot akisina bagli.
- Tahmin gecmisi kaydi robot akisina bagli.
- Basari raporu uretim fonksiyonu hazir.
- Canli API buyutme anahtar bekliyor.

## Faz 5'e Hazirlik

Faz 4 tamamlandiktan sonra Faz 5 icin hedefler:

- Gecmis tahminlerden ogrenme.
- Market agirliklarini basari oranina gore kalibre etme.
- Lig bazli risk katsayisi uretme.
- Form, KG ve Ust/Alt agirliklarini gercek performansa gore ayarlama.
- Backtest ve ileri test ayrimi kurma.
