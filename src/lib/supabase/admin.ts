import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// ── Schema ──────────────────────────────────────────────────────────────

export async function ensurePipelineTable() {
  try {
    await supabaseAdmin.rpc("ensure_pipeline").maybeSingle().catch(() => {});
  } catch {
    console.warn("[Supabase] Schema migration deferred — run schema.sql manually");
  }
}

// ── Pipeline Operations ─────────────────────────────────────────────────

export async function findLeadByEmail(email: string) {
  const { data } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("email", email)
    .order("hunted_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function updateLeadPipeline(leadId: string, updates: {
  status: string;
  sentiment?: string;
  reply_text?: string;
}) {
  const { error } = await supabaseAdmin
    .from("leads")
    .update({
      status: updates.status,
      notes: updates.sentiment || "",
      replied_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (error) throw error;
  return true;
}

export async function insertActivity(leadId: string, action: string, detail: string) {
  await supabaseAdmin.from("leads").update({
    notes: `${action}: ${detail}`,
  }).eq("id", leadId).maybeSingle().catch(() => {});
}
