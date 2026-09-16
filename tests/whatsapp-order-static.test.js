const fs = require("fs");
const assert = require("assert");

const edge = fs.readFileSync("supabase/functions/fl-whatsapp-order/index.ts", "utf8");
const ui = fs.readFileSync("whatsapp-order.js", "utf8");
const membership = fs.readFileSync("membership-payment-panel.js", "utf8");
const build = fs.readFileSync("scripts/vercel-build.js", "utf8");

assert(edge.includes('req.headers.get("x-hub-signature-256")'), "Meta webhook signature header must be verified");
assert(edge.includes("validMetaSignature(rawBody, signature, cfg.appSecret)"), "Webhook signature check must gate processing");
assert(edge.includes('order.status !== "paid"'), "Membership code must be gated by paid order status");
assert(edge.includes("normalizePhone(order.phone) !== normalizePhone(sender)"), "WhatsApp sender must match order phone");
assert(edge.includes('Deno.env.get("WHATSAPP_ACCESS_TOKEN")'), "WhatsApp token must come from server environment");
assert(edge.includes('Deno.env.get("WHATSAPP_APP_SECRET")'), "Meta App Secret must come from server environment");
assert(edge.includes('db.from("whatsapp_webhook_events")'), "Webhook delivery deduplication must be enabled");
assert(edge.includes('db.from("bank_payment_config")'), "Existing encrypted membership-code key must stay server-side");

assert(ui.includes("?action=public-config"), "Frontend must use public configuration endpoint");
assert(ui.includes("?action=order-link&order_code="), "Payment output must create an order-aware WhatsApp link");
assert(ui.includes("/^FL-\\d{8}-[A-F0-9]{10}$/i"), "Frontend must validate order-code shape");
assert(!ui.includes("WHATSAPP_ACCESS_TOKEN"), "Frontend must never contain the WhatsApp access token name/value");
assert(!ui.includes("WHATSAPP_APP_SECRET"), "Frontend must never contain Meta App Secret material");
assert(!ui.includes("WHATSAPP_PHONE_NUMBER_ID"), "Frontend must not expose the Meta phone number ID");

assert(membership.includes('script.src = "whatsapp-order.js?v=20260916-whatsapp-order-v1"'), "Membership panel must load WhatsApp UI module");
assert(build.includes('"supabase"'), "Supabase server source must remain excluded from public build output");
assert(!build.includes('"whatsapp-order.js"'), "WhatsApp frontend module must not be explicitly excluded from public output");

console.log("WhatsApp order static security/integration checks passed.");
