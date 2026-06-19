(() => {
  const replacements = new Map([
    ["PRO robot tekli analiz verisi bekleniyor. Yüzeysel/uydurma analiz gösterilmez.", "Tekli analiz hazırlanıyor."],
    ["PRO robot 2'li analiz verisi bekleniyor. Yüzeysel/uydurma analiz gösterilmez.", "2'li analiz hazırlanıyor."],
    ["PRO robot 3'lü analiz verisi bekleniyor. Yüzeysel/uydurma analiz gösterilmez.", "3'lü analiz hazırlanıyor."],
    ["Tekli analiz için güncel veri bekleniyor. Veri olmadan seçim gösterilmez.", "Tekli analiz hazırlanıyor."],
    ["2'li analiz için güncel veri bekleniyor. Veri olmadan seçim gösterilmez.", "2'li analiz hazırlanıyor."],
    ["3'lü analiz için güncel veri bekleniyor. Veri olmadan seçim gösterilmez.", "3'lü analiz hazırlanıyor."],
    ["Maç yorumları için PRO robot analizi bekleniyor. Form, istatistik, oran, haber/durum veya robot katmanı olmadan yorum üretilmez.", "Maç yorumları hazırlanıyor."],
    ["Maç yorumları için güncel analiz bekleniyor. Form, istatistik, oran ve maç bilgisi olmadan yorum gösterilmez.", "Maç yorumları hazırlanıyor."],
    ["Tamamlanan PRO analiz bekleniyor. Sonuç verisi gelince kazandı/kaybetti burada gösterilecek.", "Sonuçlar güncellenecek."],
    ["Tamamlanan analiz bekleniyor. Sonuç verisi gelince kazandı/kaybetti burada gösterilecek.", "Sonuçlar güncellenecek."],
    ["PRO robot analizi", "Güncel analiz"],
    ["PRO analiz bekleniyor", "Analiz bekleniyor"],
    ["PRO Robot", "Seçili Maç"],
    ["Market", "Seçenek"],
    ["market", "seçenek"],
  ]);

  const cleanTextNode = (node) => {
    let value = node.nodeValue;
    replacements.forEach((to, from) => {
      value = value.split(from).join(to);
    });
    if (value !== node.nodeValue) node.nodeValue = value;
  };

  const walk = (root = document.body) => {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(cleanTextNode);
  };

  const run = () => walk(document.body);

  window.addEventListener("load", () => {
    run();
    setTimeout(run, 800);
    setTimeout(run, 1800);
    setTimeout(run, 3500);
  });
})();
