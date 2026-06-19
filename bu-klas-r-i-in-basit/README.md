# Futbol Laboratuvari

Futbol Laboratuvari; mac verilerini toplamak, takim ve lig seviyesinde analiz etmek ve kupon onerileri uretmek icin tasarlanan ilk surum proje iskeletidir.

## Yapi

- `data/`: Veri dosyalari icin.
- `outputs/`: Robot ve analiz raporlari icin.
- `src/`: Kaynak kodlar icin.
- `tests/`: Test dosyalari icin.
- `notes.md`: Notlar ve fikirler icin.
- `run_robot.bat`: Windows'ta tek tik robot calistirma dosyasi.

## Faz 1 - Tek Tik Robot

Faz 1 hedefi, Futbol Laboratuvari V1'i yerel PC'de tek tikla calisir hale getirmektir.

### Tek Tik Calistirma

Windows'ta proje klasorunde su dosyayi calistir:

```text
run_robot.bat
```

Robot sunlari yapar:

1. API anahtari ortam degiskenlerini PRO 12.2 sirasiyla kontrol eder.
2. football-data.org ana kaynagini kullanarak maclari tarar.
3. Veri yoksa veya kaynak yetersizse API-Football fallback durumunu rapora yazar.
4. Maclari mevcut motorlarla skorlar.
5. `outputs/bugunun_en_guclu_maclari.md` raporunu olusturur.
6. Hata olursa pencere kapanmaz; kullanici mesaji gorebilir.

### Ortam Degiskenleri

API anahtarlari dosyaya yazilmaz. `.env.example` sadece ornek dosyadir.

PowerShell icin:

```powershell
$env:FOOTBALL_DATA_API_KEY="FOOTBALL_DATA_ORG_ANAHTARIN"
$env:API_FOOTBALL_KEY="API_FOOTBALL_ANAHTARIN"
$env:API_FOOTBALL_KEY2="IKINCI_API_FOOTBALL_ANAHTARIN"
```

Windows kalici ortam degiskeni olarak ayarlamak icin:

```powershell
setx FOOTBALL_DATA_API_KEY "FOOTBALL_DATA_ORG_ANAHTARIN"
setx API_FOOTBALL_KEY "API_FOOTBALL_ANAHTARIN"
setx API_FOOTBALL_KEY2 "IKINCI_API_FOOTBALL_ANAHTARIN"
```

Yeni terminal acildiktan sonra `run_robot.bat` calistirilabilir.

Robot ayrica proje kokundeki `.env` dosyasini da okur. GitHub Repository
Secrets ve GitHub Environment Secrets calisma aninda ortam degiskeni olarak
geldigi icin ayni zincir tarafindan desteklenir.

PRO 12.2 API secim sirasi:

1. `FOOTBALL_DATA_API_KEY` varsa `Football-Data API`
2. Yoksa `API_FOOTBALL_KEY` varsa `API-Football`
3. Yoksa `API_FOOTBALL_KEY2` varsa `API-Football-2`
4. Ucu de yoksa `Demo Mode`

### API Yedekleme Mimarisi

Ana kaynak:

- football-data.org

Fallback kaynak:

- API-Football / API-Sports Football

Fallback su durumlarda devreye girecek sekilde hazirlandi:

- football-data.org 0 mac dondururse
- 403 / 404 alinirsa
- veri yetersiz kalirsa

API-Football anahtari once `API_FOOTBALL_KEY`, yoksa `API_FOOTBALL_KEY2` ortam degiskeninden okunur. Faz 1'de API-Football istemcisi, normalizer ve kaynak yoneticisi hazirlandi; lig id eslesmeleri tamamlandiginda aktif fixture cekimi genisletilecektir.

### Turkiye Ligleri Plani

API-Football uzerinden arastirilacak ligler:

- Turkiye Super Lig
- TFF 1. Lig
- TFF 2. Lig
- TFF 3. Lig
- Turkiye Kupasi

Ilgili plan ve fallback mimarisi:

- `src/kaynak_oncelik_haritasi.py`
- `src/api_football_client.py`
- `src/api_football_normalizer.py`
- `src/veri_kaynagi_yoneticisi.py`

## Ilk Veri Toplayici

`src/ilk_veri_toplayici.py`, football-data.org API kullanacak sekilde tasarlanmis ilk veri toplama moduludur.

### Kurulum

V1 demo akisi Python ile calisir. Mackolik arsiv veri cekme modulu icin Playwright gerekir.

Gerekli olan tek sey:

- Python 3.10 veya uzeri
- football-data.org API anahtari
- Mackolik veri cekme icin Playwright Chromium tarayicisi

Kurulum komutlari:

```powershell
python --version
python -m pip install -r requirements.txt
python -m playwright install chromium
```

Not: API key yoksa robot demo modda calismaya devam eder. Playwright kurulu degilse Mackolik veri cekme adimi hata raporu uretir, ana V1 demo akisi durmaz.

### Kutuphane Durumu

`src/ilk_veri_toplayici.py` standart kutuphanelerle calisir. `src/mackolik_veri_cekici.py` icin `playwright` gerekir.

Kullanilan kutuphaneler:

- `json`: API yanitlarini okumak ve ornek cikti basmak icin.
- `os`: API anahtarini ortam degiskeninden almak icin.
- `dataclasses`: API istemcisini temiz bir sinif yapisinda tutmak icin.
- `typing`: Tip ipuclari icin.
- `urllib`: HTTP istekleri ve hata yakalama icin.
- `playwright`: Mackolik Arsiv sayfasini tarayici ile acip gorunen mac/oran tablosunu okumak icin.

### Amac

- Belirli bir ligin puan durumunu cekmek.
- Belirli bir lig icin son mac sonuclarini cekmek.
- API'den gelen ham JSON yanitlarini sade Python listelerine donusturmek.
- API anahtarini koda gommeden, sonradan eklenebilir sekilde kullanmak.

### API Anahtari

API anahtari daha sonra football-data.org hesabindan alinip `FOOTBALL_DATA_API_KEY` ortam degiskenine eklenmelidir. Kod icinde `API_KEY_PLACEHOLDER` yer tutucusu vardir; gercek anahtari kalici olarak dosyaya yazmak yerine ortam degiskeni kullanmak tercih edilir.

### Football-data.org API Anahtari Alma

1. https://www.football-data.org/client/register adresine git.
2. Kayit formunda kullanacagin teknoloji veya dili sec.
3. Terms & Conditions kutusunu onayla.
4. Hesabi olustur.
5. Kayit tamamlandiktan sonra API anahtari alinir. football-data.org dokumaninda kayit sonrasi musteriye API Key verildigi belirtilir.
6. Ucretsiz katman baslangic icin yeterlidir; resmi sayfada Free Tier icin temel fikstur, sonuc ve lig tablolarina erisim oldugu belirtilir.
7. API anahtarini kodun icine yazma. PowerShell ortam degiskeni olarak ekle.

Kaynaklar:

- https://www.football-data.org/client/register
- https://www.football-data.org/documentation/quickstart

PowerShell ornegi:

```powershell
$env:FOOTBALL_DATA_API_KEY="BURAYA_API_ANAHTARI_GELECEK"
```

Alternatif olarak anahtar dogrudan istemciye verilebilir:

```python
from src.ilk_veri_toplayici import FootballDataClient

client = FootballDataClient(api_key="BURAYA_API_ANAHTARI_GELECEK")
```

### Kullanim Ornegi

```python
from src.ilk_veri_toplayici import (
    FootballDataClient,
    get_league_standings_table,
    get_recent_match_results,
)

client = FootballDataClient()

puan_durumu = get_league_standings_table(client, "PL")
son_maclar = get_recent_match_results(client, "PL", limit=5)
```

### Calisma Mantigi

1. `FootballDataClient`, API kok adresini ve API anahtarini yonetir.
2. `_request_json`, football-data.org endpointlerine GET istegi atar.
3. `get_standings`, `/competitions/{lig_kodu}/standings` endpointinden puan durumu ceker.
4. `get_recent_matches`, `/competitions/{lig_kodu}/matches` endpointinden bitmis maclari ceker.
5. `parse_standings`, ham puan durumu yanitini sade tablo satirlarina donusturur.
6. `parse_matches`, ham mac yanitini sade mac sonucu satirlarina donusturur.

### Ornek Lig Kodlari

- `PL`: Premier League
- `BL1`: Bundesliga
- `SA`: Serie A
- `PD`: La Liga
- `FL1`: Ligue 1
- `CL`: UEFA Champions League

### Komutla Calistirma

API anahtari ortam degiskenine eklendikten sonra:

```powershell
python .\src\ilk_veri_toplayici.py
```

Kod calistiginda once puan durumu, sonra son mac sonuclari icin ornek istek yapar. API anahtari eksikse program kontrollu bir hata mesaji verir.

### Terminal Komutlari

Proje klasorune gec:

```powershell
cd "C:\Users\Arıf\Documents\Codex\2026-06-18\bu-klas-r-i-in-basit"
```

Python surumunu kontrol et:

```powershell
python --version
```

Gereksinimleri kur:

```powershell
python -m pip install -r requirements.txt
```

API anahtarini sadece mevcut terminal oturumu icin ayarla:

```powershell
$env:FOOTBALL_DATA_API_KEY="GERCEK_API_ANAHTARINI_BURAYA_YAZ"
```

Veri toplayiciyi calistir:

```powershell
python .\src\ilk_veri_toplayici.py
```

Python komutu taninmazsa Windows Python Launcher ile dene:

```powershell
py -3 .\src\ilk_veri_toplayici.py
```
