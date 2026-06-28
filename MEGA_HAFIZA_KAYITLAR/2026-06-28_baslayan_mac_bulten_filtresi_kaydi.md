# 2026-06-28 - Başlayan Maçların Futbol Bülteni'nden Gizlenmesi

## Ana istek

Kullanıcının net isteği:

> Maç tarihi bugünse ve maç saati <= şu anki Türkiye saatiyse o maç Futbol Bülteni'nde gösterilmeyecek.

Kapsam sadece budur:

- Futbol Bülteni sadece başlamamış maçları gösterecek.
- Başlayan / canlı / biten / saati geçmiş maçlar Futbol Bülteni'nde görünmeyecek.
- Canlı Bölüm ayrı kalabilir.
- Domain, CNAME, GitHub Pages, workflow, branch, veri JSON dosyaları ve yeni sistem dosyalarına dokunulmayacak.

## Video gözlemi

Kullanıcı video gönderdi: `Kayıt 2026-06-28 031957.mp4`.

Videoda saat yaklaşık 03:19 iken Futbol Bülteni'nde başlamış görünen saatler vardı:

- 02:00
- 02:30
- 03:00

Kullanıcının istediği: bu saatler artık bültende görünmesin.

## Yapılan doğru teknik işlem

Sadece şu dosya değiştirildi:

`daily-matches-widget.js`

Commit:

`ce93a7afa4467c1177370a32fca205289b3ca1ca`

Commit mesajı:

`Hide started matches from bulletin only`

Eklenen mantık:

- `trNow()` fonksiyonu Türkiye saatini `Europe/Istanbul` ile alır.
- `isUpcomingBulletin(m)` fonksiyonu şu kuralı uygular:
  - maç tarihi yarın/gelecekse göster,
  - maç tarihi geçmişse gösterme,
  - maç tarihi bugünse sadece `maç saati > şu anki Türkiye dakikası` ise göster.
- Bülten filtresi şu hale getirildi:

```js
app.bulletin = sortBulletin(unique(scheduled.filter((m) => isActiveBulletin(m) && !isLive(m) && isUpcomingBulletin(m))));
```

## Test sonucu

Kod mantığına göre:

- Bugün 02:00 -> bültende görünmez
- Bugün 02:30 -> bültende görünmez
- Bugün 03:00 -> bültende görünmez
- Bugün 03:19 -> bültende görünmez
- Bugün 08:00 -> bültende görünür
- Yarın 00:00 -> bültende görünür
- Dün 23:00 -> bültende görünmez

## Önemli çalışma uyarısı

Bu sohbet sırasında kullanıcı çok net şekilde şunu söyledi:

- Sadece istenen basit işlemi yap.
- Başka dosyaya dokunma.
- Branch reset yapma.
- Workflow ekleme.
- Domain/CNAME/GitHub Pages ayarlarıyla oynama.
- Yeni dosya ekleme, sadece açıkça istenirse hafıza kaydı oluştur.
- Önce kontrol et, sonra net rapor ver.

## Daha önce yapılan hata ve bundan sonraki kural

Bu sohbette asıl hata: kullanıcı “geri al” dediğinde `main` ve `gh-pages` branch'leri fazla geniş şekilde eski commit'e force resetlendi. Bu kullanıcıyı çok sinirlendirdi.

Bundan sonra kesin kural:

1. Kullanıcı tek dosya isterse sadece o dosyaya dokun.
2. Branch reset asla yapma.
3. `main`, `gh-pages`, Pages deploy, DNS, CNAME ve workflow işlemleri ancak kullanıcı açıkça isterse yapılacak.
4. Kod değişikliği gerekiyorsa önce hangi dosya ve hangi satır mantığı değişecek söylenecek.
5. Test istenirse önce repo kontrolü ve canlı site kontrolü yapılacak; yazma işlemi yapılmayacak.

## Son GitHub kontrol raporu

- Repo: `futbollaboratuvari/futbol-laboratuvari`
- Ana branch: `main`
- GitHub Pages linki: `https://futbollaboratuvari.github.io/futbol-laboratuvari/`
- CNAME dosyası içerik: `www.futbollaboratuuvari.org`
- `daily-matches-widget.js` içinde başlayan/geçen maçları Futbol Bülteni'nden çıkarma kuralı mevcut.

## Son durum

Sohbetin sonunda kayıt istenmiştir. Bu dosya, yeni sohbette devam ederken önce okunmalıdır.
