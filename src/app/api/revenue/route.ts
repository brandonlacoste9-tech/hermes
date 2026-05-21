import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const db = supabase();
    
    // Pipeline stats
    const { data: leads } = await db.from("leads").select("status");
    const statusCounts: Record<string, number> = {};
    if (leads) leads.forEach((l: any) => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });

    // Campaign stats
    const { data: campaigns } = await db.from("campaigns").select("*");
    
    // Revenue: count paid leads
    const paidCount = statusCounts["paid"] || 0;
    const totalLeads = leads?.length || 0;
    const conversionRate = totalLeads > 0 ? ((paidCount / totalLeads) * 100).toFixed(1) : "0";
    const pipelineValue = `$${paidCount * 49}`; // $49/report

    return NextResponse.json({
      pipeline: statusCounts,
      totalLeads,
      paidLeads: paidCount,
      conversionRate: `${conversionRate}%`,
      pipelineValue,
      costPerLead: `$${(0.005).toFixed(3)}`, // API cost per lead
      campaigns: campaigns?.length || 0,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
