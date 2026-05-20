import sql from "@/lib/neon/client";

export async function createCampaign(name: string, service: string, niche: string, market: string) {
  const [row] = await sql`
    INSERT INTO campaigns (name, service, niche, market)
    VALUES (${name}, ${service}, ${niche}, ${market})
    RETURNING *
  `;
  return row;
}

export async function getCampaigns() {
  return await sql`SELECT * FROM campaigns ORDER BY created_at DESC`;
}

export async function getCampaign(id: string) {
  const [row] = await sql`SELECT * FROM campaigns WHERE id = ${id}`;
  return row;
}

export async function addLeadsToCampaign(campaignId: string, leads: Array<{
  company: string; website: string; email: string; service: string; subject: string; body: string;
}>) {
  const rows = await sql`
    INSERT INTO leads (campaign_id, company, website, email, service, subject, body)
    SELECT ${campaignId}, company, website, email, service, subject, body
    FROM json_to_recordset(${JSON.stringify(leads)}::json)
    AS x(company text, website text, email text, service text, subject text, body text)
    RETURNING *
  `;
  return rows;
}

export async function getRecentActivity(limit = 50) {
  return await sql`SELECT * FROM leads ORDER BY hunted_at DESC LIMIT ${limit}`;
}

export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  const updates: any = { status };
  if (status === "sent") updates.sent_at = new Date().toISOString();
  if (status === "replied") updates.replied_at = new Date().toISOString();
  if (notes) updates.notes = notes;

  await sql`
    UPDATE leads SET ${sql(updates)} WHERE id = ${leadId}
  `;
  return true;
}

export async function getPipelineStats(campaignId?: string) {
  let query: any[];
  if (campaignId) {
    query = await sql`SELECT status, COUNT(*) as count FROM leads WHERE campaign_id = ${campaignId} GROUP BY status`;
  } else {
    query = await sql`SELECT status, COUNT(*) as count FROM leads GROUP BY status`;
  }

  const stats: Record<string, number> = { total: 0 };
  for (const row of query) {
    stats[row.status] = parseInt(row.count);
    stats.total += parseInt(row.count);
  }
  return stats;
}
