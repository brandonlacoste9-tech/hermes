import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

export async function POST(req: NextRequest) {
  if (!STRIPE_KEY) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const stripe = new Stripe(STRIPE_KEY);
  const signature = req.headers.get("stripe-signature") || "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = WEBHOOK_SECRET 
      ? stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
      : JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || "";
    const plan = session.metadata?.plan || "single";
    const url = session.metadata?.url || "";
    const amount = (session.amount_total || 0) / 100;

    // 1. Update pipeline
    try {
      const { supabase } = await import("@/lib/supabase/client");
      // Find lead by email
      const { data: leads } = await supabase().from("leads").select("id").eq("email", email).limit(1);
      if (leads?.length) {
        await supabase().from("leads").update({ 
          status: "paid", 
          notes: `Paid $${amount} for ${plan} report. URL: ${url}` 
        }).eq("id", leads[0].id);
      }
    } catch {}

    // 2. Send Telegram alert
    if (TELEGRAM_BOT_TOKEN) {
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_HOME_CHANNEL || "",
            text: `💰 SALE: $${amount} for Bill 96 report\n📧 ${email}\n🔗 ${url}\n📋 Plan: ${plan}`,
          }),
        });
      } catch {}
    }

    return NextResponse.json({ 
      ok: true, 
      event: "checkout.session.completed",
      email,
      amount,
      plan,
    });
  }

  return NextResponse.json({ ok: true, event: event.type });
}
