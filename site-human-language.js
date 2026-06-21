(() => {
  const replacements = [
    ["Canlı Veri Görünümü", "Güncel Maç Merkezi"],
    ["Canlı Veri Panelleri", "Güncel Maç Panelleri"],
    ["Robot veri akışı", "Güncel maç değerlendirmeleri"],
    ["Robot çıktıları, ham veri havuzu ve tahmin geçmişi GitHub üzerinde üretilen JSON/Markdown dosyalarından okunur. Eski sabit demo veriler gösterilmez.", "Günün maçları, kupon listeleri ve geçmiş değerlendirmeler güncel kayıtlarla hazırlanır. Eski ve yanıltıcı bilgiler gösterilmez."],
    ["Robotun ürettiği dengeli, yüksek oranlı ve riskli laboratuvar kuponları JSON verisiyle listelenir.", "Günün öne çıkan dengeli, yüksek oranlı ve riskli kupon seçenekleri sade şekilde listelenir."],
    ["Robotun Gerekçesi:", "Değerlendirme Notu:"],
    ["Robot gerekçesi bekleniyor.", "Değerlendirme notu hazırlanıyor."],
    ["Robot açıklaması bekleniyor.", "Açıklama hazırlanıyor."],
    ["Robot her maçı ayrı ayrı analiz edip kupon kartı oluşturacak.", "Her maç ayrı ayrı değerlendirilip kupon kartı hazırlanacak."],
    ["Günün seçimi canlı robot verisi geldikten sonra üretilecek.", "Günün seçimi güncel maç listesi hazırlandığında gösterilecek."],
    ["Canlı veri bekleniyor.", "Güncel liste hazırlanıyor."],
    ["Canlı veri bekleniyor", "Güncel liste hazırlanıyor"],
    ["Canlı veri", "Güncel liste"],
    ["Aktif Veri Kaynağı", "Güncel Liste"],
    ["Ham Maç Havuzu", "Maç Listesi"],
    ["Ham Veri Havuzu", "Maç Listesi"],
    ["Tahmin Geçmişi", "Geçmiş Değerlendirmeler"],
    ["API / Veri Kaynağı Durumu", "Güncel Durum"],
    ["Veri İzleme", "Maç Takibi"],
    ["Kartlar robot raporundan üretilir. Veri yoksa sistem eski maç göstermeden canlı veri bekler.", "Kartlar güncel maç değerlendirmelerine göre hazırlanır. Güncel liste yoksa eski maç gösterilmez."],
    ["JSON", "güncel kayıt"],
    ["API", "kaynak"],
    ["robot", "analiz sistemi"],
    ["Robot", "Analiz sistemi"],
    ["engine", "sistem"],
    ["Engine", "Sistem"]
  ];

  const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"]);

  const humanizeText = (text) => replacements.reduce((value, [from, to]) => value.split(from).join(to), text);

  const humanizeNode = (node) => {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const next = humanizeText(node.nodeValue || "");
      if (next !== node.nodeValue) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || skipTags.has(node.tagName)) return;
    node.childNodes.forEach(humanizeNode);
  };

  const humanizeAttributes = () => {
    document.querySelectorAll("input[placeholder], button[aria-label], a[aria-label], section[aria-label]").forEach((el) => {
      ["placeholder", "aria-label", "title"].forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        const value = el.getAttribute(attr);
        const next = humanizeText(value);
        if (next !== value) el.setAttribute(attr, next);
      });
    });
  };

  const run = () => {
    humanizeNode(document.body);
    humanizeAttributes();
  };

  run();
  document.addEventListener("DOMContentLoaded", run, { once: true });
  window.addEventListener("load", () => {
    run();
    setTimeout(run, 300);
    setTimeout(run, 1000);
    setTimeout(run, 2500);
  }, { once: true });

  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(humanizeNode);
        if (mutation.type === "characterData") humanizeNode(mutation.target);
      });
      humanizeAttributes();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }
})();
