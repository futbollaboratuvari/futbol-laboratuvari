# PRO Robot Kupon Akış Zorunluluğu

Futbol Laboratuvarı'nda Kupon Merkezi, Maç Yorumları ve tamamlanan analiz alanları yalnızca PRO robotun ürettiği gerçek analiz çıktılarıyla beslenmelidir.

## Kesin kural

Her yeni kupon için PRO robot analizi zorunludur.

Kupon üretim sırası şu şekilde olmalıdır:

1. Maç havuzu gerçek kaynaktan gelir.
2. PRO robot her maçı veri katmanlarıyla inceler.
3. PRO robot seçilen maçlar için analiz çıktısı üretir.
4. Kupon Merkezi sadece bu PRO robot çıktısından kart üretir.
5. Maç Yorumları sekmesi sadece bu PRO robot çıktısındaki yorumları aktarır.
6. Maç tamamlandığında sonuç alanı kazandı, kaybetti veya takipte olarak ayrılır.
7. Yeni kupon geldiğinde eski aktif kuponlar geçmişe taşınır veya sonuç bekliyorsa takipte kalır.

## Yasaklar

- Lig adına bakarak kupon uydurulmaz.
- Sadece saate bakarak tahmin üretilmez.
- Veri katmanı olmadan güven yüzdesi yazılmaz.
- Form, kadro, oran, gol eğilimi, maç tipi veya robot skoru yoksa yorum yazılmaz.
- Demo analiz, sahte başarı, eski sabit maç veya manuel uydurma kupon gösterilmez.

## PRO robot çıktısında beklenen alanlar

Her aktif kupon veya maç yorumu için en az şu alanlar beklenir:

```json
{
  "id": "unique-analysis-id",
  "type": "Tekli | 2'li | 3'lü",
  "match": "Ev Sahibi - Deplasman",
  "market": "Önerilen market",
  "confidence_score": "Robot güven skoru",
  "risk_level": "Düşük | Orta | Yüksek",
  "pro_signals": [
    "form verisi",
    "gol eğilimi",
    "oran hareketi",
    "kadro/haber durumu",
    "robot katman skoru"
  ],
  "commentary": "Veri katmanlarına dayalı maç yorumu",
  "status": "takipte | kazandı | kaybetti"
}
```

## Site davranışı

PRO robot çıktısı yoksa:

- Kupon Merkezi: `PRO robot analizi bekleniyor`
- Maç Yorumları: `PRO robot analizi bekleniyor`
- Tamamlanan analizler: `Sonuç verisi bekleniyor`

PRO robot çıktısı varsa:

- Tekli, 2'li ve 3'lü kuponlar otomatik gösterilir.
- Maç Yorumları sekmesine aynı kupon maçlarının yorumları otomatik aktarılır.
- Sonuç verisi gelince kazandı/kaybetti ayrı alanda gösterilir.

Bu dosya proje kuralıdır. Bundan sonra yeni geliştirme yapılırken bu akış bozulmamalıdır.
