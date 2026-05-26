import { spawn } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Parse environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target keys from env file - fallback to Vite specific keys
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'undefined' || supabaseUrl.includes('your-supabase-project-id')) {
  console.error('\x1b[31m[Supabase MCP] ERROR: SUPABASE_URL (or VITE_SUPABASE_URL) is not set in your .env or .env.example file!\x1b[0m');
  console.log('Please double check your configuration in the Database Panel.');
  process.exit(1);
}

if (!supabaseKey || supabaseKey === 'undefined' || supabaseKey.includes('your-supabase-anon-public-key')) {
  console.error('\x1b[31m[Supabase MCP] ERROR: SUPABASE_API_KEY or VITE_SUPABASE_ANON_KEY is not configured in your .env!\x1b[0m');
  console.log('To run writing schema queries, providing the service role key as SUPABASE_SERVICE_ROLE_KEY is highly recommended.');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[32m%s\x1b[0m', '⚡ BOOTING UP ROTARY SUPABASE MODEL CONTEXT PROTOCOL');
console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log(`📡 URL target: ${supabaseUrl}`);
console.log(`🔐 Authorization Mode: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Full Admin (Service Role Key)' : 'Limited Client (Anon Key)'}`);
console.log(`🛠️ Connecting via PostgREST MCP Server...`);
console.log(`🚀 Executing npx command...`);
console.log('\x1b[35m%s\x1b[0m', 'Listening for input instructions. Connect your MCP client (Cursor/Claude App/Windsurf) now!');

// Build environment for spawn
const env = {
  ...process.env,
  SUPABASE_URL: supabaseUrl,
  SUPABASE_API_KEY: supabaseKey,
  // Ensure npx doesn't prompt for confirmation
  npm_config_yes: 'true'
};

// Spawn npx @supabase/mcp-server-postgrest
const mcpProcess = spawn('npx', ['-y', '@supabase/mcp-server-postgrest'], {
  env,
  stdio: 'inherit',
  shell: true
});

mcpProcess.on('error', (err) => {
  console.error('\x1b[31mFailed to start Supabase MCP server:\x1b[0m', err);
});

mcpProcess.on('close', (code) => {
  console.log(`\n\x1b[33mSupabase MCP server exited with code ${code}\x1b[0m`);
});
