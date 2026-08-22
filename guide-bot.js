(() => {
  if (window.__flGuideBotReady) return;
  window.__flGuideBotReady = true;

  const normalize = (value) => String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const intents = [
    {
      id: "start",
      keys: ["siteyi nasil kullanirim", "nasil kullanilir", "ne yapacagim", "nereden baslayayim", "yardim", "rehber"],
      answer: "Futbol Laboratuvarı'nı 3 adımda kullanabilirsin: önce Bugünün Maçları'na bak, sonra Kupon Merkezi'ndeki gerekçeli adayları incele. Daha detaylı çalışma istiyorsan Üyelik bölümünden deneme veya paket seçip Özel Analiz'i aç.",
      actions: [["Bugünün Maçları", "#daily-matches-widget"], ["Kupon Merkezi", "#robot-analizleri"], ["Üyelik", "#membership-payment-panel"]],
    },
    {
      id: "matches",
      keys: ["bugunun maclari", "maclar nerede", "mac listesi", "fikstur", "bugun hangi maclar", "canli mac"],
      answer: "Bugünün güncel maçlarını Bugünün Maçları bölümünde görebilirsin. Başlamış maçlar normal bültenden ayrılır; güncel liste otomatik yenilenir.",
      actions: [["Maçları Aç", "#daily-matches-widget"]],
    },
    {
      id: "coupon",
      keys: ["kupon merkezi", "kupon nasil", "dengeli kupon", "yuksek oran", "riskli kupon", "tahminler nerede", "oneriler"],
      answer: "Kupon Merkezi; maçları oran, risk, oyun dengesi ve güncel verilere göre gruplar. Dengeli, yüksek oranlı ve riskli listeler kesin sonuç garantisi değildir; gerekçeli değerlendirme olarak kullanılmalıdır.",
      actions: [["Kupon Merkezini Aç", "#robot-analizleri"]],
    },
    {
      id: "analysis",
      keys: ["ozel analiz", "analiz nasil alinir", "mac analizi", "analiz paneli", "analiz hakki", "ozel mac"],
      answer: "Özel Analiz için aktif deneme veya üyelik gerekir. Paneli açtıktan sonra maçını seç, istersen Analiz Sistemi Önerisi'ni istersen kendi marketini seç ve Özel Analizi Başlat'a bas. Her başarılı işlem paketindeki analiz hakkından 1 adet kullanır.",
      actions: [["Özel Analizi Aç", "#premium-analysis-panel"], ["Üyelik Paketleri", "#membership-payment-panel"]],
    },
    {
      id: "membership",
      keys: ["uyelik", "paket", "gold", "diamond", "premium", "fiyat", "kac tl", "paketler"],
      answer: "Üç paket bulunuyor: Gold 149 TL / 3 gün ve 10 analiz hakkı; Diamond 299 TL / 14 gün ve 40 analiz hakkı; Premium 499 TL / 28 gün ve 120 analiz hakkı. Satın alma Havale / EFT / FAST ile yapılır.",
      actions: [["Paketleri Gör", "#membership-payment-panel"]],
    },
    {
      id: "trial",
      keys: ["ucretsiz deneme", "1 gun", "deneme", "bedava", "trial"],
      answer: "1 günlük ücretsiz deneme sunucu tarafından kontrol edilir. Bilgilerini doldurup paket kartındaki 1 Gün Ücretsiz Dene düğmesine bas. Deneme bir kez kullanılabilir; Gold 2, Diamond 3, Premium 5 özel analiz hakkı verir.",
      actions: [["Denemeyi Aç", "#membership-payment-panel"]],
    },
    {
      id: "payment",
      keys: ["odeme", "havale", "eft", "fast", "iban", "para gonder", "nasil odeyecegim", "satın al", "satin al"],
      answer: "Ödeme için önce Üyelik bölümünde bilgilerini ve paketini seçip Ödeme Talebi Oluştur'a bas. Sistem sana IBAN, kesin tutar ve FL-... ödeme kodunu gösterir. Transfer açıklamasına yalnız verilen FL kodunu yaz; kod oluşmadan para gönderme.",
      actions: [["Ödeme Bölümünü Aç", "#membership-payment-panel"]],
    },
    {
      id: "paid",
      keys: ["odemeyi yaptim", "para gonderdim", "odeme yaptim", "onay ne zaman", "banka kontrolu", "odeme bekliyor"],
      answer: "Transferi yaptıktan sonra sitede Ödemeyi Yaptım düğmesine bas. Durum 'banka kontrolü bekleniyor' olur. Banka hesabında tutar ve FL açıklama kodu doğrulandıktan sonra ödeme yönetimden onaylanır ve üyelik kodun hazırlanır.",
      actions: [["Üyelik / Ödeme", "#membership-payment-panel"]],
    },
    {
      id: "code",
      keys: ["uyelik kodu", "kodu nereye", "kod nasil", "kod girecegim", "kod kabul", "kod aktif"],
      answer: "Ödeme onaylandıktan sonra aldığın üyelik kodunu Özel Analiz bölümündeki Üye Kodu alanına yazıp Kod ile Aç'a bas. Kod backend tarafından doğrulanır ve kalan analiz hakkın ekranda görünür.",
      actions: [["Kod Alanını Aç", "#premium-analysis-panel"]],
    },
    {
      id: "results",
      keys: ["sonuclar", "performans", "tahmin sonucu", "gecmis", "basari", "arsiv"],
      answer: "Sonuçlanan değerlendirmeleri Sonuçlar bölümünde, kupon türlerine göre başarı takibini ise Performans bölümünde görebilirsin. Amaç yalnız başarılı seçimleri değil, sonuçlanan kayıtları da izlemektir.",
      actions: [["Sonuçları Gör", "#sonuc-arsivi"], ["Performansı Gör", "#basari-takip"]],
    },
    {
      id: "guarantee",
      keys: ["kesin", "garanti", "banko", "kesin tutar", "kesin kazanir", "garanti kupon"],
      answer: "Futbol Laboratuvarı kesin sonuç veya kazanç garantisi vermez. Sistem güncel verilerden gerekçeli maç değerlendirmeleri ve risk seviyeleri üretir; son karar kullanıcıya aittir.",
      actions: [["Kupon Merkezini Aç", "#robot-analizleri"]],
    },
  ];

  const scoreIntent = (question, intent) => {
    const q = normalize(question);
    let score = 0;
    for (const raw of intent.keys) {
      const key = normalize(raw);
      if (q === key) score += 12;
      else if (q.includes(key)) score += 8;
      else {
        const words = key.split(" ").filter((word) => word.length > 2);
        score += words.filter((word) => q.includes(word)).length * 2;
      }
    }
    return score;
  };

  const replyFor = (question) => {
    const ranked = intents.map((intent) => ({ intent, score: scoreIntent(question, intent) }))
      .sort((a, b) => b.score - a.score);
    if (!ranked[0] || ranked[0].score < 2) {
      return {
        answer: "Ben Futbol Laboratuvarı kullanım rehberiyim. Site kullanımı, maçlar, Kupon Merkezi, üyelik, ücretsiz deneme, Havale / EFT / FAST ödeme ve Özel Analiz hakkında yardımcı olabilirim.",
        actions: [["Nasıl Kullanılır?", "guide:start"], ["Üyelik", "#membership-payment-panel"]],
      };
    }
    return ranked[0].intent;
  };

  const go = (target) => {
    if (target.startsWith("guide:")) {
      send(target.slice(6) === "start" ? "Siteyi nasıl kullanırım?" : target.slice(6));
      return;
    }
    if (!target.startsWith("#")) return;
    const id = target.slice(1);
    window.dispatchEvent(new CustomEvent("fl:open-panel", { detail: { id, scroll: true } }));
    const element = document.querySelector(target);
    if (element) {
      const offset = (document.querySelector(".site-header")?.offsetHeight || 0) + 16;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      history.replaceState(null, "", target);
    }
  };

  const injectStyle = () => {
    if (document.getElementById("fl-guide-bot-style")) return;
    const style = document.createElement("style");
    style.id = "fl-guide-bot-style";
    style.textContent = `
      .fl-guide-launch{position:fixed;right:18px;bottom:18px;z-index:9998;display:flex;align-items:center;gap:9px;min-height:50px;padding:0 16px;border:1px solid rgba(57,255,136,.42);border-radius:999px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#06110d;font-weight:950;box-shadow:0 18px 48px rgba(0,0,0,.38);cursor:pointer}.fl-guide-launch span{font-size:20px}.fl-guide-panel{position:fixed;right:18px;bottom:80px;z-index:9999;width:min(390px,calc(100vw - 28px));max-height:min(620px,calc(100vh - 110px));display:none;grid-template-rows:auto 1fr auto;border:1px solid rgba(57,255,136,.3);border-radius:22px;background:#061126;color:#f8fbff;box-shadow:0 28px 80px rgba(0,0,0,.5);overflow:hidden}.fl-guide-panel.open{display:grid}.fl-guide-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(57,255,136,.06)}.fl-guide-head strong{color:#ffe08a}.fl-guide-head small{display:block;margin-top:3px;color:#9fb0c7}.fl-guide-close{width:34px;height:34px;border:0;border-radius:10px;background:rgba(255,255,255,.08);color:#fff;font-size:20px;cursor:pointer}.fl-guide-log{display:flex;flex-direction:column;gap:10px;padding:14px;overflow:auto}.fl-guide-msg{max-width:88%;padding:11px 12px;border-radius:15px;line-height:1.48;font-size:13px}.fl-guide-msg.bot{align-self:flex-start;background:rgba(57,255,136,.09);border:1px solid rgba(57,255,136,.16);color:#e8fff1}.fl-guide-msg.user{align-self:flex-end;background:rgba(255,159,28,.14);border:1px solid rgba(255,159,28,.22);color:#fff7df}.fl-guide-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.fl-guide-action,.fl-guide-chip{border:1px solid rgba(57,255,136,.25);border-radius:999px;background:rgba(57,255,136,.08);color:#c8ffdd;padding:7px 10px;font-size:11px;font-weight:900;cursor:pointer}.fl-guide-compose{padding:12px;border-top:1px solid rgba(255,255,255,.08);background:#040b1b}.fl-guide-chips{display:flex;gap:6px;overflow:auto;padding-bottom:9px}.fl-guide-form{display:grid;grid-template-columns:1fr auto;gap:8px}.fl-guide-input{min-width:0;min-height:42px;border:1px solid rgba(255,255,255,.13);border-radius:12px;background:#020817;color:#fff;padding:0 12px}.fl-guide-send{min-width:68px;border:0;border-radius:12px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#06110d;font-weight:950;cursor:pointer}@media(max-width:560px){.fl-guide-launch{right:12px;bottom:12px}.fl-guide-launch b{display:none}.fl-guide-panel{right:14px;bottom:72px;width:calc(100vw - 28px)}}
    `;
    document.head.appendChild(style);
  };

  let log;
  const addMessage = (type, text, actions = []) => {
    if (!log) return;
    const item = document.createElement("div");
    item.className = `fl-guide-msg ${type}`;
    const copy = document.createElement("div");
    copy.textContent = text;
    item.appendChild(copy);
    if (type === "bot" && actions.length) {
      const row = document.createElement("div");
      row.className = "fl-guide-actions";
      actions.forEach(([label, target]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "fl-guide-action";
        button.textContent = label;
        button.addEventListener("click", () => go(target));
        row.appendChild(button);
      });
      item.appendChild(row);
    }
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
  };

  const send = (question) => {
    const text = String(question || "").trim();
    if (!text) return;
    addMessage("user", text);
    const result = replyFor(text);
    setTimeout(() => addMessage("bot", result.answer, result.actions || []), 120);
  };

  const boot = () => {
    if (document.querySelector(".fl-guide-launch")) return;
    injectStyle();
    const launch = document.createElement("button");
    launch.type = "button";
    launch.className = "fl-guide-launch";
    launch.setAttribute("aria-label", "Futbol Laboratuvarı rehberini aç");
    launch.innerHTML = "<span>💬</span><b>Site Rehberi</b>";

    const panel = document.createElement("aside");
    panel.className = "fl-guide-panel";
    panel.setAttribute("aria-label", "Futbol Laboratuvarı yapay zeka rehberi");
    panel.innerHTML = `
      <div class="fl-guide-head"><div><strong>Futbol Laboratuvarı Rehberi</strong><small>Site kullanımı ve üyelik yardımcısı</small></div><button class="fl-guide-close" type="button" aria-label="Kapat">×</button></div>
      <div class="fl-guide-log" aria-live="polite"></div>
      <div class="fl-guide-compose"><div class="fl-guide-chips"><button class="fl-guide-chip" type="button">Nasıl kullanılır?</button><button class="fl-guide-chip" type="button">Ücretsiz deneme</button><button class="fl-guide-chip" type="button">Nasıl ödeme yaparım?</button><button class="fl-guide-chip" type="button">Özel Analiz</button></div><form class="fl-guide-form"><input class="fl-guide-input" maxlength="220" placeholder="Sorunu yaz..." aria-label="Rehbere soru sor"><button class="fl-guide-send" type="submit">Gönder</button></form></div>`;

    document.body.appendChild(launch);
    document.body.appendChild(panel);
    log = panel.querySelector(".fl-guide-log");
    const input = panel.querySelector(".fl-guide-input");
    const open = () => {
      panel.classList.add("open");
      if (!log.children.length) addMessage("bot", "Merhaba! Futbol Laboratuvarı'nı nasıl kullanacağını, üyelik ve ödeme adımlarını anlatabilirim. Ne yapmak istiyorsun?", [["Nasıl Kullanılır?", "guide:start"], ["Üyelik Paketleri", "#membership-payment-panel"]]);
      setTimeout(() => input?.focus(), 50);
    };
    launch.addEventListener("click", () => panel.classList.contains("open") ? panel.classList.remove("open") : open());
    panel.querySelector(".fl-guide-close")?.addEventListener("click", () => panel.classList.remove("open"));
    panel.querySelectorAll(".fl-guide-chip").forEach((button) => button.addEventListener("click", () => send(button.textContent)));
    panel.querySelector(".fl-guide-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input?.value || "";
      if (input) input.value = "";
      send(value);
    });
  };

  document.addEventListener("DOMContentLoaded", boot, { once: true });
  window.addEventListener("load", boot, { once: true });
  boot();
})();
