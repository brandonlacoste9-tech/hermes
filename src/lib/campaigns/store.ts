import { createCampaign as neonCreate, getCampaigns as neonGetCampaigns, getCampaign as neonGetCampaign, addLeads as neonAddLeads, getLeads as neonGetLeads, updateLeadStatus as neonUpdateLead, getPipelineStats as neonStats } from "@/lib/neon/client";

export async function createCampaign(name: string, service: string, niche: string, market: string) {
  return neonCreate(name, service, niche, market);
}

export async function getCampaigns() {
  return neonGetCampaigns();
}

export async function getCampaign(id: string) {
  return neonGetCampaign(id);
}

export async function addLeadsToCampaign(campaignId: string, leads: Array<{
  company: string; website: string; email: string; service: string; subject: string; body: string;
}>) {
  return neonAddLeads(campaignId, leads);
}

export async function getRecentActivity(limit = 50) {
  const leads = await neonGetLeads(limit);
  return leads;
}

export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  return neonUpdateLead(leadId, status);
}

export async function getPipelineStats(campaignId?: string) {
  return neonStats();
}
