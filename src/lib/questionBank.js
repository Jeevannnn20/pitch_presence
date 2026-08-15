// Read layer for the interview question bank.
//
// loadQuestionBank() returns the content in the SAME shapes the app already uses:
//   - `packs`: keyed by track key -> { label, targets: [...] }  (identical to interviewPacks)
//   - `trackMeta`: [{ key, label, category, subtitle, focus, iconKey }]  (for the picker)
//
// It reads from Supabase when configured and seeded; otherwise (unconfigured, empty, or on
// any error) it falls back to the static src/data files so the app keeps working exactly as
// it does today. This lets us wire the DB in incrementally without a hard cutover.

import { supabase } from './supabaseClient.js'
import { interviewPacks } from '../data/interviewPacks.js'
import { trackMeta as staticTrackMeta } from '../data/trackMeta.js'

const STATIC = { source: 'static', packs: interviewPacks, trackMeta: staticTrackMeta }

function reshapeCompany(company, promptsByCompany) {
  const prompts = (promptsByCompany.get(company.id) || []).map((prompt) => {
    const mapped = { id: prompt.slug, title: prompt.title, text: prompt.text }
    if (prompt.answer_key) mapped.answerKey = prompt.answer_key
    return mapped
  })
  return {
    id: company.slug,
    name: company.name,
    style: company.style || '',
    sourceBasis: company.source_basis || '',
    referenceLinks: company.reference_links || [],
    focus: company.focus || '',
    rubric: company.rubric || [],
    prompts
  }
}

// Fetch the full catalog from Supabase and rebuild the interviewPacks-shaped object.
export async function loadQuestionBank() {
  if (!supabase) return STATIC

  try {
    const [tracksRes, companiesRes, promptsRes] = await Promise.all([
      supabase.from('tracks').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('companies').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('prompts').select('*').eq('is_active', true).order('sort_order', { ascending: true })
    ])

    if (tracksRes.error || companiesRes.error || promptsRes.error) return STATIC
    const tracks = tracksRes.data || []
    if (!tracks.length) return STATIC // not seeded yet -> stay on static content

    const companies = companiesRes.data || []
    const prompts = promptsRes.data || []

    const promptsByCompany = new Map()
    for (const prompt of prompts) {
      const list = promptsByCompany.get(prompt.company_id) || []
      list.push(prompt)
      promptsByCompany.set(prompt.company_id, list)
    }

    const companiesByTrack = new Map()
    for (const company of companies) {
      const list = companiesByTrack.get(company.track_id) || []
      list.push(company)
      companiesByTrack.set(company.track_id, list)
    }

    const packs = {}
    const trackMeta = []
    for (const track of tracks) {
      const targets = (companiesByTrack.get(track.id) || []).map((company) =>
        reshapeCompany(company, promptsByCompany)
      )
      packs[track.key] = { label: track.label, targets }
      trackMeta.push({
        key: track.key,
        label: track.label,
        category: track.category,
        subtitle: track.subtitle || '',
        focus: track.focus || '',
        iconKey: track.icon_key || ''
      })
    }

    return { source: 'supabase', packs, trackMeta }
  } catch {
    return STATIC
  }
}
