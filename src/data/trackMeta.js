// Display metadata for interview tracks (the mode picker). Pure data — no JSX — so it can
// be shared by the React UI (src/pages/RecordPage.jsx via src/data/trackIcons.jsx) AND the
// seed script (scripts/seedQuestionBank.mjs), which cannot import JSX.
//
// `key` must match the corresponding key in src/data/interviewPacks.js exactly.
// `iconKey` maps to an SVG in src/data/trackIcons.jsx.

// Picker grouping order. A track's `category` must be one of these strings.
export const CATEGORY_ORDER = ['Job Interviews', 'HR / Behavioral', 'Admissions', 'Pitch & Sales']

export const trackMeta = [
  {
    key: 'Startup Pitch',
    category: 'Pitch & Sales',
    subtitle: 'Investor presence + conviction',
    focus: 'conviction, storytelling arc, investor presence signals',
    iconKey: 'startup'
  },
  {
    key: 'Case Interview',
    category: 'Job Interviews',
    subtitle: 'Structure + frameworks',
    focus: 'structured pauses, framework clarity, logical pacing',
    iconKey: 'case'
  },
  {
    key: 'Tech Interview',
    category: 'Job Interviews',
    subtitle: 'Clarity + confidence',
    focus: 'explanation clarity, confidence when uncertain, pacing on complex ideas',
    iconKey: 'tech'
  },
  {
    key: 'Product Management',
    category: 'Job Interviews',
    subtitle: 'Product sense + execution',
    focus: 'product sense, user empathy, metrics, prioritization, strategy, and leadership communication',
    iconKey: 'product'
  },
  {
    key: 'Software Engineering',
    category: 'Job Interviews',
    subtitle: 'Design + tradeoffs',
    focus: 'technical decomposition, code quality, system tradeoffs, collaboration, and learning agility',
    iconKey: 'software'
  },
  {
    key: 'DSA Problem Solving',
    category: 'Job Interviews',
    subtitle: 'Algorithms + narration',
    focus: 'problem clarification, algorithm choice, edge cases, complexity analysis, and calm step-by-step reasoning',
    iconKey: 'dsa'
  },
  {
    key: 'Developer Relations',
    category: 'Job Interviews',
    subtitle: 'Demo + technical story',
    focus: 'developer empathy, technical demo clarity, API explanation, community trust, and persuasive teaching',
    iconKey: 'devrel'
  },
  {
    key: 'Campus Placement',
    category: 'Job Interviews',
    subtitle: 'On-campus + service cos',
    focus: 'self-introduction clarity, project explanation, company fit, and calm confidence under standard placement questions',
    iconKey: 'campus'
  },
  {
    key: 'HR / Behavioral',
    category: 'HR / Behavioral',
    subtitle: 'STAR stories + fit',
    focus: 'STAR structure, honest self-reflection, ownership, and composure on personal and behavioral questions',
    iconKey: 'hr'
  },
  {
    key: 'Admissions',
    category: 'Admissions',
    subtitle: 'MBA · grad · scholarship',
    focus: 'motivation clarity, goal specificity, research or program fit, and authentic reflective delivery',
    iconKey: 'admissions'
  },
  {
    key: 'Sales Call',
    category: 'Pitch & Sales',
    subtitle: 'Energy + persuasion',
    focus: 'energy arc, persuasion buildup, closing energy in final 30 seconds',
    iconKey: 'sales'
  }
]
