import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function disableRLS() {
  try {
    console.log('Disabling RLS on report_images table...');

    // Disable RLS on report_images table
    const { error } = await supabase.rpc('disable_rls', {
      table_name: 'report_images',
    }).then(() => ({ error: null })).catch(err => ({ error: err }));

    // If RLS disable via RPC doesn't work, we'll need to do it via SQL
    // The anon key can't disable RLS directly, so we'll use a different approach
    
    console.log('Note: RLS is typically disabled via Supabase Dashboard.');
    console.log('Please follow these steps:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Navigate to Authentication > Policies');
    console.log('3. Find the "report_images" table');
    console.log('4. Click on RLS toggle to disable it');
    console.log('\nAlternatively, run this SQL in the SQL Editor:');
    console.log('ALTER TABLE report_images DISABLE ROW LEVEL SECURITY;');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

disableRLS();
