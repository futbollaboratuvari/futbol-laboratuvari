# Basari Yuzdesi Raporu

## Rapor Bilgisi

OLUSTURMA_ZAMANI: 2026-07-13T21:05:30.998468+00:00
TOPLAM_TAHMIN: 120
SONUCLANAN_TAHMIN: 0
BEKLEYEN_TAHMIN: 120
VOID_TAHMIN: 0
GENEL_BASARI_ORANI: -

## Durum

Henuz sonuc dogrulanmis tahmin yok. Bu nedenle basari yuzdesi hesaplanmadi.

Faz 4'te mac sonuclari API'den tekrar cekilecek, bekleyen tahminler mac skoruyla eslestirilecek ve market bazli basari oranlari otomatik guncellenecek.

## Market Bazli Basari

| Market | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| KG_VAR | 0 | 0 | 48 | 0 | - |
| UST_25 | 0 | 0 | 72 | 0 | - |

## Tahmin Turu Bazli Basari

| Tahmin Turu | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| KG_VAR | 0 | 0 | 48 | 0 | - |
| UST_25 | 0 | 0 | 72 | 0 | - |

## Lig Bazli Basari

| Lig | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| Premier League | 0 | 0 | 120 | 0 | - |

## Confidence Bazli Basari

| Confidence | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| low | 0 | 0 | 120 | 0 | - |

## Faz 5 Notu

- Tahmin gecmisi `data/tahmin_gecmisi.json` dosyasinda tutulacak.
- Her tahmin once `pending` olarak kaydedilecek.
- Mac sonucu kesinlesince `won`, `lost` veya `void` durumuna alinacak.
- Genel, market bazli, lig bazli ve confidence bazli basari oranlari bu rapordan izlenecek.
- KG Var, Ust 2.5, MS1 ve Cifte Sans marketleri ayri takip edilecek.