/**
 * Firecrawl Client — Web scraping for lead enrichment.
 * Docs: https://docs.firecrawl.dev
 */

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";
const API_KEY = process.env.FIRECRAWL_API_KEY || "";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };
}

export function isConfigured(): boolean {
  return !!API_KEY;
}

export async function scrapeWebsite(url: string): Promise<{
  content: string;
  metadata: { title: string; description: string; language: string };
} | null> {
  if (!API_KEY) return null;

  try {
    const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        timeout: 15000,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    
    return {
      content: data.data?.markdown || data.data?.content || "",
      metadata: {
        title: data.data?.metadata?.title || "",
        description: data.data?.metadata?.description || "",
        language: data.data?.metadata?.language || "en",
      },
    };
  } catch {
    return null;
  }
}

export async function enrichLead(name: string, website: string): Promise<{
  description: string;
  isEnglishOnly: boolean;
  hasFrenchContent: boolean;
  employeeEstimate: string;
  keyInsights: string[];
}> {
  if (!API_KEY) {
    return {
      description: `Website: ${website}`,
      isEnglishOnly: true,
      hasFrenchContent: false,
      employeeEstimate: "Unknown",
      keyInsights: [],
    };
  }

  const scraped = await scrapeWebsite(website.startsWith("http") ? website : `https://${website}`);
  
  if (!scraped) {
    return {
      description: `Could not access ${website}`,
      isEnglishOnly: true,
      hasFrenchContent: false,
      employeeEstimate: "Unknown",
      keyInsights: [],
    };
  }

  const content = scraped.content.slice(0, 3000);
  const hasFrenchContent = /[àâäéèêëîïôöùûüçœ]/.test(content) || scraped.metadata.language === "fr";
  
  // Extract key insights from the homepage
  const insights: string[] = [];
  if (content.toLowerCase().includes("compliance")) insights.push("Mentions compliance");
  if (content.toLowerCase().includes("enterprise")) insights.push("Enterprise-focused");
  if (content.toLowerCase().includes("api")) insights.push("Has API/platform");
  if (content.toLowerCase().includes("pricing") || content.toLowerCase().includes("demo")) insights.push("Has clear CTA");

  return {
    description: scraped.metadata.description || `Website for ${name}`,
    isEnglishOnly: !hasFrenchContent,
    hasFrenchContent,
    employeeEstimate: "Unknown", // Would need LinkedIn/people data
    keyInsights: insights,
  };
}
