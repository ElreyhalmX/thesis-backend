import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!supabaseKey) missing.push("SUPABASE_KEY");
  throw new Error(
    `Missing environment variable(s): ${missing.join(
      ", "
    )}. Please set them in Render (Dashboard → Environment → Environment Variables) or in your environment before starting the app.`
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
