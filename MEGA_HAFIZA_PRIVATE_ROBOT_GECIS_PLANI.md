# MEGA HAFIZA NOTU — Private Robot / Public Site Güvenli Geçiş Planı

Tarih: 2026-06-22

## Ana karar

Futbol Laboratuvarı'nda robotun gerçek beyni public sitede kalmayacak. Robotun analiz motoru, hafıza dosyası, arşiv sistemi, API bağlantıları ve özel analiz mantığı ileride özel/private repo veya backend tarafına taşınacak.

## Amaç

- Public site sadece vitrin olacak.
- Private robot gerçek beyin olacak.
- Siteye zarar vermeden geçiş yapılacak.
- Public repoda sadece ziyaretçinin görmesi gereken temiz JSON sonuçları kalacak.
- Robotun analiz mantığı, geçmiş hafızası ve özel kuralları dışarıdan görünmeyecek.

## Güvenli geçiş sırası

1. Önce private repo açılacak.
   - Önerilen ad: `futbol-laboratuvari-robot`
   - Repo mutlaka Private seçilecek.

2. Public repodaki robot beyni hemen silinmeyecek.
   - Önce private repoya kopyalanacak.
   - Site çalışmaya devam edecek.

3. Private repoya taşınacak ana dosyalar:
   - `scripts/robot-exact-scoring.js`
   - `scripts/update-match-archive.js`
   - `data/robot_match_archive.json`
   - `data/ham_mac_havuzu.json`
   - robot logları
   - API anahtarı kullanan dosyalar
   - özel analiz kuralları
   - hafıza ve öğrenme dosyaları

4. Public sitede kalacak temiz çıktı dosyaları:
   - `data/fixtures.json`
   - `data/live-matches.json`
   - `data/daily-coupons.json`
   - `data/robot-analysis.json`

5. Private robot çalışınca sadece temiz sonuçları public site reposuna gönderecek.
   - Site bu JSON dosyalarını okumaya devam edecek.
   - Ziyaretçi tarafında hiçbir bozulma olmamalı.

6. Private robotun doğru çalıştığı test edilmeden public repodan beyin dosyaları kaldırılmayacak.

7. Test başarılı olursa public repodan gizli kalması gereken beyin dosyaları kaldırılacak.

## Önemli kural

Asla direkt silme veya taşıma yapılmayacak. Önce kopyala, test et, sonra public repodan temizle.

## Canlı siteyi koruma kuralı

Canlı site entegrasyonu bozulmamalı. Public site şu temiz dosyalardan veri almaya devam etmeli:

- `data/fixtures.json`
- `data/live-matches.json`
- `data/daily-coupons.json`
- `data/robot-analysis.json`

## Sonraki adım

Kullanıcı GitHub'da private repo açacak:

`futbol-laboratuvari-robot`

Repo açıldıktan sonra dosya taşıma işlemi kademeli yapılacak.
