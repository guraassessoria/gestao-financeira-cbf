const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const env = {}
for (const line of fs.readFileSync('.env.production.local', 'utf8').split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue
  const idx = line.indexOf('=')
  if (idx < 0) continue
  const key = line.slice(0, idx).trim()
  let value = line.slice(idx + 1).trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1)
  }
  env[key] = value
}

async function main() {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  const { data, error } = await supabase
    .from('lancamentos_contabeis')
    .select('periodo')

  if (error) {
    throw error
  }

  const counts = new Map()
  for (const row of data || []) {
    counts.set(row.periodo, (counts.get(row.periodo) || 0) + 1)
  }

  console.log(JSON.stringify([...counts.entries()].sort(), null, 2))
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
