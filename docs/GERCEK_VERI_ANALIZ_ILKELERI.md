# Futbol Laboratuvarı Gerçek Veri Analiz İlkeleri

Bu proje demo kupon sitesi değil, gerçek veriye dayalı futbol analiz platformudur.

## Temel kurallar

1. Uydurma maç, uydurma oran, uydurma skor, uydurma sonuç veya sahte kupon gösterilmez.
2. Veri kaynağı açık olmalıdır. Maç listesi, canlı veri, haftalık Spor Toto bülteni ve analiz çıktıları hangi kaynaktan üretildiyse dosyada belirtilir.
3. Güncel veri yoksa eski veri gösterilmez. Ekranda açık şekilde "canlı veri bekleniyor" veya "analiz bekleniyor" mesajı gösterilir.
4. Kupon Merkezi robot tarafından analiz edilir; ancak hiçbir kart kesin sonuç garantisi vermez.
5. Tamamlanan analizler aktif kuponlardan ayrılır. Sonuç bilgisi geldiğinde kazandı, kaybetti veya takipte şeklinde ayrı alanda gösterilir.
6. Robot her çalıştığında veri dosyalarını günceller; değişiklik varsa GitHub Actions otomatik commit ve push yapar.
7. Site kullanıcıya güven vermeli: eski sabit örnekler, demo maçlar ve yanıltıcı başarı ifadeleri kullanılmaz.
8. Analiz geliştirmeleri form, lig karakteri, saat, maç tipi, takım bilgisi, skor/sonuç geçmişi ve oran hareketi gibi gerçek sinyaller üzerine kurulmalıdır.

## Platform mantığı

- `data/fixtures.json`: Güncel maç havuzu.
- `data/spor_toto_bulteni.json`: Haftalık Spor Toto bülteni.
- `data/ham_mac_havuzu.json`: Robotun ham veri görünümü.
- `data/analiz_sonuclari.json`: Aktif ve tamamlanan analizlerin geçmişi.
- `outputs/bugunun_en_guclu_maclari.md`: Kupon Merkezi ve güçlü maç raporu.

Bu dosyalar boşsa veya güncel değilse site tahmin üretmiş gibi davranmaz. Önce veri, sonra analiz, sonra sonuç takibi yapılır.
