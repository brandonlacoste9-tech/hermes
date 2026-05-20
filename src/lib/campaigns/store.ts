/**
 * Campaign Store — Supabase-backed persistent storage.
 */

import {
  createCampaign as dbCreateCampaign,
  getCampaigns as dbGetCampaigns,
  getCampaign as dbGetCampaign,
  addLeads as dbAddLeads,
  getLeads as dbGetLeads,
  updateLeadStatus as dbUpdateLeadStatus,
  getPipelineStats as dbGetPipelineStats,
} from "@/lib/supabase/client";

export async function createCampaign(name: string, service: string, niche: string, market: string) {
  return dbCreateCampaign(name, service, niche, market);
}

export async function getCampaigns() {
  return dbGetCampaigns();
}

export async function getCampaign(id: string) {
  return dbGetCampaign(id);
}

export async function addLeadsToCampaign(campaignId: string, leads: Array<{
  company: string; website: string; email: string; service: string; subject: string; body: string;
}>) {
  return dbAddLeads(campaignId, leads);
}

export async function getRecentActivity(limit = 50) {
  const leads = await dbGetLeads();
  return leads.slice(0, limit);
}

export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  return dbUpdateLeadStatus(leadId, status, notes);
}

export async function getPipelineStats(campaignId?: string) {
  return dbGetPipelineStats(campaignId);
}
