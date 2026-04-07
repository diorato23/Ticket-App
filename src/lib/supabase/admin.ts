import { createClient } from "@supabase/supabase-js";

// Ensure this client is ONLY used in Server Actions or APIs, never in client components.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase Service Role configuration");
  }

  // createClient inside @supabase/supabase-js with service role ignores RLS policies
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
