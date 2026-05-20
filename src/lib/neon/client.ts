import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.NEON_DATABASE_URL || 
  "postgresql://neondb_owner:npg_xNrVoecnqi47@ep-blue-art-aqv8qnba-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DATABASE_URL);

export default sql;

export async function migrateNeonSchema() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, service TEXT DEFAULT '', niche TEXT DEFAULT '', market TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS leads (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE, company TEXT NOT NULL, website TEXT DEFAULT '', email TEXT DEFAULT '', service TEXT DEFAULT '', status TEXT DEFAULT 'hunted', subject TEXT DEFAULT '', body TEXT DEFAULT '', hunted_at TIMESTAMPTZ DEFAULT NOW(), sent_at TIMESTAMPTZ, replied_at TIMESTAMPTZ, notes TEXT DEFAULT '')`;
    console.log("[Neon] Schema ready");
  } catch (e: any) { console.warn("[Neon]", e.message); }
}
