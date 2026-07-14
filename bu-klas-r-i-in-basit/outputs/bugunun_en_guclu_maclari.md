# Bugunun En Guclu Maclari

## Calisma Modu

CALISMA_MODU: DEMO

## Aktif Veri Kaynağı

- Beta Mode
- Kullanılan Secret: YOK

Demo modda calisiyor.

API key bulunmadigi icin robot canli API yerine yerel ornek veriyi kullandi.

## Rapor Bilgisi

ANALIZ_TARIHI: demo
MAC_TARIHI: data/football_data_org_ornek.json
TOPLAM_MAC: 5

## Demo Skorlanan Maclar

| Sira | Mac | Lig | En Guclu Market | Guc Skoru | KG Var | Ust 2.5 | Confidence | Oneri Skoru | Risk |
|---:|---|---|---|---:|---:|---:|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth | Premier League | Ust 2.5 | 72.55 | 92.5 | 100 | 19.5 | 62.22 | 52.78 (yuksek) |
| 2 | Brighton & Hove Albion FC - Fulham FC | Premier League | KG Var | 50.22 | 79.17 | 37.5 | 19.5 | 48.15 | 66.85 (yuksek) |
| 3 | Sunderland AFC - West Ham United FC | Premier League | Ust 2.5 | 46.55 | 32.5 | 82.5 | 19.5 | 47.87 | 67.13 (yuksek) |
| 4 | Tottenham Hotspur FC - Burnley FC | Premier League | Ust 2.5 | 46.55 | 32.5 | 82.5 | 19.5 | 47.87 | 67.13 (yuksek) |
| 5 | Aston Villa FC - Newcastle United FC | Premier League | KG Var | 20.38 | 0 | 0 | 19.5 | 13.96 | 100 (cok_yuksek) |

---

# Faz 3 Kupon Motoru Raporu

## Rapor Bilgisi

RAPOR_TIPI: FAZ3_KUPON_MOTORU_RAPORU
MAC_SAYISI: 5

## Karar Kurallari

- Tek mac onerisi: Guc Skoru %35, Confidence Score %35, Market Sinyali %30.
- Risk puani: 100 - oneri skoru; confidence dusukse risk artirilir.
- 2'li ve 3'lu kuponlarda her ek ayak icin 8 puan kombinasyon riski eklenir.
- Bu rapor karar destek amaclidir; kesin sonuc iddiasi degildir.

## Tek Mac Onerileri

| Sira | Mac | Market | Guc | KG Var | Ust 2.5 | Confidence | Oneri Skoru | Risk |
|---:|---|---|---:|---:|---:|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth | Ust 2.5 | 72.55 | 92.5 | 100 | 19.5 | 62.22 | 52.78 (yuksek) |
| 2 | Brighton & Hove Albion FC - Fulham FC | KG Var | 50.22 | 79.17 | 37.5 | 19.5 | 48.15 | 66.85 (yuksek) |
| 3 | Sunderland AFC - West Ham United FC | Ust 2.5 | 46.55 | 32.5 | 82.5 | 19.5 | 47.87 | 67.13 (yuksek) |
| 4 | Tottenham Hotspur FC - Burnley FC | Ust 2.5 | 46.55 | 32.5 | 82.5 | 19.5 | 47.87 | 67.13 (yuksek) |
| 5 | Aston Villa FC - Newcastle United FC | KG Var | 20.38 | 0 | 0 | 19.5 | 13.96 | 100 (cok_yuksek) |

## 2'li Kupon Onerileri

| Sira | Maclar | Marketler | Kupon Skoru | Confidence | Risk |
|---:|---|---|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC | Ust 2.5<br>KG Var | 47.19 | 19.5 | 67.81 (yuksek) |
| 2 | Liverpool FC - AFC Bournemouth<br>Sunderland AFC - West Ham United FC | Ust 2.5<br>Ust 2.5 | 47.05 | 19.5 | 67.95 (yuksek) |
| 3 | Liverpool FC - AFC Bournemouth<br>Tottenham Hotspur FC - Burnley FC | Ust 2.5<br>Ust 2.5 | 47.05 | 19.5 | 67.95 (yuksek) |
| 4 | Brighton & Hove Albion FC - Fulham FC<br>Sunderland AFC - West Ham United FC | KG Var<br>Ust 2.5 | 40.01 | 19.5 | 74.99 (yuksek) |
| 5 | Brighton & Hove Albion FC - Fulham FC<br>Tottenham Hotspur FC - Burnley FC | KG Var<br>Ust 2.5 | 40.01 | 19.5 | 74.99 (yuksek) |

## 3'lu Kupon Onerileri

| Sira | Maclar | Marketler | Kupon Skoru | Confidence | Risk |
|---:|---|---|---:|---:|---|
| 1 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC<br>Sunderland AFC - West Ham United FC | Ust 2.5<br>KG Var<br>Ust 2.5 | 36.75 | 19.5 | 78.25 (cok_yuksek) |
| 2 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC<br>Tottenham Hotspur FC - Burnley FC | Ust 2.5<br>KG Var<br>Ust 2.5 | 36.75 | 19.5 | 78.25 (cok_yuksek) |
| 3 | Liverpool FC - AFC Bournemouth<br>Sunderland AFC - West Ham United FC<br>Tottenham Hotspur FC - Burnley FC | Ust 2.5<br>Ust 2.5<br>Ust 2.5 | 36.65 | 19.5 | 78.35 (cok_yuksek) |
| 4 | Brighton & Hove Albion FC - Fulham FC<br>Sunderland AFC - West Ham United FC<br>Tottenham Hotspur FC - Burnley FC | KG Var<br>Ust 2.5<br>Ust 2.5 | 31.96 | 19.5 | 83.04 (cok_yuksek) |
| 5 | Liverpool FC - AFC Bournemouth<br>Brighton & Hove Albion FC - Fulham FC<br>Aston Villa FC - Newcastle United FC | Ust 2.5<br>KG Var<br>KG Var | 25.44 | 19.5 | 89.21 (cok_yuksek) |

## Faz 3 Notu

- Mevcut ham havuz 5 maclik ornek veriyle basladigi icin confidence skorlarinin dusuk kalmasi beklenir.
- Canli API ile ham veri havuzu buyudukce confidence ve kupon kalitesi artacaktir.
- Faz 3'un sonraki adimi, bu motoru `run_robot.bat` akisina rapor uretici olarak baglamaktir.

---

# Basari Yuzdesi Raporu

## Rapor Bilgisi

OLUSTURMA_ZAMANI: 2026-07-14T14:07:35.697324+00:00
TOPLAM_TAHMIN: 125
SONUCLANAN_TAHMIN: 0
BEKLEYEN_TAHMIN: 125
VOID_TAHMIN: 0
GENEL_BASARI_ORANI: -

## Durum

Henuz sonuc dogrulanmis tahmin yok. Bu nedenle basari yuzdesi hesaplanmadi.

Faz 4'te mac sonuclari API'den tekrar cekilecek, bekleyen tahminler mac skoruyla eslestirilecek ve market bazli basari oranlari otomatik guncellenecek.

## Market Bazli Basari

| Market | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| KG_VAR | 0 | 0 | 50 | 0 | - |
| UST_25 | 0 | 0 | 75 | 0 | - |

## Tahmin Turu Bazli Basari

| Tahmin Turu | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| KG_VAR | 0 | 0 | 50 | 0 | - |
| UST_25 | 0 | 0 | 75 | 0 | - |

## Lig Bazli Basari

| Lig | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| Premier League | 0 | 0 | 125 | 0 | - |

## Confidence Bazli Basari

| Confidence | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| low | 0 | 0 | 125 | 0 | - |

## Faz 5 Notu

- Tahmin gecmisi `data/tahmin_gecmisi.json` dosyasinda tutulacak.
- Her tahmin once `pending` olarak kaydedilecek.
- Mac sonucu kesinlesince `won`, `lost` veya `void` durumuna alinacak.
- Genel, market bazli, lig bazli ve confidence bazli basari oranlari bu rapordan izlenecek.
- KG Var, Ust 2.5, MS1 ve Cifte Sans marketleri ayri takip edilecek.

## Ham Veri Havuzu

- Gelen mac: 5
- Yeni eklenen mac: 0
- Tekrar mac: 5
- Toplam benzersiz mac: 1842
- Dosya: /home/runner/work/futbol-laboratuvari/futbol-laboratuvari/bu-klas-r-i-in-basit/data/ham_mac_havuzu.json

## Tahmin Performans Takibi

- Gelen tahmin: 5
- Yeni eklenen tahmin: 0
- Tekrar tahmin: 5
- Toplam tahmin: 125
- Dosya: /home/runner/work/futbol-laboratuvari/futbol-laboratuvari/bu-klas-r-i-in-basit/data/tahmin_gecmisi.json

## Ortam Uyarilari

- API anahtari bulunamadi. Demo mod aktif.
- API key olmadigi icin demo mod kullanildi.

## Canli Moda Gecis

- `FOOTBALL_DATA_API_KEY` veya `API_FOOTBALL_KEY` tanimlandiginda robot canli mod deneyecek.
- API key yoksa robot durmaz; demo mod ile rapor uretir.

---

## Mackolik Veri Cekme Durumu

- Durum: success
- Bulunan mac: 65
- Yeni kaydedilen mac: 0
- Tekrar mac: 65
- Ham havuz toplam mac: 1842
- Rapor: /home/runner/work/futbol-laboratuvari/futbol-laboratuvari/bu-klas-r-i-in-basit/outputs/mackolik_veri_cekme_raporu.md