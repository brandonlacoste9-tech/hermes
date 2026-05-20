import { NextRequest } from "next/server";
import { handleListTools, handleListAccounts, handleConnect } from "@/lib/composio/client";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "tools";

  if (action === "accounts") {
    return handleListAccounts();
  }
  return handleListTools();
}

export async function POST(req: NextRequest) {
  return handleConnect(req);
}
