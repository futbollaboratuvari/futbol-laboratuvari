# Canli Sayfa / Repo Fark Kanitli Rapor

## Tarih

2026-06-27

## Asama

Asama 3.7 — Canli sayfa ile repo main farkinin kanitlanmasi

## Amac

Tek bulten kodunu yeniden kurcalamadan once, canli GitHub Pages sayfasinin repo main icerigini yansitip yansitmadigini kanitlamak.

## Repo Main Bulgusu

Repo main tarafindaki `index.html` guncel hero metnini tasiyor:

- `Maçlar | Gerekçeli Yorumlar | Kupon Adayları`
- `Maçı sadece skordan değil, oyunun içinden oku`

## Canli GitHub Pages Bulgusu

Canli GitHub Pages sayfasinda eski hero metinleri gorunuyor:

- `Maçlar | Tahminler | Kuponlar`
- `Profesyonel spor kupon ve maç analizi merkezi`

## Net Sonuc

Canli sayfa ile repo main ayni icerigi gostermiyor.

Bu nedenle bulten kodu repo tarafinda duzeltilmis olsa bile canli sitede eski deploy gorunmeye devam edebilir.

## Yapilmayanlar

- Yeni bulten eklenmedi.
- Yeni widget eklenmedi.
- Yeni bridge eklenmedi.
- `daily-matches-widget.js` degistirilmedi.
- `index.html` degistirilmedi.

## Karar

Siradaki teknik hedef bulten kodunu buyutmek degil, GitHub Pages deploy kaynagini/yansimasini duzeltmektir.

## Kontrol Komutu / Manuel Kontrol

Tarayicida Ctrl+F5 sonrasi hala eski metin gorunuyorsa sorun cache degil, deploy/yansima sorunudur.

Beklenen yeni metin:

- `Maçlar | Gerekçeli Yorumlar | Kupon Adayları`

Gorunen eski metin:

- `Maçlar | Tahminler | Kuponlar`
