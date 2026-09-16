import { createClient } from "npm:@supabase/supabase-js@2.112.2";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const SITE_URL = "https://futbollaboratuuvari.org";
const DEFAULT_GRAPH_VERSION = "v26.0";
const ORDER_RE = /\bFL-\d{8}-[A-F0-9]{10}\b/i;
const encoder = new TextEncoder();

const clean = (value: unknown, max = 500) => String(value ?? "").trim().slice(0, max);
const digits = (value: unknown) => clean(value, 80).replace(/\D+/g, "");
const jsonHeaders = (req: Request) => ({
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  ...corsHeaders(req),
});

function allowedOrigin(req: Request) {
  const origin = clean(req.headers.get("origin"), 300);
  if (!origin) return "";
  if (origin === SITE_URL || origin === "https://www.futbollaboratuuvari.org") return origin;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return origin;
  return "";
}

function corsHeaders(req: Request) {
  const origin = allowedOrigin(req);
  return origin ? {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,x-hub-signature-256",
    "Vary": "Origin",
  } : {};
}

function replyJson(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders(req) });
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function hex(bytes: Uint8Array) {
  return [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

async function validMetaSignature(rawBody: string, signatureHeader: string, appSecret: string) {
  if (!appSecret || !signatureHeader.startsWith("sha256=")) return false;
  const supplied = signatureHeader.slice(7).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(supplied)) return false;
  const expected = await hmacHex(rawBody, appSecret);
  return constantTimeEqual(expected, supplied);
}

function normalizePhone(value: unknown) {
  let valueDigits = digits(value);
  if (valueDigits.startsWith("00")) valueDigits = valueDigits.slice(2);
  if (valueDigits.length === 11 && valueDigits.startsWith("0")) valueDigits = `90${valueDigits.slice(1)}`;
  if (valueDigits.length === 10 && valueDigits.startsWith("5")) valueDigits = `90${valueDigits}`;
  return valueDigits;
}

function publicPhone() {
  return normalizePhone(Deno.env.get("WHATSAPP_PUBLIC_NUMBER"));
}

function graphVersion() {
  const configured = clean(Deno.env.get("WHATSAPP_GRAPH_VERSION"), 20);
  return /^v\d+\.\d+$/.test(configured) ? configured : DEFAULT_GRAPH_VERSION;
}

function botConfig() {
  const accessToken = clean(Deno.env.get("WHATSAPP_ACCESS_TOKEN"), 4096);
  const phoneNumberId = clean(Deno.env.get("WHATSAPP_PHONE_NUMBER_ID"), 100);
  const appSecret = clean(Deno.env.get("WHATSAPP_APP_SECRET"), 512);
  const verifyToken = clean(Deno.env.get("WHATSAPP_VERIFY_TOKEN"), 512);
  const phone = publicPhone();
  return {
    accessToken,
    phoneNumberId,
    appSecret,
    verifyToken,
    phone,
    version: graphVersion(),
    enabled: Boolean(accessToken && phoneNumberId && appSecret && verifyToken && phone),
  };
}

function findOrderCode(text: unknown) {
  const match = clean(text, 2000).toUpperCase().match(ORDER_RE);
  return match?.[0] || "";
}

function orderLink(orderCode = "") {
  const phone = publicPhone();
  if (!phone) return "";
  const message = orderCode
    ? `Merhaba, Futbol Laboratuvarı sipariş kodum: ${orderCode}. Ödeme durumumu kontrol edip üyelik kodumu almak istiyorum.`
    : "Merhaba, Futbol Laboratuvarı üzerinden üyelik siparişi vermek istiyorum.";
  return `https://wa.me/${phone}?${new URLSearchParams({ text: message }).toString()}`;
}

function fromHex(value: string) {
  return new Uint8Array((value.match(/.{1,2}/g) || []).map((part) => Number.parseInt(part, 16)));
}

async function decrypt(cipherText: string, secret: string) {
  if (!/^[a-f0-9]{32,64}$/i.test(secret) || secret.length % 2 !== 0) throw new Error("invalid_crypto_secret");
  const raw = Uint8Array.from(atob(cipherText), (char) => char.charCodeAt(0));
  if (raw.length <= 28) throw new Error("invalid_ciphertext");
  const iv = raw.slice(0, 12);
  const body = raw.slice(12);
  const key = await crypto.subtle.importKey("raw", fromHex(secret), { name: "AES-GCM" }, false, ["decrypt"]);
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, body));
}

async function cryptoSecret() {
  const { data, error } = await db.from("bank_payment_config")
    .select("code_crypto_secret")
    .eq("id", 1)
    .single();
  if (error || !data?.code_crypto_secret) throw new Error("bank_config_missing");
  return String(data.code_crypto_secret);
}

async function sendText(to: string, text: string, replyTo = "") {
  const cfg = botConfig();
  if (!cfg.enabled) throw new Error("whatsapp_not_configured");
  const payload: Record<string, unknown> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body: text.slice(0, 3500) },
  };
  if (replyTo) payload.context = { message_id: replyTo };
  const response = await fetch(`https://graph.facebook.com/${cfg.version}/${cfg.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cfg.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    console.error("fl-whatsapp-order graph_send_failed", response.status);
    throw new Error("graph_send_failed");
  }
}

async function claimMessage(messageId: string) {
  if (!messageId) return false;
  const { error } = await db.from("whatsapp_webhook_events").insert({ message_id: messageId });
  if (!error) return true;
  if (error.code === "23505") return false;
  throw error;
}

async function releaseMessage(messageId: string) {
  await db.from("whatsapp_webhook_events").delete().eq("message_id", messageId);
}

async function cleanupOldEvents() {
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
  await db.from("whatsapp_webhook_events").delete().lt("created_at", cutoff);
}

function extractMessages(payload: any) {
  const messages: any[] = [];
  for (const entry of Array.isArray(payload?.entry) ? payload.entry : []) {
    for (const change of Array.isArray(entry?.changes) ? entry.changes : []) {
      for (const message of Array.isArray(change?.value?.messages) ? change.value.messages : []) {
        messages.push(message);
      }
    }
  }
  return messages;
}

function messageText(message: any) {
  if (message?.type === "text") return clean(message?.text?.body, 2000);
  if (message?.type === "button") return clean(message?.button?.text, 2000);
  if (message?.type === "interactive") {
    return clean(message?.interactive?.button_reply?.title || message?.interactive?.list_reply?.title, 2000);
  }
  return "";
}

async function replyForOrder(sender: string, orderCode: string, messageId: string) {
  const { data: order, error } = await db.from("bank_transfer_orders")
    .select("order_code,status,plan_name,phone,membership_code_cipher,membership_code_label")
    .eq("order_code", orderCode)
    .single();

  if (error || !order) {
    await sendText(sender, `Sipariş kodu bulunamadı. Kodu sitede göründüğü biçimde tekrar gönder: ${orderCode}`, messageId);
    return;
  }

  if (normalizePhone(order.phone) !== normalizePhone(sender)) {
    await sendText(sender, "Bu sipariş kodu bu WhatsApp numarasıyla eşleşmiyor. Siparişte yazdığınız telefon numarasının WhatsApp hesabından tekrar deneyin.", messageId);
    return;
  }

  if (order.status !== "paid") {
    const text = order.status === "payment_reported"
      ? "Sipariş bulundu ✅ Ödeme/dekont bildiriminiz alındı, banka kontrolü sürüyor. Onay tamamlandığında aynı FL sipariş kodunu tekrar gönderin."
      : ["rejected", "cancelled", "expired"].includes(order.status)
        ? "Sipariş bulundu ancak aktif ödeme durumunda değil. Site üzerinden yeni ödeme talebi oluşturabilirsiniz."
        : "Sipariş bulundu. Ödeme henüz onaylanmadı. Ödeme ve dekont işlemini siteden tamamladıktan sonra aynı FL sipariş kodunu tekrar gönderin.";
    await sendText(sender, text, messageId);
    return;
  }

  if (!order.membership_code_cipher) {
    await sendText(sender, "Ödemeniz onaylandı ancak üyelik kodu henüz hazırlanıyor. Kısa süre sonra aynı FL sipariş kodunu tekrar gönderin.", messageId);
    return;
  }

  const secret = await cryptoSecret();
  const membershipCode = await decrypt(order.membership_code_cipher, secret);
  const text = [
    "Ödemeniz onaylandı ✅",
    order.plan_name ? `Paket: ${order.plan_name}` : "",
    "",
    "Üyelik kodunuz:",
    membershipCode,
    "",
    `Kodu sitedeki “Üyelik Kodum Var” alanına girin: ${SITE_URL}/#membership-code-access`,
    "Bu kodu başkalarıyla paylaşmayın.",
  ].filter(Boolean).join("\n");
  await sendText(sender, text, messageId);
}

async function handleMessage(message: any) {
  const messageId = clean(message?.id, 255);
  const sender = normalizePhone(message?.from);
  if (!messageId || !sender) return;
  if (!await claimMessage(messageId)) return;

  try {
    const text = messageText(message);
    const orderCode = findOrderCode(text);
    if (orderCode) {
      await replyForOrder(sender, orderCode, messageId);
    } else if (!text) {
      await sendText(sender, "Bu hat otomatik sipariş ve üyelik kodu kontrolü içindir. Siteden aldığınız FL-... sipariş kodunu metin olarak gönderin.", messageId);
    } else {
      await sendText(sender, `Merhaba 👋 Futbol Laboratuvarı otomatik sipariş hattına hoş geldiniz.\n\nÜyelik kodunuzu almak için sitedeki FL-... sipariş kodunu bu sohbete gönderin. Kod yalnız ödeme onaylandıktan sonra ve siparişte kayıtlı WhatsApp numarasına verilir.\n\nSipariş: ${SITE_URL}/#membership-payment-panel`, messageId);
    }
  } catch (error) {
    await releaseMessage(messageId);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  const url = new URL(req.url);
  const action = clean(url.searchParams.get("action"), 40);
  const cfg = botConfig();

  try {
    if (req.method === "GET" && action === "health") {
      return replyJson(req, 200, {
        ok: true,
        service: "fl-whatsapp-order",
        version: 1,
        configured: cfg.enabled,
        graph_version: cfg.version,
        order_code_flow: true,
        phone_match_required: true,
      });
    }

    if (req.method === "GET" && action === "public-config") {
      return replyJson(req, 200, { ok: true, enabled: cfg.enabled });
    }

    if (req.method === "GET" && (action === "chat-link" || action === "order-link")) {
      if (!cfg.enabled) return replyJson(req, 503, { ok: false, error: "whatsapp_not_configured" });
      const requestedOrder = action === "order-link" ? findOrderCode(url.searchParams.get("order_code")) : "";
      const target = orderLink(requestedOrder);
      if (!target) return replyJson(req, 503, { ok: false, error: "whatsapp_not_configured" });
      return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store" } });
    }

    if (req.method === "GET" && url.searchParams.get("hub.mode") === "subscribe") {
      const verifyToken = clean(url.searchParams.get("hub.verify_token"), 512);
      const challenge = clean(url.searchParams.get("hub.challenge"), 2048);
      if (!cfg.verifyToken) return new Response("Webhook yapılandırılmamış.", { status: 503 });
      if (constantTimeEqual(verifyToken, cfg.verifyToken)) {
        return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
      return new Response("Forbidden", { status: 403 });
    }

    if (req.method !== "POST") return replyJson(req, 405, { ok: false, error: "method_not_allowed" });
    if (!cfg.enabled) return replyJson(req, 503, { ok: false, error: "whatsapp_not_configured" });

    const rawBody = await req.text();
    if (rawBody.length > 1024 * 1024) return replyJson(req, 413, { ok: false, error: "payload_too_large" });
    const signature = clean(req.headers.get("x-hub-signature-256"), 256).toLowerCase();
    if (!await validMetaSignature(rawBody, signature, cfg.appSecret)) {
      return replyJson(req, 401, { ok: false, error: "invalid_signature" });
    }

    let payload: any;
    try { payload = JSON.parse(rawBody); } catch { return replyJson(req, 400, { ok: false, error: "invalid_json" }); }
    if (payload?.object !== "whatsapp_business_account") return replyJson(req, 200, { ok: true, ignored: true });

    const messages = extractMessages(payload).slice(0, 25);
    for (const message of messages) await handleMessage(message);
    cleanupOldEvents().catch(() => undefined);
    return replyJson(req, 200, { ok: true, processed: messages.length });
  } catch (error) {
    console.error("fl-whatsapp-order", action || "webhook", error instanceof Error ? error.message : "unknown_error");
    return replyJson(req, 500, { ok: false, error: "internal_error" });
  }
});
