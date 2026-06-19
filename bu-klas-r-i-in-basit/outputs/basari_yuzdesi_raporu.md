# Basari Yuzdesi Raporu

## Rapor Bilgisi

TOPLAM_TAHMIN: 5
SONUCLANAN_TAHMIN: 0
BEKLEYEN_TAHMIN: 5
VOID_TAHMIN: 0
GENEL_BASARI_ORANI: -

## Durum

Demo modda uretilen 5 tahmin `pending` durumunda kaydedildi. Henuz sonuc dogrulanmis tahmin olmadigi icin basari yuzdesi hesaplanmadi.

## Market Bazli Basari

| Market | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| KG_VAR | 0 | 0 | 2 | 0 | - |
| UST_25 | 0 | 0 | 3 | 0 | - |

## Tahmin Turu Bazli Basari

| Tahmin Turu | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| KG_VAR | 0 | 0 | 2 | 0 | - |
| UST_25 | 0 | 0 | 3 | 0 | - |

## Lig Bazli Basari

| Lig | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| Premier League | 0 | 0 | 5 | 0 | - |

## Confidence Bazli Basari

| Confidence | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| low | 0 | 0 | 5 | 0 | - |

## Faz 5 Notu

- Tahmin gecmisi `data/tahmin_gecmisi.json` dosyasinda tutulur.
- Her tahmin once `pending` olarak kaydedilir.
- Mac sonucu kesinlesince `won`, `lost` veya `void` durumuna alinir.
- KG Var, Ust 2.5, MS1 ve Cifte Sans marketleri ayri takip edilir.
