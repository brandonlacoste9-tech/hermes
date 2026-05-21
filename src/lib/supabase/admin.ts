import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;

function getAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase not configured");
  _supabaseAdmin = createClient(url, key, { auth: { persistSession: false } });
  return _supabaseAdmin;
}

export async function findLeadByEmail(email: string) {
  const { data } = await getAdmin().from("leads").select("*").eq("email", email).order("created_at", { ascending: false }).limit(1).single();
  return data;
}

export async function updateLeadPipeline(leadId: string, updates: { status: string; sentiment?: string; reply_text?: string }) {
  await getAdmin().from("leads").update({ status: updates.status, replied_at: new Date().toISOString() }).eq("id", leadId);
}
