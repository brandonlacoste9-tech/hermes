import { NextResponse } from "next/server";

const APPS = [
  { name:"HermesOS", url:"hermes-red-tau.vercel.app", repo:"brandonlacoste9-tech/hermes", dir:"hermes", type:"AI SaaS" },
  { name:"NordiqueCompliance", url:"quebec-compliance.vercel.app", repo:"brandonlacoste9-tech/quebec-compliance", dir:"quebec-compliance", type:"Compliance" },
  { name:"PontCompliance", url:"pont-compliance.vercel.app", repo:"brandonlacoste9-tech/pont-compliance", dir:"pont-compliance", type:"Compliance" },
  { name:"StaffX", url:"digital-employee-blueprint.vercel.app", repo:"brandonlacoste9-tech/digital-employee-blueprint", dir:"digital-employee-blueprint", type:"Platform" },
  { name:"Cyberhound", url:"cyberhound-web.vercel.app", repo:"brandonlacoste9-tech/Cyberhound", dir:"Cyberhound/Cyberhound", type:"AI Swarm" },
  { name:"Zyeute", url:"zyeute.com", repo:"brandonlacoste9-tech/ZyeuteV5", dir:"ZyeuteV5", type:"Social" },
  { name:"FlowGuru", url:"flow-guru-web.vercel.app", repo:"brandonlacoste9-tech/flow-guru-web", dir:"flow-guru-web", type:"AI Assistant" },
  { name:"Zipd", url:"zipd.vercel.app", repo:"brandonlacoste9-tech/v0-linksnip-dashboard", dir:"v0-linksnip-dashboard", type:"SaaS" },
  { name:"Trades Canada", url:"trades-canada.vercel.app", repo:"brandonlacoste9-tech/trades-canada-v2", dir:"trades-canada-v2-new", type:"Lead Gen" },
  { name:"Koloni", url:"koloni.vercel.app", repo:"brandonlacoste9-tech/adgenxai", dir:"adgenxai", type:"Creator" },
  { name:"Korean AI Comp", url:"korean-ai.vercel.app", repo:"brandonlacoste9-tech/korean-AI-compliance-", dir:"korean-AI-compliance-", type:"Regulatory" },
  { name:"QMetier", url:"qmetier.vercel.app", repo:"brandonlacoste9-tech/QMETIER-", dir:"QMETIER-", type:"Jobs" },
  { name:"Trades USA", url:"trades-usa.vercel.app", repo:"brandonlacoste9-tech/trades-usa-v2", dir:"trades-usa-v2", type:"Lead Gen" },
  { name:"TruckerHub", url:"truckerhub.vercel.app", repo:"brandonlacoste9-tech/truckerhub", dir:"truckerhub", type:"Logistics" },
  { name:"KryptTrac", url:"krypttrac.com", repo:"brandonlacoste9-tech/krypttrac.com", dir:"krypttrac.com", type:"Crypto" },
  { name:"Wacke", url:"wacke.vercel.app", repo:"brandonlacoste9-tech/Wacke", dir:"Wacke", type:"Streaming" },
  { name:"MAX", url:"max.vercel.app", repo:"brandonlacoste9-tech/max", dir:"max", type:"AI Platform" },
  { name:"ReceiptTrac", url:"receipttrac.com", repo:"brandonlacoste9-tech/receipttrac.com", dir:"receipttrac.com", type:"SaaS" },
  { name:"Cyber Deals", url:"cyber-deals.vercel.app", repo:"brandonlacoste9-tech/cyber-deals", dir:"cyber-deals", type:"Marketplace" },
  { name:"Q-Emplois", url:"q-emplois.vercel.app", repo:"brandonlacoste9-tech/q-emplois", dir:"q-emplois", type:"Jobs" },
  { name:"Pulse", url:"pulse.vercel.app", repo:"brandonlacoste9-tech/pulse", dir:"pulse", type:"Social" },
  { name:"Colony OS", url:"colony-os.vercel.app", repo:"brandonlacoste9-tech/colony-os-magnum-opus", dir:"colony-os-magnum-opus", type:"AI Platform" },
  { name:"BOUNTY", url:"bounty.vercel.app", repo:"brandonlacoste9-tech/bounty", dir:"bounty", type:"AI Scraper" },
  { name:"Bill 96 Buddy", url:"bill96buddy.vercel.app", repo:"brandonlacoste9-tech/BILL-96-BUDDY", dir:"BILL-96-BUDDY", type:"Compliance" },
  { name:"Quebec Nightlife", url:"quebec-nightlife.vercel.app", repo:"brandonlacoste9-tech/quebec-nightlife-", dir:"quebec-nightlife-", type:"Content" },
  { name:"Vraie Quebec", url:"vraie-quebec.vercel.app", repo:"brandonlacoste9-tech/Vraie-Quebec", dir:"Vraie-Quebec", type:"Content" },
  { name:"KalTrac", url:"kaltrac.vercel.app", repo:"brandonlacoste9-tech/Kaltrac", dir:"Kaltrac", type:"Health" },
  { name:"Pickleball QC", url:"pickleball-qc.vercel.app", repo:"brandonlacoste9-tech/v0-quebec-pickleball-directory", dir:"v0-quebec-pickleball-directory", type:"Directory" },
  { name:"Kryptotrac", url:"kryptotrac.vercel.app", repo:"brandonlacoste9-tech/Kryptotrac", dir:"Kryptotrac", type:"Tracker" },
  { name:"Planexa", url:"planexa.vercel.app", repo:"brandonlacoste9-tech/Planexa", dir:"Planexa", type:"SaaS" },
];

async function checkUrl(url: string): Promise<"live" | "down" | "unknown"> {
  try {
    const res = await fetch(`https://${url}`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) return "live";
    if (res.status === 404) return "down";
    return "down";
  } catch {
    return "unknown";
  }
}

export async function GET() {
  const results = [];
  for (const app of APPS) {
    const status = await checkUrl(app.url);
    results.push({
      ...app,
      status: status === "live" ? "deployed" : status === "down" ? "broken" : "needs_deploy",
      health: status,
    });
  }

  const deployed = results.filter(r => r.status === "deployed").length;
  const needsDeploy = results.filter(r => r.status === "needs_deploy").length;
  const broken = results.filter(r => r.status === "broken").length;

  return NextResponse.json({
    apps: results,
    summary: { total: results.length, deployed, needsDeploy, broken },
  });
}
