import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Schema ────────────────────────────────────────────────────────────────────

export interface CampaignRecord {
  id: string;
  name: string;
  service: string;
  niche: string;
  market: string;
  created_at: string;
}

export interface LeadRecord {
  id: string;
  campaign_id: string;
  company: string;
  website: string;
  email: string;
  service: string;
  status: string;
  subject: string;
  body: string;
  hunted_at: string;
  sent_at?: string;
  replied_at?: string;
  notes: string;
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

export async function createCampaign(name: string, service: string, niche: string, market: string) {
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ name, service, niche, market })
    .select()
    .single();
  if (error) throw error;
  return data as CampaignRecord;
}

export async function getCampaigns() {
  const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  return (data || []) as CampaignRecord[];
}

export async function getCampaign(id: string) {
  const { data } = await supabase.from("campaigns").select("*, leads(*)").eq("id", id).single();
  return data;
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function addLeads(campaignId: string, leads: Array<{
  company: string; website: string; email: string; service: string; subject: string; body: string;
}>) {
  const records = leads.map(l => ({
    campaign_id: campaignId,
    company: l.company,
    website: l.website,
    email: l.email,
    service: l.service,
    status: "hunted",
    subject: l.subject,
    body: l.body,
  }));

  const { data, error } = await supabase.from("leads").insert(records).select();
  if (error) throw error;
  return (data || []) as LeadRecord[];
}

export async function getLeads(campaignId?: string) {
  let query = supabase.from("leads").select("*").order("hunted_at", { ascending: false }).limit(100);
  if (campaignId) query = query.eq("campaign_id", campaignId);
  const { data } = await query;
  return (data || []) as LeadRecord[];
}

export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  const updates: any = { status };
  if (status === "sent") updates.sent_at = new Date().toISOString();
  if (status === "replied") updates.replied_at = new Date().toISOString();
  if (notes) updates.notes = notes;

  const { error } = await supabase.from("leads").update(updates).eq("id", leadId);
  if (error) throw error;
  return true;
}

export async function getPipelineStats(campaignId?: string) {
  let query = supabase.from("leads").select("status", { count: "exact" });
  if (campaignId) query = query.eq("campaign_id", campaignId);
  const { data, count } = await query;

  const stats: Record<string, number> = { total: count || 0 };
  const statuses = ["hunted", "sent", "opened", "replied", "booked", "closed_won", "closed_lost", "bounced"];
  for (const s of statuses) {
    stats[s] = (data || []).filter((l: any) => l.status === s).length;
  }
  return stats;
}

// ── Schema Migration ──────────────────────────────────────────────────────────

export async function migrateSchema() {
  try {
    await supabase.rpc("hermes_migrate");
  } catch {}

  // Fallback: create tables via raw SQL
  const sql = `
    CREATE TABLE IF NOT EXISTS campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      service TEXT DEFAULT '',
      niche TEXT DEFAULT '',
      market TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
      company TEXT NOT NULL,
      website TEXT DEFAULT '',
      email TEXT DEFAULT '',
      service TEXT DEFAULT '',
      status TEXT DEFAULT 'hunted',
      subject TEXT DEFAULT '',
      body TEXT DEFAULT '',
      hunted_at TIMESTAMPTZ DEFAULT NOW(),
      sent_at TIMESTAMPTZ,
      replied_at TIMESTAMPTZ,
      notes TEXT DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  `;

  try {
    const queries = sql.split(";").filter(q => q.trim());
    for (const q of queries) {
      try {
        await supabase.rpc("exec_sql", { query: q.trim() });
      } catch {}
    }
  } catch {
    console.warn("[Supabase] Schema migration skipped — tables may already exist");
  }
}
