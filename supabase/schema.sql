-- HermesOS Schema — Campaigns & Leads
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service TEXT DEFAULT '',
  niche TEXT DEFAULT '',
  market TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
);

CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
