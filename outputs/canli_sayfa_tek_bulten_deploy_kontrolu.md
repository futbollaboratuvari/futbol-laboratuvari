# Canli Sayfa Tek Bulten Deploy Kontrolu

## Tarih

2026-06-27

## Amac

Tek bulten guncellemelerinin repo tarafinda hazir oldugunu ve canli GitHub Pages gorunumunun bu guncellemeyi yansitip yansitmadigini kontrol etmek.

## Kontrol 1 — Repo tarafindaki mevcut index

Repo `index.html` dosyasinda guncel hero metni su yapiya sahiptir:

- `Maçlar | Gerekçeli Yorumlar | Kupon Adayları`
- `Maçı sadece skordan değil, oyunun içinden oku`

## Kontrol 2 — Canli GitHub Pages HTML gorunumu

Canli GitHub Pages HTML gorunumunde eski metinler gorunuyor:

- `Maçlar | Tahminler | Kuponlar`
- `Profesyonel spor kupon ve maç analizi merkezi`

## Sonuc

Canli GitHub Pages HTML gorunumu repo main tarafindaki son index icerigini henuz yansitmiyor gibi gorunuyor.

Bu nedenle tek bulten kodu repo tarafinda hazir olsa bile canli sayfada gorunmeyebilir.

## Risk

- Kullanici Ctrl+F5 yapsa bile, GitHub Pages eski deploy'u sunuyorsa yeni tek bulten davranisi gorunmeyebilir.
- Bu sorun bulten kodunun mantigindan cok deploy/yansima sorunu olabilir.

## Karar

Siradaki is bulten koduna yeni widget eklemek degil, canli deploy kaynagini netlestirmektir.

## Kural

- Yeni bulten eklenmeyecek.
- Yeni bridge eklenmeyecek.
- Mevcut `daily-matches-widget.js` tek motor kalacak.
- Once canli deploy'un repo main ile ayni icerigi sunmasi saglanacak.
