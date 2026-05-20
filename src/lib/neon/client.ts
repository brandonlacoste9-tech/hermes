/**
 * Neon Database Client — Direct HTTP API.
 * Uses Neon's REST API for Edge-compatible serverless access.
 */

const NEON_API_KEY = process.env.NEON_API_KEY || "napi_hln4p6najd7upjrw6zk6wwnvj2youl4nfweyil4689dx4b85jl0h4g0th7pq2iw2";
const NEON_PROJECT = "ep-blue-art-aqv8qnba";
const NEON_DB = "neondb";
const NEON_BASE = `https://${NEON_PROJECT}.apirest.c-8.us-east-1.aws.neon.tech/neondb/rest/v1`;

async function query(sql: string, params?: any[]) {
  const res = await fetch(`${NEON_BASE}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${NEON_API_KEY}`,
      "Accept": "application/json",
    },
    body: JSON.stringify({ query: sql, params }),
  });
  if (!res.ok) throw new Error(`Neon error ${res.status}: ${await res.text().catch(() => "")}`);
  return res.json();
}

export async function migrateSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      service TEXT DEFAULT '',
      niche TEXT DEFAULT '',
      market TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
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
    )
  `);
}

export async function createCampaign(name: string, service: string, niche: string, market: string) {
  const { data } = await query(
    `INSERT INTO campaigns (name, service, niche, market) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, service, niche, market]
  );
  return data?.[0];
}

export async function getCampaigns() {
  const { data } = await query(`SELECT * FROM campaigns ORDER BY created_at DESC`);
  return data || [];
}

export async function getCampaign(id: string) {
  const { data } = await query(`SELECT * FROM campaigns WHERE id = $1`, [id]);
  return data?.[0];
}

export async function addLeads(campaignId: string, leads: Array<{
  company: string; website: string; email: string; service: string; subject: string; body: string;
}>) {
  const values = leads.map((l, i) => 
    `($1, $${i*7+2}, $${i*7+3}, $${i*7+4}, $${i*7+5}, $${i*7+6}, $${i*7+7}, $${i*7+8})`
  ).join(", ");

  const params: any[] = [campaignId];
  for (const l of leads) {
    params.push(l.company, l.website, l.email, l.service, l.subject, l.body);
  }

  const { data } = await query(
    `INSERT INTO leads (campaign_id, company, website, email, service, subject, body) VALUES ${values} RETURNING *`,
    params
  );
  return data || [];
}

export async function getLeads(limit = 100) {
  const { data } = await query(`SELECT * FROM leads ORDER BY hunted_at DESC LIMIT $1`, [limit]);
  return data || [];
}

export async function updateLeadStatus(leadId: string, status: string) {
  await query(`UPDATE leads SET status = $1, sent_at = CASE WHEN $1 = 'sent' THEN NOW() ELSE sent_at END WHERE id = $2`, [status, leadId]);
}

export async function getPipelineStats() {
  const { data } = await query(`SELECT status, COUNT(*) as count FROM leads GROUP BY status`);
  const stats: Record<string, number> = {};
  for (const row of (data || [])) stats[row.status] = parseInt(row.count);
  return stats;
}
