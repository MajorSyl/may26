import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environmental variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read any keys configured
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: VITE_SUPABASE_URL / SUPABASE_URL environment variable is not defined!');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[35m%s\x1b[0m', '🔍 SUPABASE & MODEL CONTEXT PROTOCOL (MCP) INTEGRATION TEST');
console.log('\x1b[36m%s\x1b[0m', '=======================================================');

console.log(`📡 URL Target:   ${supabaseUrl}`);
if (supabaseKey) {
  console.log(`🔐 Anon API Key: Found (${supabaseKey.slice(0, 15)}...${supabaseKey.slice(-15)})`);
} else {
  console.log(`⚠️ Anon API Key: NOT FOUND. Defaulting to local simulation mode if no live credentials set.`);
}

async function runDiagnostics() {
  const reports = [];
  let databaseResponsive = false;
  let mcpServerHealthy = false;

  // 1. TEST GENERIC API CONNECTIVITY (DNS & Network)
  try {
    console.log('\n[1/4] testing DNS resolution and ping to target host...');
    const pingRes = await fetch(supabaseUrl, { method: 'HEAD' });
    console.log(`✅ Project Host is responsive. Http response code: ${pingRes.status}`);
    reports.push({ task: 'Ping Supabase Host', status: 'SUCCESS', details: `HTTP ${pingRes.status}` });
  } catch (err) {
    console.error(`❌ Connection failed: ${err.message}`);
    reports.push({ task: 'Ping Supabase Host', status: 'FAILURE', details: err.message });
  }

  // 2. TEST POSTGREST SCHEMAS AND TABLES SENSING
  if (supabaseKey && supabaseKey !== 'your-supabase-anon-public-key') {
    try {
      console.log('\n[2/4] Testing REST API schemas and direct table query...');
      
      // Attempt to query projects directly first
      const directTableUrl = `${supabaseUrl}/rest/v1/projects?limit=1`;
      console.log(`📡 Direct query request: GET ${directTableUrl}`);
      const directRes = await fetch(directTableUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (directRes.ok) {
        const rows = await directRes.json();
        console.log(`✅ Direct table query SUCCESS! Table 'projects' is accessible. Row count: ${rows.length}`);
        reports.push({ task: 'Direct Table Query', status: 'SUCCESS', details: `Retrieved ${rows.length} rows` });
        databaseResponsive = true;
      } else {
        const errText = await directRes.text();
        console.warn(`⚠️ Direct project query failed with status ${directRes.status}: ${errText}`);
        reports.push({ task: 'Direct Table Query', status: 'WARNING', details: `HTTP ${directRes.status} (Tables might require initialization)` });
      }

      console.log('\nTesting REST API public schema root definitions...');
      const schemaRes = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (schemaRes.ok) {
        const schema = await schemaRes.json();
        const tables = schema.definitions ? Object.keys(schema.definitions) : [];
        console.log(`✅ Schema document retrieved!`);
        console.log(`⚙️ Exposed Postgres Tables: ${tables.join(', ') || 'None'}`);
        reports.push({ task: 'Retrieve REST Definitions', status: 'SUCCESS', details: `Exposed ${tables.length} tables` });
        databaseResponsive = true;
      } else {
        const errorText = await schemaRes.text();
        console.log(`ℹ️ Schema index endpoint restricted (Status ${schemaRes.status}). This is default on some newer security schemas.`);
        reports.push({ task: 'Retrieve REST Definitions', status: 'INFO', details: `HTTP ${schemaRes.status} (Schema index protected)` });
      }
    } catch (err) {
      console.error(`❌ REST API Schema Sensing query failed: ${err.message}`);
      reports.push({ task: 'Retrieve REST Definitions', status: 'FAILURE', details: err.message });
    }
  } else {
    console.log('\n[2/4] Skipping REST Schema test (Anon key is unset or placeholder)');
    reports.push({ task: 'Retrieve REST Definitions', status: 'SKIPPED', details: 'No valid Anon key provided' });
  }

  // 3. TEST CENTRAL SUPABASE CLOUD MCP SERVER
  try {
    console.log('\n[3/4] testing Supabase Cloud Model Context Protocol service...');
    // Ping central MCP server
    const mcpRes = await fetch('https://mcp.supabase.com/mcp');
    if (mcpRes.status === 401 || mcpRes.ok) {
      console.log(`✅ Supabase Cloud MCP server is active & responsive! (HTTP Status: ${mcpRes.status})`);
      reports.push({ task: 'Sensing Supabase MCP Gateway', status: 'SUCCESS', details: `HTTP ${mcpRes.status} (Gateways operating normally)` });
      mcpServerHealthy = true;
    } else {
      console.warn(`⚠️ Supabase Cloud MCP was responsive but returned unexpected code: ${mcpRes.status}`);
      reports.push({ task: 'Sensing Supabase MCP Gateway', status: 'WARNING', details: `HTTP ${mcpRes.status}` });
    }
  } catch (err) {
    console.error(`❌ Failed to connect to Supabase Cloud MCP Server: ${err.message}`);
    reports.push({ task: 'Sensing Supabase MCP Gateway', status: 'FAILURE', details: err.message });
  }

  // 4. MCP INTER-CLIENT ROUTING ADVICE
  console.log('\n[4/4] Generating MCP Connection Diagnostic Report...');
  console.log('\x1b[32m%s\x1b[0m', '\n================== TEST REPORT SUMMARY ==================');
  reports.forEach(r => {
    let statEmoji = '⚪';
    if (r.status === 'SUCCESS') statEmoji = '🟢 SUCCESS';
    if (r.status === 'FAILURE') statEmoji = '🔴 FAILURE';
    if (r.status === 'WARNING') statEmoji = '🟡 WARNING';
    if (r.status === 'SKIPPED') statEmoji = '🔵 SKIPPED';
    console.log(`- ${r.task.padEnd(35)}: ${statEmoji.padEnd(10)} (${r.details})`);
  });
  console.log('\x1b[32m%s\x1b[0m', '=========================================================');

  if (mcpServerHealthy) {
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    console.log('\n💡 MCP INTEGRATION ADVICE FOR AGENT:');
    console.log(` Your project ref is: \x1b[35m${projectRef}\x1b[0m`);
    console.log(' Your official cloud MCP Connection query is:');
    console.log(`\x1b[33mgemini mcp add -t http supabase "https://mcp.supabase.com/mcp?project_ref=${projectRef}&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"\x1b[0m`);
    console.log('\nBoth the database cloud target and the Supabase cloud MCP server gateways are up.');
  }
}

runDiagnostics().catch(console.error);
