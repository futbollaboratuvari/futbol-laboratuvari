# Basari Yuzdesi Raporu

## Rapor Bilgisi

OLUSTURMA_ZAMANI: 2026-06-22T18:32:54.642526+00:00
TOPLAM_TAHMIN: 15
SONUCLANAN_TAHMIN: 0
BEKLEYEN_TAHMIN: 15
VOID_TAHMIN: 0
GENEL_BASARI_ORANI: -

## Durum

Henuz sonuc dogrulanmis tahmin yok. Bu nedenle basari yuzdesi hesaplanmadi.

Faz 4'te mac sonuclari API'den tekrar cekilecek, bekleyen tahminler mac skoruyla eslestirilecek ve market bazli basari oranlari otomatik guncellenecek.

## Market Bazli Basari

| Market | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| KG_VAR | 0 | 0 | 6 | 0 | - |
| UST_25 | 0 | 0 | 9 | 0 | - |

## Tahmin Turu Bazli Basari

| Tahmin Turu | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| KG_VAR | 0 | 0 | 6 | 0 | - |
| UST_25 | 0 | 0 | 9 | 0 | - |

## Lig Bazli Basari

| Lig | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| Premier League | 0 | 0 | 15 | 0 | - |

## Confidence Bazli Basari

| Confidence | Won | Lost | Pending | Void | Basari |
|---|---:|---:|---:|---:|---:|
| low | 0 | 0 | 15 | 0 | - |

## Faz 5 Notu

- Tahmin gecmisi `data/tahmin_gecmisi.json` dosyasinda tutulacak.
- Her tahmin once `pending` olarak kaydedilecek.
- Mac sonucu kesinlesince `won`, `lost` veya `void` durumuna alinacak.
- Genel, market bazli, lig bazli ve confidence bazli basari oranlari bu rapordan izlenecek.
- KG Var, Ust 2.5, MS1 ve Cifte Sans marketleri ayri takip edilecek.