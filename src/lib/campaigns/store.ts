import { supabase } from "@/lib/supabase/client";

export async function createCampaign(name: string, niche: string) {
  const { data, error } = await supabase.from("campaigns").insert({ name, niche, status: "building" }).select().single();
  if (error) throw error;
  return data;
}

export async function getCampaigns() {
  const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false }).limit(20);
  return data || [];
}

export async function addLeadsToCampaign(campaignId: string, leads: Array<{ company: string; website: string; email?: string; status?: string }>) {
  const rows = leads.map(l => ({ campaign_id: campaignId, company: l.company, website: l.website, email: l.email || "", status: l.status || "hunted" }));
  const { data, error } = await supabase.from("leads").insert(rows).select();
  if (error) throw error;
  return data || [];
}

export async function getLeads(campaignId?: string) {
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(50);
  if (campaignId) q = q.eq("campaign_id", campaignId);
  const { data } = await q;
  return data || [];
}

export async function updateLeadStatus(leadId: string, status: string) {
  const { error } = await supabase.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", leadId);
  if (error) throw error;
}

export async function getPipelineStats() {
  const { data } = await supabase.from("leads").select("status");
  const counts: Record<string, number> = { total: 0, hunted: 0, sent: 0, opened: 0, replied: 0, booked: 0, closed_won: 0, closed_lost: 0, bounced: 0 };
  if (data) { data.forEach(l => { counts.total++; counts[l.status] = (counts[l.status] || 0) + 1; }); }
  return counts;
}

export async function getRecentActivity() {
  const { data } = await supabase.from("leads").select("*, campaigns(name)").order("created_at", { ascending: false }).limit(20);
  return data || [];
}
