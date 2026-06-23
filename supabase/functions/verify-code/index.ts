import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function normalizeCode(code: string) {
  return String(code || "").trim().toLocaleUpperCase("tr-TR");
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, message: "Sadece POST desteklenir." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ ok: false, message: "Backend ortam ayarları eksik." }, 500);
  }

  let payload: { code?: string; clientId?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, message: "Geçersiz istek." }, 400);
  }

  const code = normalizeCode(payload.code || "");
  const clientId = String(payload.clientId || "").trim();

  if (!code) return json({ ok: false, message: "Kod boş olamaz." }, 400);
  if (!clientId) return json({ ok: false, message: "Cihaz kimliği eksik." }, 400);

  const codeHash = await sha256Hex(code);
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: membershipCode, error: codeError } = await supabase
    .from("membership_codes")
    .select("id, plan_code, plan_name, max_activations, used_activations, max_analysis_count, expires_at, is_active")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (codeError) return json({ ok: false, message: "Kod kontrolünde hata oluştu." }, 500);
  if (!membershipCode) return json({ ok: false, message: "Kod bulunamadı veya hatalı." }, 404);
  if (!membershipCode.is_active) return json({ ok: false, message: "Kod pasif durumda." }, 403);
  if (membershipCode.expires_at && new Date(membershipCode.expires_at).getTime() < Date.now()) {
    return json({ ok: false, message: "Kodun süresi dolmuş." }, 403);
  }

  const { data: existingActivation } = await supabase
    .from("membership_activations")
    .select("id, remaining_analysis_count")
    .eq("code_id", membershipCode.id)
    .eq("client_id", clientId)
    .maybeSingle();

  if (existingActivation) {
    await supabase
      .from("membership_activations")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", existingActivation.id);

    return json({
      ok: true,
      message: "Üyelik zaten aktif.",
      membership: {
        plan_code: membershipCode.plan_code,
        plan_name: membershipCode.plan_name,
        remaining_analysis_count: existingActivation.remaining_analysis_count,
        active: true,
      },
    });
  }

  if (Number(membershipCode.used_activations) >= Number(membershipCode.max_activations)) {
    return json({ ok: false, message: "Kod aktivasyon hakkı dolmuş." }, 403);
  }

  const { data: activation, error: activationError } = await supabase
    .from("membership_activations")
    .insert({
      code_id: membershipCode.id,
      client_id: clientId,
      remaining_analysis_count: membershipCode.max_analysis_count,
    })
    .select("id, remaining_analysis_count")
    .single();

  if (activationError || !activation) {
    return json({ ok: false, message: "Üyelik aktif edilemedi." }, 500);
  }

  await supabase
    .from("membership_codes")
    .update({
      used_activations: Number(membershipCode.used_activations) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", membershipCode.id);

  await supabase.from("membership_events").insert({
    code_id: membershipCode.id,
    client_id: clientId,
    event_type: "code_activated",
    event_note: "Kod doğrulandı ve üyelik aktif edildi.",
  });

  return json({
    ok: true,
    message: "Kod kabul edildi. Üyelik aktif edildi.",
    membership: {
      plan_code: membershipCode.plan_code,
      plan_name: membershipCode.plan_name,
      remaining_analysis_count: activation.remaining_analysis_count,
      active: true,
    },
  });
});
