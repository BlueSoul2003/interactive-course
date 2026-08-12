import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const allowedOrigins = new Set([
  "https://bluesoul2003.github.io",
  "http://127.0.0.1:8765",
  "http://localhost:8765",
  "http://127.0.0.1:8877",
  "http://localhost:8877",
]);

function cors(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://bluesoul2003.github.io",
    "Access-Control-Allow-Headers": "authorization,apikey,x-client-info,content-type",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(request: Request, data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors(request),
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function environmentKey(legacyName: string, collectionName: string): string {
  const legacy = Deno.env.get(legacyName) || "";
  if (legacy) return legacy;
  try {
    const values = JSON.parse(Deno.env.get(collectionName) || "{}") as Record<string, string>;
    return values.default || Object.values(values)[0] || "";
  } catch {
    return "";
  }
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "GET") return json(request, { error: "Method not allowed." }, 405);

  const moduleId = new URL(request.url).searchParams.get("module_id") || "";
  if (!/^[a-z0-9][a-z0-9-]{1,99}$/.test(moduleId)) {
    return json(request, { error: "Invalid module ID." }, 400);
  }

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token || token === authorization) return json(request, { error: "Authentication required." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const publishableKey = environmentKey("SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEYS");
  const secretKey = environmentKey("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEYS");
  if (!supabaseUrl || !publishableKey || !secretKey) {
    return json(request, { error: "Module service configuration is unavailable." }, 503);
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user || userData.user.is_anonymous) {
    return json(request, { error: "Invalid account session." }, 401);
  }

  const { data: decision, error: decisionError } = await userClient
    .rpc("can_launch_module", { p_module_id: moduleId });
  if (decisionError) return json(request, { error: "Module access could not be checked." }, 503);
  if (decision?.allowed !== true) {
    return json(request, { error: "Module access denied.", reason: decision?.reason || "not_entitled" }, 403);
  }

  const adminClient = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: modulePackage, error: packageError } = await adminClient
    .from("module_packages")
    .select("bucket_id,storage_path,content_type,sha256_hex")
    .eq("module_id", moduleId)
    .eq("is_active", true)
    .maybeSingle();
  if (packageError || !modulePackage) return json(request, { error: "Private module package not found." }, 404);

  const { data: packageBlob, error: downloadError } = await adminClient.storage
    .from(modulePackage.bucket_id)
    .download(modulePackage.storage_path);
  if (downloadError || !packageBlob) return json(request, { error: "Private module package is unavailable." }, 503);

  const template = await packageBlob.text();
  if (await sha256Hex(template) !== modulePackage.sha256_hex) {
    console.error("protected-module package integrity mismatch", moduleId);
    return json(request, { error: "Private module package failed integrity verification." }, 503);
  }
  if (!template.includes("__MODULE_ACCESS_TOKEN_JSON__") || !template.includes("__MODULE_CSP_NONCE__")) {
    return json(request, { error: "Private module package is invalid." }, 503);
  }

  const nonce = crypto.randomUUID().replaceAll("-", "");
  const html = template
    .replaceAll("__MODULE_CSP_NONCE__", nonce)
    .replace("__MODULE_ACCESS_TOKEN_JSON__", JSON.stringify(token));

  return new Response(html, {
    status: 200,
    headers: {
      ...cors(request),
      "Cache-Control": "no-store, private",
      "Content-Type": modulePackage.content_type || "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
