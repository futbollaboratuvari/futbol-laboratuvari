# Lig Bazli Mac Sayilari

## Rapor Bilgisi

ANALIZ_TARIHI: 2026-06-18
DATE_FROM: 2026-06-18
DATE_TO: 2026-07-01
TARANAN_COMPETITION_SAYISI: 13
TOPLAM_MAC: 59

## Mevcut API Tarayicisi Analizi

Mevcut tarayici su competition kodlarini kullaniyor:

`PL, PD, SA, BL1, FL1, ELC, PPL, DED, BSA, CLI, CL, EC, WC`

football-data.org `/competitions` yaniti da bu API anahtariyla ayni 13 competition kodunu dondurdu. Bu nedenle mevcut erisilebilir competition listesinde eksik kalan buyuk lig gorunmedi.

API competition listesinde gorunmeyen, bu nedenle taranamayan buyuk lig/kupa adaylari:

- MLS
- Turkiye Super Lig
- UEFA Europa League
- UEFA Conference League
- AFC Champions League

Bu ligler football-data.org hesabinin donen `/competitions` listesinde yer almadigi icin bu taramada kullanilamadi.

## Competition Bazli Mac Sayilari

| Competition Kodu | Lig Adi | Bulunan Mac Sayisi | Ilk Mac Tarihi | Son Mac Tarihi |
|---|---|---:|---|---|
| PL | Premier League | 0 | - | - |
| PD | Primera Division | 0 | - | - |
| SA | Serie A | 0 | - | - |
| BL1 | Bundesliga | 0 | - | - |
| FL1 | Ligue 1 | 0 | - | - |
| ELC | Championship | 0 | - | - |
| PPL | Primeira Liga | 0 | - | - |
| DED | Eredivisie | 0 | - | - |
| BSA | Campeonato Brasileiro Serie A | 0 | - | - |
| CLI | Copa Libertadores | 0 | - | - |
| CL | UEFA Champions League | 0 | - | - |
| EC | European Championship | 0 | - | - |
| WC | FIFA World Cup | 59 | 2026-06-18 | 2026-07-02 |

## En Cok Mac Ureten Ilk 10 Competition

| Sira | Competition Kodu | Lig Adi | Bulunan Mac Sayisi | Ilk Mac Tarihi | Son Mac Tarihi |
|---:|---|---|---:|---|---|
| 1 | WC | FIFA World Cup | 59 | 2026-06-18 | 2026-07-02 |
| 2 | PL | Premier League | 0 | - | - |
| 3 | PD | Primera Division | 0 | - | - |
| 4 | SA | Serie A | 0 | - | - |
| 5 | BL1 | Bundesliga | 0 | - | - |
| 6 | FL1 | Ligue 1 | 0 | - | - |
| 7 | ELC | Championship | 0 | - | - |
| 8 | PPL | Primeira Liga | 0 | - | - |
| 9 | DED | Eredivisie | 0 | - | - |
| 10 | BSA | Campeonato Brasileiro Serie A | 0 | - | - |

## Notlar

- Tarama kuyruk sistemiyle yapildi.
- Her API cagrisindan sonra 6 saniye beklendi.
- 14 gunluk aralik icin `dateFrom=2026-06-18` ve `dateTo=2026-07-01` kullanildi.
- API yanitinda WC icin son mac tarihi UTC alaninda 2026-07-02 olarak gorundu.
- Bu API ucretsiz planda sinirli mac donduruyor.
