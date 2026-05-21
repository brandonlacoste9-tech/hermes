import { supabase } from "@/lib/supabase/client";

const db = () => supabase();

export async function createCampaign(name: string, niche: string) {
  const { data, error } = await db().from("campaigns").insert({ name, niche, status: "building" }).select().single();
  if (error) throw error;
  return data;
}

export async function getCampaigns() {
  const { data } = await db().from("campaigns").select("*").order("created_at", { ascending: false }).limit(20);
  return data || [];
}

export async function addLeadsToCampaign(campaignId: string, leads: Array<{ company: string; website: string; email?: string; status?: string }>) {
  const rows = leads.map(l => ({ campaign_id: campaignId, company: l.company, website: l.website, email: l.email || "", status: l.status || "hunted" }));
  const { data, error } = await db().from("leads").insert(rows).select();
  if (error) throw error;
  return data || [];
}

export async function updateLeadStatus(leadId: string, status: string) {
  await db().from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", leadId);
}

export async function getPipelineStats() {
  const { data } = await db().from("leads").select("status");
  const counts: Record<string, number> = { total: 0 };
  if (data) { data.forEach((l: any) => { counts.total++; counts[l.status] = (counts[l.status] || 0) + 1; }); }
  return counts;
}

export async function getRecentActivity() {
  const { data } = await db().from("leads").select("*").order("created_at", { ascending: false }).limit(20);
  return data || [];
}
