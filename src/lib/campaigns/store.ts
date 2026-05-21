import { supabase, ensureTables } from "@/lib/supabase/client";

let initialized = false;

export async function init() {
  // Tables exist — skip the check. Created via Supabase SQL editor.
  initialized = true;
}

export async function createCampaign(name: string, service: string, niche: string, market: string) {
  await init();
  const { data, error } = await supabase.from("campaigns").insert({ name, service, niche, market }).select().single();
  if (error) throw error;
  return data;
}

export async function getCampaigns() {
  await init();
  const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false }).limit(20);
  return data || [];
}

export async function addLeadsToCampaign(campaignId: string, leads: Array<{ company: string; website: string; email?: string; status?: string }>) {
  await init();
  const rows = leads.map(l => ({ campaign_id: campaignId, ...l, status: l.status || "hunted" }));
  const { data, error } = await supabase.from("leads").insert(rows).select();
  if (error) throw error;
  return data || [];
}

export async function getLeads(campaignId?: string) {
  await init();
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(50);
  if (campaignId) q = q.eq("campaign_id", campaignId);
  const { data } = await q;
  return data || [];
}

export async function updateLeadStatus(leadId: string, status: string) {
  await init();
  const updates: any = { status, updated_at: new Date().toISOString() };
  if (status === "sent") updates.sent_at = new Date().toISOString();
  if (status === "replied") updates.replied_at = new Date().toISOString();
  const { error } = await supabase.from("leads").update(updates).eq("id", leadId);
  if (error) throw error;
}

export async function getPipelineStats() {
  await init();
  const { data } = await supabase.from("leads").select("status");
  const counts: Record<string, number> = { total: 0, hunted: 0, sent: 0, opened: 0, replied: 0, booked: 0, closed_won: 0, closed_lost: 0, bounced: 0 };
  if (data) {
    data.forEach(l => { counts.total++; counts[l.status] = (counts[l.status] || 0) + 1; });
  }
  return counts;
}

export async function getRecentActivity() {
  await init();
  const { data } = await supabase.from("leads").select("*, campaigns(name)").order("created_at", { ascending: false }).limit(20);
  return data || [];
}
