import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Admin client with Service Role Key - use this for backend admin tasks ONLY.
// NEVER use this for auth operations (signIn, signUp) as it is a singleton and will persist the session.
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Helper to create a fresh client for auth operations (login, register, oauth)
// This ensures we don't share session state between requests.
export const createAuthClient = () => {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY, // Fallback if anon key missing, but prefer anon
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
};


