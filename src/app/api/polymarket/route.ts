import { NextResponse } from "next/server";

const GAMMA_API = "https://gamma-api.polymarket.com";
const CLOB_API = "https://clob.polymarket.com";

interface Market {
  id: string;
  question: string;
  slug: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  change24h: number;
}

async function fetchMarkets(categories: string[]): Promise<Market[]> {
  const results: Market[] = [];
  
  for (const cat of categories) {
    try {
      const res = await fetch(`${GAMMA_API}/markets?closed=false&limit=10&tag=${cat}`);
      const markets = await res.json();
      
      for (const m of markets) {
        const prices = typeof m.outcomePrices === "string" 
          ? JSON.parse(m.outcomePrices) 
          : m.outcomePrices || [];
        
        const yesPrice = parseFloat(prices[0] || "0");
        const noPrice = parseFloat(prices[1] || "0");
        const volume = parseFloat(m.volume || "0");
        
        // Get historical price for 24h change
        let change24h = 0;
        try {
          const clobTokenIds = typeof m.clobTokenIds === "string"
            ? JSON.parse(m.clobTokenIds)
            : m.clobTokenIds || [];
          
          if (clobTokenIds[0]) {
            const histRes = await fetch(
              `${CLOB_API}/prices-history?market=${clobTokenIds[0]}&interval=max&fidelity=1440`
            );
            const hist = await histRes.json();
            const prices24h = hist?.history?.slice(-2) || [];
            if (prices24h.length >= 2) {
              const prev = parseFloat(prices24h[0]?.p || "0");
              change24h = prev > 0 ? ((yesPrice - prev) / prev) * 100 : 0;
            }
          }
        } catch {}
        
        results.push({
          id: m.id,
          question: m.question || m.title || "Unknown",
          slug: m.slug || "",
          yesPrice,
          noPrice,
          volume,
          liquidity: parseFloat(m.liquidity || "0"),
          change24h,
        });
      }
    } catch {}
  }
  
  return results;
}

export async function GET() {
  const categories = ["crypto", "politics", "ai", "sports", "macro"];
  const markets = await fetchMarkets(categories);
  
  // Filter for significant movements (>8% in 24h or extreme probability)
  const alerts = markets.filter(m => 
    Math.abs(m.change24h) > 8 || 
    m.yesPrice > 0.85 || 
    m.yesPrice < 0.15
  ).sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
  
  const bigMoves = alerts.filter(a => Math.abs(a.change24h) >= 25);
  const moderateMoves = alerts.filter(a => Math.abs(a.change24h) >= 8 && Math.abs(a.change24h) < 25);
  const extremePrices = alerts.filter(a => (a.yesPrice > 0.85 || a.yesPrice < 0.15) && Math.abs(a.change24h) < 8);
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    total_scanned: markets.length,
    alerts: alerts.length,
    breakdown: {
      big_moves_25pct: bigMoves.length,
      moderate_moves_8pct: moderateMoves.length,
      extreme_prices: extremePrices.length,
    },
    urgent: bigMoves.map(m => ({
      question: m.question,
      yes: `${(m.yesPrice * 100).toFixed(1)}%`,
      change: `${m.change24h > 0 ? '+' : ''}${m.change24h.toFixed(1)}%`,
      volume: `$${(m.volume / 1000).toFixed(0)}K`,
      alert: m.change24h >= 25 ? '🚨 25%+ MOVE' : '⚠️ SIGNIFICANT',
    })),
    watch: moderateMoves.slice(0, 10).map(m => ({
      question: m.question,
      yes: `${(m.yesPrice * 100).toFixed(1)}%`,
      change: `${m.change24h > 0 ? '+' : ''}${m.change24h.toFixed(1)}%`,
      volume: `$${(m.volume / 1000).toFixed(0)}K`,
    })),
  });
}
