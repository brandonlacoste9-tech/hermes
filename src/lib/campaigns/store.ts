// In-memory campaign store (Vercel-compatible)
// For Neon persistence, see src/lib/neon/client.ts

interface Lead {
  id: string; company: string; website: string; email: string; service: string;
  status: string; subject: string; body: string; huntedAt: string; sentAt?: string; repliedAt?: string; notes: string;
}
interface Campaign { id: string; name: string; service: string; niche: string; market: string; createdAt: string; leads: Lead[]; }

let campaigns: Campaign[] = [];

export async function createCampaign(name: string, service: string, niche: string, market: string) {
  const c: Campaign = { id: `camp_${Date.now()}`, name, service, niche, market, createdAt: new Date().toISOString(), leads: [] };
  campaigns.unshift(c);
  return c;
}

export async function getCampaigns() { return campaigns; }
export async function getCampaign(id: string) { return campaigns.find(c => c.id === id); }

export async function addLeadsToCampaign(campaignId: string, leads: Array<{
  company: string; website: string; email: string; service: string; subject: string; body: string;
}>) {
  const camp = campaigns.find(c => c.id === campaignId);
  if (!camp) return [];
  const newLeads = leads.map(l => ({
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    company: l.company, website: l.website, email: l.email, service: l.service,
    status: "hunted", subject: l.subject, body: l.body,
    huntedAt: new Date().toISOString(), notes: "",
  } as Lead));
  camp.leads.push(...newLeads);
  return newLeads;
}

export async function getRecentActivity(limit = 50) {
  return campaigns.flatMap(c => c.leads).sort((a, b) => new Date(b.huntedAt).getTime() - new Date(a.huntedAt).getTime()).slice(0, limit);
}

export async function updateLeadStatus(leadId: string, status: string) {
  for (const c of campaigns) {
    const l = c.leads.find(l => l.id === leadId);
    if (l) { l.status = status; if (status === "sent") l.sentAt = new Date().toISOString(); return true; }
  }
  return false;
}

export async function getPipelineStats() {
  const all = campaigns.flatMap(c => c.leads);
  const stats: Record<string, number> = { total: all.length };
  for (const s of ["hunted","sent","opened","replied","booked","closed_won","closed_lost","bounced"]) {
    stats[s] = all.filter(l => l.status === s).length;
  }
  return stats;
}
