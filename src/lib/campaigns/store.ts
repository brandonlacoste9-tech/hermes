/**
 * Campaign Store — Persistent lead pipeline tracking.
 * Uses in-memory + JSON file persistence for Vercel.
 * Upgrade to Supabase for permanent storage.
 */

import fs from "fs";
import path from "path";

const DATA_DIR = "/tmp/hermesos";
const CAMPAIGNS_FILE = path.join(DATA_DIR, "campaigns.json");

export interface Lead {
  id: string;
  company: string;
  website: string;
  email: string;
  service: string;
  status: "hunted" | "sent" | "opened" | "replied" | "booked" | "closed_won" | "closed_lost" | "bounced";
  subject: string;
  body: string;
  huntedAt: string;
  sentAt?: string;
  repliedAt?: string;
  notes: string;
}

export interface Campaign {
  id: string;
  name: string;
  service: string;
  niche: string;
  market: string;
  createdAt: string;
  leads: Lead[];
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadCampaigns(): Campaign[] {
  ensureDir();
  try {
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      return JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveCampaigns(campaigns: Campaign[]) {
  ensureDir();
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
}

export function getCampaigns(): Campaign[] {
  return loadCampaigns();
}

export function getCampaign(id: string): Campaign | undefined {
  return loadCampaigns().find(c => c.id === id);
}

export function createCampaign(name: string, service: string, niche: string, market: string): Campaign {
  const campaigns = loadCampaigns();
  const campaign: Campaign = {
    id: `camp_${Date.now()}`,
    name,
    service,
    niche,
    market,
    createdAt: new Date().toISOString(),
    leads: [],
  };
  campaigns.push(campaign);
  saveCampaigns(campaigns);
  return campaign;
}

export function addLeads(campaignId: string, leads: Omit<Lead, "id" | "status" | "huntedAt" | "notes">[]): Lead[] {
  const campaigns = loadCampaigns();
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) return [];

  const newLeads: Lead[] = leads.map(l => ({
    ...l,
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    status: "hunted" as const,
    huntedAt: new Date().toISOString(),
    notes: "",
  }));

  campaign.leads.push(...newLeads);
  saveCampaigns(campaigns);
  return newLeads;
}

export function updateLeadStatus(leadId: string, status: Lead["status"], notes?: string): boolean {
  const campaigns = loadCampaigns();
  for (const c of campaigns) {
    const lead = c.leads.find(l => l.id === leadId);
    if (lead) {
      lead.status = status;
      if (status === "sent") lead.sentAt = new Date().toISOString();
      if (status === "replied") lead.repliedAt = new Date().toISOString();
      if (notes) lead.notes = notes;
      saveCampaigns(campaigns);
      return true;
    }
  }
  return false;
}

export function getPipelineStats(campaignId?: string) {
  const campaigns = loadCampaigns();
  const target = campaignId
    ? campaigns.filter(c => c.id === campaignId)
    : campaigns;
  
  const allLeads = target.flatMap(c => c.leads);
  
  return {
    total: allLeads.length,
    hunted: allLeads.filter(l => l.status === "hunted").length,
    sent: allLeads.filter(l => l.status === "sent").length,
    opened: allLeads.filter(l => l.status === "opened").length,
    replied: allLeads.filter(l => l.status === "replied").length,
    booked: allLeads.filter(l => l.status === "booked").length,
    closed_won: allLeads.filter(l => l.status === "closed_won").length,
    closed_lost: allLeads.filter(l => l.status === "closed_lost").length,
    bounced: allLeads.filter(l => l.status === "bounced").length,
  };
}

export function getRecentActivity(limit = 20) {
  const campaigns = loadCampaigns();
  const allLeads = campaigns.flatMap(c => c.leads.map(l => ({ ...l, campaign: c.name })));
  return allLeads
    .sort((a, b) => new Date(b.huntedAt).getTime() - new Date(a.huntedAt).getTime())
    .slice(0, limit);
}
