# Robot Öğrenme Hafızası Raporu

Oluşturma: 25.06.2026 Europe/Istanbul

## Durum

- Öğrenme hafızası altyapısı eklendi.
- İlk gerçek rapor, canlı veri akışı tekrar çalıştığında `scripts/robot-learning-memory.js` tarafından üretilecek.
- Hafıza dosyası: `data/learning-memory.json`
- Script: `scripts/robot-learning-memory.js`

## Öğrenme Mantığı

- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.
- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.
- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.
- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.
