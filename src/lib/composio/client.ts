/**
 * Composio Client — Universal tool integrations for Hermes agents.
 *
 * Docs: https://docs.composio.dev
 * Endpoint: https://backend.composio.dev/api/v1
 */

const COMPOSIO_BASE = "https://backend.composio.dev/api/v1";

export interface ComposioTool {
  name: string;
  description: string;
  category: string;
  logo?: string;
}

export interface ConnectedAccount {
  id: string;
  appName: string;
  status: "connected" | "disconnected" | "expired";
  connectedAt?: string;
}

export interface AgentTool {
  toolName: string;
  appName: string;
  connected: boolean;
}

function getHeaders(): HeadersInit {
  const key = process.env.COMPOSIO_API_KEY;
  if (!key) throw new Error("COMPOSIO_API_KEY not configured");
  return {
    "Content-Type": "application/json",
    "X-API-Key": key,
  };
}

// ── Tools ────────────────────────────────────────────────────────────────────

export async function listAvailableTools(): Promise<ComposioTool[]> {
  const res = await fetch(`${COMPOSIO_BASE}/tools`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Composio tools fetch failed: ${res.status}`);
  const data = await res.json();
  return (data.items || data.tools || []).map((t: any) => ({
    name: t.name || t.toolName,
    description: t.description || "",
    category: t.category || t.appName || "other",
    logo: t.logo || t.icon,
  }));
}

// ── Connected Accounts ───────────────────────────────────────────────────────

export async function listConnectedAccounts(): Promise<ConnectedAccount[]> {
  const res = await fetch(`${COMPOSIO_BASE}/connectedAccounts`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Composio accounts fetch failed: ${res.status}`);
  const data = await res.json();
  return (data.items || []).map((a: any) => ({
    id: a.id,
    appName: a.appName || a.app,
    status: a.status || "connected",
    connectedAt: a.createdAt || a.connected_at,
  }));
}

// ── Initiate Connection ──────────────────────────────────────────────────────

export async function initiateConnection(
  appName: string,
  redirectUrl: string
): Promise<{ connectionId: string; authUrl: string }> {
  const res = await fetch(`${COMPOSIO_BASE}/connectedAccounts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      appName,
      redirectUrl,
      integrationId: appName,
    }),
  });
  if (!res.ok) throw new Error(`Composio connection init failed: ${res.status}`);
  const data = await res.json();
  return {
    connectionId: data.connectionId || data.id,
    authUrl: data.authUrl || data.redirectUrl,
  };
}

// ── Execute Tool ─────────────────────────────────────────────────────────────

export async function executeTool(
  toolName: string,
  params: Record<string, any>,
  connectedAccountId?: string
): Promise<any> {
  const res = await fetch(`${COMPOSIO_BASE}/tools/execute`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      toolName,
      parameters: params,
      connectedAccountId,
    }),
  });
  if (!res.ok) throw new Error(`Composio tool execution failed: ${res.status}`);
  return res.json();
}

// ── API Route Handlers ───────────────────────────────────────────────────────

export async function handleListTools() {
  try {
    const tools = await listAvailableTools();
    return Response.json({ tools });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function handleListAccounts() {
  try {
    const accounts = await listConnectedAccounts();
    return Response.json({ accounts });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function handleConnect(req: Request) {
  try {
    const { app, redirectUrl } = await req.json();
    const result = await initiateConnection(app, redirectUrl || process.env.NEXT_PUBLIC_SITE_URL);
    return Response.json(result);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
