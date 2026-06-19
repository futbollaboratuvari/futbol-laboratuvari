# API Rate Limit Raporu

## Rapor Bilgisi

ANALIZ_TARIHI: 2026-06-18
DATE_FROM: 2026-06-18
DATE_TO: 2026-06-24
TARANAN_COMPETITION_SAYISI: 13
TOPLAM_MAC: 29

## Lig Bazli Rate Limit Durumu

| Competition | Mac Sayisi | API Response Code | Kalan Istek Hakki | Retry | Bekleme Saniyesi | Durum |
|---|---:|---:|---|---:|---:|---|
| PL | 0 | 200 | 9 | 0 | 6 | ok |
| PD | 0 | 200 | 9 | 0 | 6 | ok |
| SA | 0 | 200 | 8 | 0 | 6 | ok |
| BL1 | 0 | 200 | 7 | 0 | 6 | ok |
| FL1 | 0 | 200 | 6 | 0 | 6 | ok |
| ELC | 0 | 200 | 5 | 0 | 6 | ok |
| PPL | 0 | 200 | 4 | 0 | 6 | ok |
| DED | 0 | 200 | 3 | 0 | 6 | ok |
| BSA | 0 | 200 | 2 | 0 | 6 | ok |
| CLI | 0 | 200 | 1 | 0 | 6 | ok |
| CL | 0 | 200 | 9 | 0 | 6 | ok |
| EC | 0 | 200 | 9 | 0 | 6 | ok |
| WC | 29 | 200 | 8 | 0 | 6 | ok |

## Kuyruk Kurali

- Her API cagrisindan sonra 6 saniye beklenir.
- 429 gelirse `Retry-After` header'i okunur ve ayni istek tekrar denenir.
- Tum competition kodlari bitene kadar kuyruk ilerler.

## Sonuc

Bu calistirmada 429 rate limit hatasi alinmadi. Kuyruk sistemiyle tum competition kodlari tamamlandi.
