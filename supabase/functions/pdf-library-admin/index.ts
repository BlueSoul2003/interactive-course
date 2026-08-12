import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedOrigins = new Set([
  'https://bluesoul2003.github.io',
  'http://127.0.0.1:8765',
  'http://localhost:8765'
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://bluesoul2003.github.io',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Vary': 'Origin'
  };
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) });
  if (request.method !== 'POST') return json(request, { error: 'Method not allowed.' }, 405);

  const authorization = request.headers.get('authorization') || '';
  const jwt = authorization.replace(/^Bearer\s+/i, '');
  if (!jwt) return json(request, { error: 'Authentication required.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json(request, { error: 'Server configuration is unavailable.' }, 500);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: userData, error: userError } = await adminClient.auth.getUser(jwt);
  if (userError || !userData.user) return json(request, { error: 'Invalid account session.' }, 401);

  const { data: profile, error: profileError } = await adminClient
    .from('user_profiles')
    .select('tier')
    .eq('id', userData.user.id)
    .single();
  if (profileError || profile?.tier !== 'admin') return json(request, { error: 'Admin access required.' }, 403);

  let payload: { path?: string };
  try {
    payload = await request.json();
  } catch {
    return json(request, { error: 'Invalid request body.' }, 400);
  }

  const path = String(payload.path || '');
  if (!path.startsWith('import-7b311a65c8c54bd0a1817854c79c88ae/') || path.includes('..')) {
    return json(request, { error: 'Invalid storage path.' }, 400);
  }

  const { data: resource, error: resourceError } = await adminClient
    .from('pdf_resources')
    .select('id')
    .eq('storage_path', path)
    .eq('is_active', true)
    .single();
  if (resourceError || !resource) return json(request, { error: 'PDF is not in the private catalogue.' }, 404);

  const { data, error } = await adminClient.storage
    .from('course-pdfs')
    .createSignedUploadUrl(path, { upsert: true });
  if (error || !data?.token) return json(request, { error: error?.message || 'Upload permission failed.' }, 500);

  return json(request, { path, token: data.token });
});
