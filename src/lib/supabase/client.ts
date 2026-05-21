import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://avimvvlwrekhblubcutg.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export async function ensureTables() {
  try {
    await supabase.rpc("ensure_campaign_tables"); // Try stored proc first
  } catch {
    // Create campaigns table
    const { error: cErr } = await supabase.from("campaigns").select("id").limit(1);
    if (cErr?.code === "42P01") {
      // Table doesn't exist — create via raw SQL
      await supabase.rpc("exec_sql", { 
        query: `CREATE TABLE IF NOT EXISTS campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, service TEXT DEFAULT '', niche TEXT DEFAULT '', market TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW())`
      }).maybeSingle();
    }
    
    const { error: lErr } = await supabase.from("leads").select("id").limit(1);
    if (lErr?.code === "42P01") {
      await supabase.rpc("exec_sql", {
        query: `CREATE TABLE IF NOT EXISTS leads (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE, company TEXT NOT NULL, website TEXT DEFAULT '', email TEXT DEFAULT '', status TEXT DEFAULT 'hunted', subject TEXT DEFAULT '', body TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`
      }).maybeSingle();
    }
  }
}
