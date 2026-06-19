# Futbol Laboratuvari V1 Kullanim Kilavuzu

## Amac

Bu kilavuz Futbol Laboratuvari V1 robotunu yerel PC'de API key olmadan veya API key ile calistirmak icin hazirlandi.

## En Kolay Kullanim

Proje klasorundeki su dosyaya cift tikla:

```text
run_robot.bat
```

Robot raporu su dosyaya uretir:

```text
outputs/bugunun_en_guclu_maclari.md
```

## API Key Yoksa Ne Olur?

API key yoksa robot durmaz.

Robot otomatik olarak demo moda gecer ve sunlari yapar:

1. `data/football_data_org_ornek.json` dosyasindaki ornek veriyi okur.
2. Mevcut analiz motorlarini calistirir.
3. Kupon onerileri uretir.
4. `data/tahmin_gecmisi.json` dosyasini guncellemeye calisir.
5. `outputs/basari_yuzdesi_raporu.md` raporunu guncellemeye calisir.
6. `outputs/bugunun_en_guclu_maclari.md` raporunu olusturur.

Ekranda su mesaj gorunur:

```text
Demo modda calisiyor.
```

## Demo Modun Amaci

Demo mod canli API olmadan robotun basindan sonuna kadar calistigini gormek icindir.

Demo modda:

- Gercek zamanli mac cekilmez.
- API key gerekmez.
- Ornek Premier League verisi kullanilir.
- Sonuclar karar destek ve test amaclidir.

## Canli Moda Gecis

API key alindiktan sonra Windows ortam degiskeni olarak tanimlanir.

PowerShell gecici tanimlama:

```powershell
$env:FOOTBALL_DATA_API_KEY="BURAYA_FOOTBALL_DATA_KEY"
$env:API_FOOTBALL_KEY="BURAYA_API_FOOTBALL_KEY"
```

Kalici tanimlama:

```powershell
setx FOOTBALL_DATA_API_KEY "BURAYA_FOOTBALL_DATA_KEY"
setx API_FOOTBALL_KEY "BURAYA_API_FOOTBALL_KEY"
```

Kalici tanimlamadan sonra yeni terminal ac veya bilgisayari yeniden baslat.

Sonra tekrar:

```text
run_robot.bat
```

## Calisma Modlari

| Mod | Ne Zaman Calisir? | Veri Kaynagi | Sonuc |
|---|---|---|---|
| Demo | API key yoksa | `data/football_data_org_ornek.json` | Offline rapor uretir |
| Canli | API key varsa | football-data.org / API-Football | Canli maclari tarar |

## Uretilen Dosyalar

| Dosya | Aciklama |
|---|---|
| `outputs/bugunun_en_guclu_maclari.md` | Ana mac analizi ve kupon raporu |
| `outputs/basari_yuzdesi_raporu.md` | Tahmin basari takip raporu |
| `data/tahmin_gecmisi.json` | Tahmin gecmisi |
| `data/ham_mac_havuzu.json` | Ham mac veri havuzu |

## Onemli Kurallar

- Robot kullanici adina hesap acmaz.
- Robot e-posta dogrulamasi yapmaz.
- Robot sifre olusturmaz.
- Robot API key uydurmaz.
- API key kullanici tarafindan alinir.
- API key `.env` veya Windows ortam degiskeninde saklanir.

## Siradaki Ana Hedef

Yeni algoritma veya kupon gelistirmeden once hedef:

```text
1000+ benzersiz maclik ham veri havuzu
```

Calisma sirasi:

1. Once veri.
2. Sonra model.
3. Sonra kupon.
