import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const db = supabase();
    
    // Find leads sent more than 3 days ago with no reply
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    
    const { data: staleLeads } = await db.from("leads")
      .select("*")
      .eq("status", "sent")
      .lt("sent_at", threeDaysAgo)
      .limit(10);

    if (!staleLeads?.length) {
      return NextResponse.json({ dripped: 0, message: "No stale leads" });
    }

    // For now, just mark them as "followed_up"
    for (const lead of staleLeads) {
      await db.from("leads").update({ 
        status: "followed_up",
        notes: `Auto follow-up triggered after 3 days of no reply.`
      }).eq("id", lead.id);
    }

    return NextResponse.json({ 
      dripped: staleLeads.length,
      leads: staleLeads.map(l => l.company),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
