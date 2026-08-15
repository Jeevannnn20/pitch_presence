// Seed the Supabase question bank from the static content files.
//
// Idempotent: re-running upserts on natural keys (tracks.key, companies(track_id,slug),
// prompts(company_id,slug)), so it's safe to run repeatedly as content evolves.
//
// Requires (server-side secrets — NOT the VITE_ anon key):
//   SUPABASE_URL                (or VITE_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS to write the catalog)
//
// Run after applying supabase/migrations/0002_question_bank.sql:
//   node --env-file=.env scripts/seedQuestionBank.mjs
//   (or: npm run seed:questionbank)

import { createClient } from '@supabase/supabase-js'
import { interviewPacks } from '../src/data/interviewPacks.js'
import { trackMeta } from '../src/data/trackMeta.js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    'Missing env. Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY, then rerun.\n' +
      'Example: node --env-file=.env scripts/seedQuestionBank.mjs'
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

async function upsertReturning(table, row, onConflict) {
  const { data, error } = await supabase.from(table).upsert(row, { onConflict }).select('id').single()
  if (error) throw new Error(`${table} upsert failed for ${JSON.stringify(onConflict)}: ${error.message}`)
  return data.id
}

async function seed() {
  let trackCount = 0
  let companyCount = 0
  let promptCount = 0

  for (let t = 0; t < trackMeta.length; t += 1) {
    const meta = trackMeta[t]
    const pack = interviewPacks[meta.key]
    if (!pack) {
      console.warn(`! No interviewPacks entry for track "${meta.key}" — skipping.`)
      continue
    }

    const trackId = await upsertReturning(
      'tracks',
      {
        key: meta.key,
        label: pack.label || meta.key,
        category: meta.category,
        subtitle: meta.subtitle || null,
        focus: meta.focus || null,
        icon_key: meta.iconKey || null,
        sort_order: t,
        is_active: true
      },
      'key'
    )
    trackCount += 1

    const targets = pack.targets || []
    for (let c = 0; c < targets.length; c += 1) {
      const target = targets[c]
      const companyId = await upsertReturning(
        'companies',
        {
          track_id: trackId,
          slug: target.id,
          name: target.name,
          style: target.style || null,
          source_basis: target.sourceBasis || null,
          reference_links: target.referenceLinks || [],
          focus: target.focus || null,
          rubric: target.rubric || [],
          sort_order: c,
          is_active: true
        },
        'track_id,slug'
      )
      companyCount += 1

      const prompts = target.prompts || []
      for (let p = 0; p < prompts.length; p += 1) {
        const prompt = prompts[p]
        await upsertReturning(
          'prompts',
          {
            company_id: companyId,
            slug: prompt.id,
            title: prompt.title,
            text: prompt.text,
            answer_key: prompt.answerKey || null,
            sort_order: p,
            is_active: true
          },
          'company_id,slug'
        )
        promptCount += 1
      }
    }
    console.log(`✓ ${meta.key}: ${targets.length} companies`)
  }

  console.log(`\nDone. Seeded ${trackCount} tracks, ${companyCount} companies, ${promptCount} prompts.`)
}

seed().catch((error) => {
  console.error('\nSeed failed:', error.message)
  process.exit(1)
})
