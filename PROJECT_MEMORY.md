# Futbol Laboratuvarı - Resmi Proje Hafızası

Bu dosya yeni sohbetlerde ilk okunacak ana hafıza dosyasıdır. Chat hafızası yardımcıdır; resmi kaynak repo içindeki bu dosyalardır.

## Ana hedef

Futbol Laboratuvarı, güncel futbol bülteni, canlı maç bölümü, kupon adayları, Pro 12.2 analiz mantığı ve sonuç takibi olan otomatik maç analiz platformudur.

## Öncelik sırası

1. Futbol Bülteni veri akışı çalışacak.
2. Tüm Bülten sadece başlamayan maçları gösterecek.
3. Canlı Bölüm sadece başlayan/canlı maçları gösterecek.
4. Kuponum paneli korunacak.
5. Analiz Et paneli korunacak.
6. Yeni özellikler ancak bülten sağlamken eklenecek.
7. Çalışan sistem komple yeniden yazılmayacak.

## Resmi başlangıç kuralı

Yeni sohbet veya yeni görevde önce şu dosyalar okunacak:

- PROJECT_MEMORY.md
- WORKING_PROTOCOL.md
- DONT_TOUCH.md
- CURRENT_STATE.md
- LAST_WORK_REPORT.md

Bu dosyalar okunmadan kod değiştirilmez.

## Bülten veri ayrımı

- data/full-bulletin.json içindeki matches: Tüm Bülten alanı
- data/full-bulletin.json içindeki live_matches: Canlı Bölüm
- data/live-matches.json içindeki matches: Canlı Bölüm destek verisi

Tüm Bülten canlı maç göstermemelidir. Canlı maç sadece Canlı Bölümde görünmelidir.

## Kritik repo bilgisi

- Repo: futbollaboratuvari/futbol-laboratuvari
- Branch: main
- Yerel yol: C:\Users\Arif\Documents\GitHub\futbol-laboratuvari

## Çalışma ilkesi

Bir işi yaparken başka çalışan alan bozulmayacak. Özellikle Futbol Bülteni sağlam değilse analiz, öğrenme, API, premium veya tasarım işi yapılmayacak.
