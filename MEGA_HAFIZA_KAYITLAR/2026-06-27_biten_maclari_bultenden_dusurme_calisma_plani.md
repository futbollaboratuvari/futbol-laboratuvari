# Biten Maçları Bültenden Düşürme Çalışma Planı

Tarih: 2026-06-27
Durum: Uygulama yapılmadı. Kullanıcı onayı bekleniyor.
Amaç: Canlı sitede oynanmış/biten karşılaşmaların yeni bülten saatini beklemeden bülten listesinden düşmesini sağlamak.

## Net Teşhis

Mevcut sistem maçın bittiğini anlayabiliyor fakat bülten üretiminde ve site gösteriminde finished maçları listeden çıkarmıyor.

Kanıt özeti:

1. scripts/update-fixtures.js içinde LIVE_WINDOW_MINUTES = 130 tanımlı.
2. Aynı scriptte statusFromTime fonksiyonu maçları scheduled/live/finished olarak işaretliyor.
3. toSporTotoBulletin fonksiyonu fixtures.slice(0, 15) ile ilk 15 maçı alıyor; finished maçları dışarıda bırakan filtre yok.
4. scripts/two-day-bulletin-window.js sadece bugün/yarın tarihine bakıyor; finished maçları dışarıda bırakmıyor.
5. spor-toto-dashboard.js data/spor_toto_bulteni.json dosyasını okuyor ve payload.matches listesini doğrudan ekrana basıyor; site tarafında finished gizleme filtresi yok.

## Dosya Bağlantı Haritası

Ana veri zinciri:

1. .github/workflows/stage-1-bulletin.yml
   - node scripts/update-fixtures.js
   - node scripts/stage-1-bulletin-check.js
   - node scripts/two-day-bulletin-window.js
   - data ve outputs commit/push

2. scripts/update-fixtures.js
   - Maçkolik İddaa Programı kaynağını okur.
   - data/fixtures.json üretir.
   - data/ham_mac_havuzu.json üretir.
   - data/tahmin_gecmisi.json üretir.
   - data/spor_toto_bulteni.json üretir.
   - outputs/bugunun_en_guclu_maclari.md üretir.
   - outputs/mackolik_veri_cekme_raporu.md üretir.
   - outputs/basari_yuzdesi_raporu.md üretir.

3. scripts/two-day-bulletin-window.js
   - data/fixtures.json okur.
   - data/two-day-bulletin.json üretir.
   - outputs/two-day-bulletin-report.md üretir.

4. spor-toto-dashboard.js
   - ./data/spor_toto_bulteni.json okur.
   - Canlı sitedeki Spor Toto / bülten paneline matches listesini basar.

## Uygulama Planı

### Aşama 1 - Ortak aktif maç filtresi oluşturulacak

scripts/update-fixtures.js içine küçük ve güvenli bir yardımcı fonksiyon eklenecek:

- Aktif kabul edilecek durumlar:
  - scheduled
  - live
  - boş/unknown ise varsayılan scheduled gibi davranacak

- Bültenden çıkarılacak durumlar:
  - finished
  - cancelled
  - postponed

Önerilen mantık:

const isActiveBulletinMatch = (fixture) => {
  const status = String(fixture.status || fixture.liveStatus || "scheduled").toLowerCase();
  return !["finished", "cancelled", "postponed"].includes(status);
};

### Aşama 2 - Spor Toto bülteni filtrelenecek

toSporTotoBulletin(fixtures, source) içinde doğrudan fixtures.slice(0, 15) kullanımı yerine aktif maç listesi kullanılacak.

Hedef:
- Biten maç data/spor_toto_bulteni.json içine girmeyecek.
- match_count aktif maç sayısına göre hesaplanacak.
- İlk 15 aktif maç gösterilecek.

### Aşama 3 - İki günlük bülten de aynı mantığa bağlanacak

scripts/two-day-bulletin-window.js içinde tarih filtresine ek olarak status filtresi eklenecek.

Hedef:
- Bugün ve yarın içinden sadece aktif maçlar data/two-day-bulletin.json içine yazılacak.
- finished/cancelled/postponed olanlar listeden düşecek.

### Aşama 4 - Site tarafı ikinci güvenlik filtresi

spor-toto-dashboard.js içinde payload.matches doğrudan basılmadan önce aynı güvenlik filtresi uygulanacak.

Hedef:
- Eğer eski JSON cache veya eski veri gelirse bile site biten maçı göstermesin.
- Backend tarafı filtre + frontend tarafı güvenlik filtresi birlikte çalışsın.

### Aşama 5 - Rapor alanları netleştirilecek

İsteğe bağlı ama önerilen güvenli ek:

data/spor_toto_bulteni.json içine şu alanlar eklenebilir:

- total_source_matches
- active_match_count
- removed_finished_count
- removed_statuses

Bu alanlar ziyaretçiye gösterilmek zorunda değil; kontrol için kullanılabilir.

### Aşama 6 - Kırılma riski kontrolü

Değişiklikten sonra kontrol edilecek dosyalar:

- data/fixtures.json
- data/spor_toto_bulteni.json
- data/two-day-bulletin.json
- outputs/two-day-bulletin-report.md
- outputs/bugunun_en_guclu_maclari.md

Kontrol kuralları:

1. fixtures.json silinmeyecek; ham ana veri kalacak.
2. Bülten çıktıları sadece aktif maçları gösterecek.
3. Site tarafında matches boşsa mevcut "bülten bekleniyor" mesajı korunacak.
4. Canlı veri, fixture ve kart workflowları değiştirilmeden kalacak.
5. Stage 1 Bulletin Flow çalışma zinciri bozulmayacak.

## Onay Bekleyen Nihai Uygulama

Kullanıcı onayı gelirse yapılacak dosya değişiklikleri:

1. scripts/update-fixtures.js
   - isActiveBulletinMatch fonksiyonu eklenecek.
   - toSporTotoBulletin aktif maç filtresine bağlanacak.
   - İsteğe bağlı sayaç alanları eklenecek.

2. scripts/two-day-bulletin-window.js
   - Aynı active/finished filtresi eklenecek.

3. spor-toto-dashboard.js
   - Site gösterimi için frontend güvenlik filtresi eklenecek.

4. Mega hafıza kayıt dosyası oluşturulacak.

## Beklenen Sonuç

- Maç saati geçip sistem status değerini finished yaptığında maç bülten çıktısına alınmayacak.
- Yeni bülten saatini beklemeden, 15 dakikalık canlı veri akışları çalıştıkça biten maçlar sitede görünmemeye başlayacak.
- Fixtures ana veri havuzu korunacak; sadece bülten ve site görünümü temizlenecek.

## Önemli Not

Bu plan kaydı dışında uygulama yapılmadı. Kod dosyaları değiştirilmedi. Uygulama için kullanıcı onayı bekleniyor.
