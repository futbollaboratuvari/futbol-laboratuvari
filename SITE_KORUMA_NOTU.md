# Site Koruma Notu

Tarih: 2026-06-22

Futbol Laboratuvarı canlı sitesi önceliklidir. Bundan sonraki her işlemde siteye zarar vermemek birinci kuraldır.

Kurallar:

1. Büyük değişiklikler küçük adımlarla yapılacak.
2. Önce kopyala, sonra test et, en son temizle.
3. Canlı siteyi besleyen dosyalar kontrolsüz değiştirilmeyecek.
4. Kritik dosyalar silinmeden önce geri dönüş planı olacak.
5. Private robot geçişi yapılırken public site çalışmaya devam edecek.
6. Emin olunmayan işlem yapılmayacak.
7. Her önemli değişiklikten sonra kontrol edilecek.

Korunacak site dosyaları:

- data/fixtures.json
- data/live-matches.json
- data/daily-coupons.json
- data/robot-analysis.json
- index.html

Riskli dosyalar:

- scripts/robot-exact-scoring.js
- scripts/update-match-archive.js
- scripts/export-high-value-json.js
- scripts/ensure-live-json.js
- .github/workflows/update-fixtures.yml
- data/robot_match_archive.json

Kullanıcı talimatı: Site önemli. Her adım dikkatli yapılacak.
