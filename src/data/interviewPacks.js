export const interviewPacks = {
  'Startup Pitch': {
    label: 'Startup Pitch',
    targets: [
      {
        id: 'yc-seed',
        name: 'YC Seed Partner',
        style: 'Fast, direct, traction-seeking, founder-market-fit obsessed.',
        sourceBasis: 'Inspired by public YC-style pitch practice, demo day breakdowns, founder interviews, and investor critique patterns.',
        referenceLinks: [
          { label: 'YC pitch advice', url: 'https://www.ycombinator.com/blog/how-to-pitch-your-company/' }
        ],
        focus: 'conviction, narrative compression, market urgency, founder clarity, and the ask',
        rubric: [
          { name: 'Problem urgency', weights: { clarity: 0.45, energy: 0.3, pace: 0.25 } },
          { name: 'Founder conviction', weights: { eyeContact: 0.35, energy: 0.4, posture: 0.25 } },
          { name: 'Narrative arc', weights: { clarity: 0.4, pace: 0.35, energy: 0.25 } },
          { name: 'Investor presence', weights: { eyeContact: 0.45, posture: 0.3, energy: 0.25 } }
        ],
        prompts: [
          {
            id: 'why-now',
            title: '90-second seed pitch',
            text: 'Pitch your startup in 90 seconds. Cover the problem, your wedge, why now, traction or proof, and the specific ask.'
          },
          {
            id: 'skeptical-market',
            title: 'Skeptical market question',
            text: 'An investor says the market sounds crowded. Explain why your startup can win and what insight competitors are missing.'
          }
        ]
      },
      {
        id: 'sequoia-seed',
        name: 'Sequoia Seed Pitch',
        style: 'Thesis-driven, market-size aware, crisp on wedge and long-term ambition.',
        sourceBasis: 'Inspired by public seed pitch rubrics, investor memos, and founder pitch teardown patterns.',
        referenceLinks: [
          { label: 'YC pitch advice', url: 'https://www.ycombinator.com/blog/how-to-pitch-your-company/' }
        ],
        focus: 'category clarity, wedge, market narrative, ambition, and concise proof',
        rubric: [
          { name: 'Category clarity', weights: { clarity: 0.55, pace: 0.25, energy: 0.2 } },
          { name: 'Market ambition', weights: { energy: 0.4, clarity: 0.35, eyeContact: 0.25 } },
          { name: 'Wedge credibility', weights: { clarity: 0.45, posture: 0.25, pace: 0.3 } },
          { name: 'Executive presence', weights: { eyeContact: 0.4, posture: 0.35, energy: 0.25 } }
        ],
        prompts: [
          {
            id: 'wedge-to-platform',
            title: 'Wedge to platform',
            text: 'Pitch how your initial product wedge expands into a much larger company. Keep it under two minutes.'
          }
        ]
      }
    ]
  },
  'Case Interview': {
    label: 'Case Interview',
    targets: [
      {
        id: 'mckinsey',
        name: 'McKinsey Case',
        style: 'Hypothesis-led, structured, synthesis-heavy, and comfortable with silence before analysis.',
        sourceBasis: 'Inspired by public case interview prep examples, candidate debriefs, and consulting practice cases.',
        referenceLinks: [
          { label: 'McKinsey-style prep examples', url: 'https://www.roadtooffer.com/blog/mckinsey-practice-cases' },
          { label: 'Reddit candidate discussion', url: 'https://www.reddit.com/r/MBBConsulting/comments/1lq7vl6/mckinsey_case_interview/' }
        ],
        focus: 'top-down structure, logical pauses, MECE framing, synthesis, and confident recommendation delivery',
        rubric: [
          { name: 'Top-down structure', weights: { clarity: 0.5, pace: 0.3, posture: 0.2 } },
          { name: 'Hypothesis clarity', weights: { clarity: 0.45, eyeContact: 0.25, energy: 0.3 } },
          { name: 'Logical pacing', weights: { pace: 0.55, clarity: 0.3, energy: 0.15 } },
          { name: 'Synthesis presence', weights: { clarity: 0.35, eyeContact: 0.3, energy: 0.35 } }
        ],
        prompts: [
          {
            id: 'bank-revenue',
            title: 'Profitability case',
            text: 'A retail bank has seen credit card profit decline by 18% over the last year. Diagnose the issue and recommend what the CEO should do.'
          },
          {
            id: 'airline-entry',
            title: 'Market entry case',
            text: 'A regional airline is considering launching a premium subscription product for frequent travelers. Evaluate whether they should enter.'
          }
        ]
      },
      {
        id: 'bain',
        name: 'Bain Case',
        style: 'Practical, client-friendly, answer-first, with emphasis on business judgment.',
        sourceBasis: 'Inspired by public consulting case examples, mock interview videos, and candidate prep notes.',
        referenceLinks: [
          { label: 'Bain case prep', url: 'https://www.bain.com/careers/hiring-process/case-interview' }
        ],
        focus: 'client communication, practical judgment, concise math setup, and recommendation confidence',
        rubric: [
          { name: 'Client-ready framing', weights: { clarity: 0.45, posture: 0.25, eyeContact: 0.3 } },
          { name: 'Business judgment', weights: { clarity: 0.5, energy: 0.25, pace: 0.25 } },
          { name: 'Math communication', weights: { pace: 0.45, clarity: 0.4, energy: 0.15 } },
          { name: 'Recommendation', weights: { energy: 0.35, eyeContact: 0.35, clarity: 0.3 } }
        ],
        prompts: [
          {
            id: 'restaurant-margin',
            title: 'Margin recovery',
            text: 'A fast casual restaurant chain has flat revenue but falling margins. Identify the root causes and propose a turnaround plan.'
          }
        ]
      }
    ]
  },
  'Tech Interview': {
    label: 'Tech Interview',
    targets: [
      {
        id: 'google',
        name: 'Google System Design',
        style: 'Collaborative, tradeoff-driven, precise about scale, bottlenecks, and constraints.',
        sourceBasis: 'Inspired by public system design interviews, engineering blogs, and candidate experience writeups.',
        referenceLinks: [
          { label: 'Google interview tips', url: 'https://www.google.com/about/careers/applications/interview-tips/' },
          { label: 'Reddit prep discussion', url: 'https://www.reddit.com/r/leetcode/comments/1tnzdz3/google_interview_process_and_preparation/' }
        ],
        focus: 'clear decomposition, tradeoff language, pacing through complex ideas, and confidence under ambiguity',
        rubric: [
          { name: 'Problem decomposition', weights: { clarity: 0.5, pace: 0.3, posture: 0.2 } },
          { name: 'Tradeoff clarity', weights: { clarity: 0.55, energy: 0.2, eyeContact: 0.25 } },
          { name: 'Complexity pacing', weights: { pace: 0.55, clarity: 0.3, energy: 0.15 } },
          { name: 'Calm confidence', weights: { eyeContact: 0.35, posture: 0.35, energy: 0.3 } }
        ],
        prompts: [
          {
            id: 'rate-limiter',
            title: 'Rate limiter',
            text: 'Design a distributed rate limiter for an API platform. Explain requirements, data model, algorithm choice, consistency tradeoffs, and failure modes.'
          },
          {
            id: 'youtube-search',
            title: 'Video search',
            text: 'Design search for a large video platform. Cover indexing, ranking, freshness, latency, and how you would evaluate quality.'
          }
        ]
      },
      {
        id: 'amazon',
        name: 'Amazon Technical + LP',
        style: 'Dive-deep, ownership-focused, direct about tradeoffs and failure handling.',
        sourceBasis: 'Inspired by public Amazon interview loops, leadership principle prep, and technical screen examples.',
        referenceLinks: [
          { label: 'Amazon interview guide', url: 'https://www.aboutamazon.com/news/workplace/amazon-interview-guide/' },
          { label: 'Amazon leadership principles', url: 'https://www.aboutamazon.com/working-at-amazon/our-leadership-principles' }
        ],
        focus: 'ownership, precise explanation, tradeoff defense, and clear handling of uncertainty',
        rubric: [
          { name: 'Ownership signal', weights: { energy: 0.35, eyeContact: 0.3, clarity: 0.35 } },
          { name: 'Dive-deep clarity', weights: { clarity: 0.55, pace: 0.25, posture: 0.2 } },
          { name: 'Tradeoff defense', weights: { clarity: 0.45, eyeContact: 0.25, energy: 0.3 } },
          { name: 'Failure handling', weights: { pace: 0.35, clarity: 0.45, energy: 0.2 } }
        ],
        prompts: [
          {
            id: 'orders-queue',
            title: 'Order processing',
            text: 'Design an order processing pipeline for a marketplace. Explain retries, idempotency, observability, and how you would recover from partial failure.'
          }
        ]
      }
    ]
  },
  'Product Management': {
    label: 'Product Management',
    targets: [
      {
        id: 'meta-pm',
        name: 'Meta PM Loop',
        style: 'Structured around Product Sense, Execution, and Leadership & Drive with high bar for user empathy and analytical rigor.',
        sourceBasis: 'Inspired by public Meta PM interview guides, PM prep platforms, and candidate discussions around product sense, execution, analytics, and leadership rounds.',
        referenceLinks: [
          { label: 'Meta PM guide', url: 'https://www.bestpmjobs.com/resources/company-interviews/meta' },
          { label: 'Exponent Meta PM guide', url: 'https://www.tryexponent.com/guides/meta-product-manager-interview' },
          { label: 'Reddit PM prep discussion', url: 'https://www.reddit.com/r/ProductMgmt/comments/1h2ayvr' }
        ],
        focus: 'product sense, user segmentation, execution metrics, tradeoff prioritization, and leadership communication',
        rubric: [
          { name: 'Product sense', weights: { clarity: 0.45, pace: 0.2, eyeContact: 0.2, energy: 0.15 } },
          { name: 'User empathy', weights: { clarity: 0.4, eyeContact: 0.25, energy: 0.2, posture: 0.15 } },
          { name: 'Execution rigor', weights: { clarity: 0.45, pace: 0.35, energy: 0.2 } },
          { name: 'Leadership presence', weights: { eyeContact: 0.35, posture: 0.25, energy: 0.25, clarity: 0.15 } }
        ],
        prompts: [
          {
            id: 'instagram-creator-growth',
            title: 'Product sense',
            text: 'Design a product or feature to help new Instagram creators get their first 1,000 engaged followers. Explain target users, pain points, solution, tradeoffs, and success metrics.'
          },
          {
            id: 'reels-retention',
            title: 'Execution metrics',
            text: 'Reels watch time is up, but creator retention is down. Diagnose what might be happening, define the metrics you would inspect, and propose a product response.'
          },
          {
            id: 'privacy-tradeoff',
            title: 'Leadership tradeoff',
            text: 'A growth feature improves sharing but creates user privacy concerns. Walk through how you would make the decision and align engineering, design, legal, and leadership.'
          }
        ]
      },
      {
        id: 'google-pm',
        name: 'Google PM',
        style: 'Ambiguous, systems-aware, user-first, and rigorous about product strategy and measurable impact.',
        sourceBasis: 'Inspired by public Google PM prep guides, official interview tips, and PM practice platforms organized by product design, strategy, analytics, and estimation.',
        referenceLinks: [
          { label: 'Google interview tips', url: 'https://www.google.com/about/careers/applications/interview-tips/' },
          { label: 'LeetProduct overview', url: 'https://www.leetproduct.com/' },
          { label: 'Interview PM practice areas', url: 'https://www.interviewpm.com/' }
        ],
        focus: 'structured ambiguity handling, product strategy, technical fluency, metrics, and crisp communication',
        rubric: [
          { name: 'Ambiguity handling', weights: { clarity: 0.45, pace: 0.25, posture: 0.15, energy: 0.15 } },
          { name: 'Strategic framing', weights: { clarity: 0.5, energy: 0.2, eyeContact: 0.2, pace: 0.1 } },
          { name: 'Metrics logic', weights: { clarity: 0.55, pace: 0.3, energy: 0.15 } },
          { name: 'Technical fluency', weights: { clarity: 0.45, pace: 0.25, eyeContact: 0.15, posture: 0.15 } }
        ],
        prompts: [
          {
            id: 'google-maps-commute',
            title: 'Product design',
            text: 'Improve Google Maps for commuters in dense cities. Define the user segment, top pain points, solution, risks, and launch metrics.'
          },
          {
            id: 'gemini-workspace',
            title: 'AI product strategy',
            text: 'Create a strategy for increasing adoption of an AI writing assistant inside a productivity suite. Explain target users, activation, trust, and retention metrics.'
          }
        ]
      },
      {
        id: 'amazon-pm',
        name: 'Amazon PM',
        style: 'Customer-backward, ownership-heavy, data-driven, and precise about mechanisms.',
        sourceBasis: 'Inspired by Amazon public interview guidance, leadership principles, and PM preparation patterns around customer obsession and mechanisms.',
        referenceLinks: [
          { label: 'Amazon interview guide', url: 'https://www.aboutamazon.com/news/workplace/amazon-interview-guide/' },
          { label: 'Leadership principles', url: 'https://www.aboutamazon.com/working-at-amazon/our-leadership-principles' }
        ],
        focus: 'customer obsession, ownership, working-backward thinking, mechanism design, and metric discipline',
        rubric: [
          { name: 'Customer obsession', weights: { clarity: 0.4, energy: 0.25, eyeContact: 0.2, posture: 0.15 } },
          { name: 'Mechanism design', weights: { clarity: 0.55, pace: 0.25, energy: 0.2 } },
          { name: 'Ownership signal', weights: { energy: 0.35, eyeContact: 0.25, posture: 0.2, clarity: 0.2 } },
          { name: 'Metric discipline', weights: { clarity: 0.5, pace: 0.35, energy: 0.15 } }
        ],
        prompts: [
          {
            id: 'prime-churn',
            title: 'Customer-backward execution',
            text: 'Prime retention is declining among college students. Work backward from the customer and propose a product mechanism to improve retention.'
          },
          {
            id: 'marketplace-trust',
            title: 'Trust product',
            text: 'Design a product improvement that increases trust in third-party marketplace sellers without hurting selection or conversion.'
          }
        ]
      },
      {
        id: 'doordash-pm',
        name: 'DoorDash PM',
        style: 'Marketplace-aware, operational, metric-driven, and sensitive to consumer, merchant, and dasher tradeoffs.',
        sourceBasis: 'Inspired by public marketplace PM interview patterns and product execution cases around growth, logistics, and multi-sided marketplaces.',
        referenceLinks: [
          { label: 'Interview PM practice areas', url: 'https://www.interviewpm.com/' },
          { label: 'LeetProduct company practice', url: 'https://www.leetproduct.com/' }
        ],
        focus: 'marketplace tradeoffs, experimentation, operational metrics, segmentation, and practical product judgment',
        rubric: [
          { name: 'Marketplace thinking', weights: { clarity: 0.45, pace: 0.25, energy: 0.15, eyeContact: 0.15 } },
          { name: 'Experiment design', weights: { clarity: 0.5, pace: 0.3, energy: 0.2 } },
          { name: 'Operational judgment', weights: { clarity: 0.4, posture: 0.2, energy: 0.2, eyeContact: 0.2 } },
          { name: 'Prioritization', weights: { clarity: 0.45, pace: 0.25, energy: 0.15, posture: 0.15 } }
        ],
        prompts: [
          {
            id: 'delivery-late',
            title: 'Marketplace execution',
            text: 'Late deliveries increased in one city after a pricing change. Diagnose the issue across consumers, merchants, and dashers, then propose an experiment.'
          },
          {
            id: 'merchant-growth',
            title: 'Growth product',
            text: 'Design a product to help small restaurants get more repeat customers through a delivery marketplace.'
          }
        ]
      }
    ]
  },
  'Software Engineering': {
    label: 'Software Engineering',
    targets: [
      {
        id: 'atlassian-eng',
        name: 'Atlassian Engineering',
        style: 'Practical, collaborative, language-flexible, and focused on problem solving, code design, systems thinking, and learning agility.',
        sourceBasis: 'Inspired by Atlassian public engineering interview guidance, which emphasizes how candidates think, communicate tradeoffs, and explore practical system constraints.',
        referenceLinks: [
          { label: 'Atlassian engineering guide', url: 'https://www.atlassian.com/company/careers/resources/interviewing/engineering' },
          { label: 'Candidate resource hub', url: 'https://www.atlassian.com/company/careers/resources/interviewing' }
        ],
        focus: 'problem-solving narration, tradeoff clarity, clean code reasoning, systems constraints, and collaboration',
        rubric: [
          { name: 'Problem exploration', weights: { clarity: 0.45, pace: 0.25, eyeContact: 0.15, energy: 0.15 } },
          { name: 'Tradeoff clarity', weights: { clarity: 0.5, pace: 0.25, energy: 0.15, posture: 0.1 } },
          { name: 'Collaboration signal', weights: { eyeContact: 0.3, clarity: 0.3, energy: 0.25, posture: 0.15 } },
          { name: 'Learning agility', weights: { clarity: 0.4, pace: 0.25, energy: 0.2, eyeContact: 0.15 } }
        ],
        prompts: [
          {
            id: 'jira-notifications',
            title: 'System design',
            text: 'Design a notification system for an issue-tracking product used by large enterprise teams. Discuss requirements, fanout, preferences, retries, reliability, and cost tradeoffs.'
          },
          {
            id: 'code-design-review',
            title: 'Code design',
            text: 'Explain how you would refactor a large frontend component that mixes data fetching, business logic, and rendering. Talk through boundaries, testing, rollout, and tradeoffs.'
          }
        ]
      },
      {
        id: 'stripe-eng',
        name: 'Stripe Engineering',
        style: 'Practical engineering, API-as-product thinking, clean abstractions, debugging rigor, and user-first design.',
        sourceBasis: 'Inspired by public Stripe engineering interview prep that emphasizes practical coding, bug fixing, API design, payments reasoning, and maintainability.',
        referenceLinks: [
          { label: 'Stripe prep overview', url: 'https://www.algoroq.io/career/stripe-interview-prep/' },
          { label: 'Stripe process questions', url: 'https://interviewing.io/stripe-interview-questions' },
          { label: 'Frontend guide', url: 'https://www.greatfrontend.com/interviews/company/stripe/questions-guides' }
        ],
        focus: 'API clarity, debugging explanation, maintainability, edge cases, and developer-user empathy',
        rubric: [
          { name: 'API product thinking', weights: { clarity: 0.5, energy: 0.2, eyeContact: 0.15, pace: 0.15 } },
          { name: 'Debugging narration', weights: { clarity: 0.45, pace: 0.35, energy: 0.2 } },
          { name: 'Maintainability', weights: { clarity: 0.5, posture: 0.2, pace: 0.2, energy: 0.1 } },
          { name: 'Edge-case discipline', weights: { clarity: 0.45, pace: 0.35, eyeContact: 0.1, energy: 0.1 } }
        ],
        prompts: [
          {
            id: 'payments-api',
            title: 'API design',
            text: 'Design an API for creating and refunding payments. Explain the object model, idempotency, error handling, webhooks, and how developers should debug failures.'
          },
          {
            id: 'bug-billing',
            title: 'Debugging scenario',
            text: 'A billing job occasionally double-charges customers after retrying failed requests. Talk through how you would investigate, patch, test, and prevent recurrence.'
          }
        ]
      },
      {
        id: 'microsoft-eng',
        name: 'Microsoft SWE',
        style: 'Collaborative technical problem solving with emphasis on fundamentals, distributed systems, and clear engineering lifecycle communication.',
        sourceBasis: 'Inspired by Microsoft public technical interviewing guidance covering distributed systems, service architecture, and engineering lifecycle thinking.',
        referenceLinks: [
          { label: 'Microsoft technical interviewing', url: 'https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing' }
        ],
        focus: 'technical fundamentals, distributed systems communication, lifecycle awareness, and collaborative reasoning',
        rubric: [
          { name: 'Technical fundamentals', weights: { clarity: 0.5, pace: 0.25, energy: 0.15, posture: 0.1 } },
          { name: 'System reasoning', weights: { clarity: 0.5, pace: 0.25, eyeContact: 0.15, energy: 0.1 } },
          { name: 'Lifecycle thinking', weights: { clarity: 0.4, energy: 0.2, posture: 0.2, eyeContact: 0.2 } },
          { name: 'Collaborative clarity', weights: { eyeContact: 0.3, clarity: 0.35, energy: 0.2, posture: 0.15 } }
        ],
        prompts: [
          {
            id: 'distributed-cache',
            title: 'Distributed systems',
            text: 'Design a distributed cache for a cloud service. Discuss consistency, eviction, replication, failure modes, observability, and operational rollout.'
          },
          {
            id: 'incident-postmortem',
            title: 'Engineering lifecycle',
            text: 'A production deployment caused elevated latency for a major customer. Explain how you would detect, mitigate, communicate, and prevent similar incidents.'
          }
        ]
      },
      {
        id: 'github-eng',
        name: 'GitHub Engineering',
        style: 'Developer-product oriented, async-friendly, maintainability-focused, and precise about collaboration at scale.',
        sourceBasis: 'Inspired by developer-platform engineering interview patterns around code review, API design, maintainability, and collaboration on large codebases.',
        referenceLinks: [
          { label: 'GitHub careers', url: 'https://www.github.careers/careers-home/' },
          { label: 'GitHub engineering blog', url: 'https://github.blog/engineering/' }
        ],
        focus: 'developer empathy, code review judgment, API explanation, reliability, and collaborative tradeoffs',
        rubric: [
          { name: 'Developer empathy', weights: { clarity: 0.4, eyeContact: 0.2, energy: 0.25, pace: 0.15 } },
          { name: 'Review judgment', weights: { clarity: 0.5, pace: 0.25, posture: 0.15, energy: 0.1 } },
          { name: 'Reliability thinking', weights: { clarity: 0.45, pace: 0.25, energy: 0.15, eyeContact: 0.15 } },
          { name: 'Async communication', weights: { clarity: 0.45, posture: 0.2, eyeContact: 0.2, energy: 0.15 } }
        ],
        prompts: [
          {
            id: 'pull-request-scale',
            title: 'Developer workflow',
            text: 'Design improvements for pull request review in a large repository with hundreds of contributors. Explain signals, UX, reliability, permissions, and rollout.'
          },
          {
            id: 'actions-reliability',
            title: 'Platform reliability',
            text: 'A CI platform has intermittent queue delays during peak hours. Talk through diagnosis, architecture options, user communication, and tradeoffs.'
          }
        ]
      }
    ]
  },
  'DSA Problem Solving': {
    label: 'DSA Problem Solving',
    targets: [
      {
        id: 'google-dsa',
        name: 'Google Coding Screen',
        style: 'Collaborative, fundamentals-heavy, concise on clarifying questions, and rigorous about edge cases and complexity.',
        sourceBasis: 'Inspired by public Google coding interview guidance, common algorithm practice patterns, and candidate writeups around arrays, graphs, dynamic programming, and complexity discussion.',
        referenceLinks: [
          { label: 'Google interview tips', url: 'https://www.google.com/about/careers/applications/interview-tips/' },
          { label: 'Google technical prep', url: 'https://techdevguide.withgoogle.com/paths/interview/' }
        ],
        focus: 'clarifying constraints, deriving an algorithm, explaining tradeoffs, testing edge cases, and stating time and space complexity clearly',
        rubric: [
          { name: 'Clarifying questions', weights: { clarity: 0.45, pace: 0.25, eyeContact: 0.15, energy: 0.15 } },
          { name: 'Algorithm derivation', weights: { clarity: 0.55, pace: 0.25, energy: 0.1, posture: 0.1 } },
          { name: 'Complexity analysis', weights: { clarity: 0.5, pace: 0.35, energy: 0.15 } },
          { name: 'Edge-case discipline', weights: { clarity: 0.45, pace: 0.3, eyeContact: 0.15, posture: 0.1 } }
        ],
        prompts: [
          {
            id: 'longest-subarray-sum',
            title: 'Sliding window',
            text: 'Given an array of positive integers and a target K, explain how you would find the length of the longest contiguous subarray with sum at most K. Walk through constraints, algorithm, complexity, and edge cases.'
          },
          {
            id: 'shortest-path-grid',
            title: 'Graph traversal',
            text: 'You are given a grid with empty cells, walls, a start, and a target. Explain how you would find the shortest path length, including how you represent state, avoid revisits, and handle impossible cases.'
          },
          {
            id: 'decode-ways',
            title: 'Dynamic programming',
            text: 'Given a string of digits where A=1 through Z=26, explain how you would count the number of valid decodings. Derive the recurrence, base cases, invalid states, and complexity.'
          }
        ]
      },
      {
        id: 'meta-dsa',
        name: 'Meta Coding Loop',
        style: 'Fast-moving, pattern-recognition oriented, practical about multiple solutions, and attentive to clean explanation before implementation.',
        sourceBasis: 'Inspired by public Meta interview prep patterns, candidate discussions, and common coding loop topics such as trees, intervals, arrays, hash maps, and recursion.',
        referenceLinks: [
          { label: 'Meta careers preparation', url: 'https://www.metacareers.com/careerprograms/pathways/prep' },
          { label: 'Meta interview preparation', url: 'https://www.metacareers.com/careerprograms/pathways/meta-interview-preparation' }
        ],
        focus: 'recognizing the right pattern quickly, explaining brute force to optimized transitions, communicating recursion, and checking tricky cases',
        rubric: [
          { name: 'Pattern recognition', weights: { clarity: 0.45, pace: 0.3, energy: 0.15, eyeContact: 0.1 } },
          { name: 'Optimization path', weights: { clarity: 0.55, pace: 0.25, energy: 0.2 } },
          { name: 'Recursive clarity', weights: { clarity: 0.5, pace: 0.3, posture: 0.1, energy: 0.1 } },
          { name: 'Test walkthrough', weights: { clarity: 0.4, eyeContact: 0.2, pace: 0.25, energy: 0.15 } }
        ],
        prompts: [
          {
            id: 'binary-tree-diameter',
            title: 'Tree recursion',
            text: 'Given a binary tree, explain how you would compute the diameter of the tree. Talk through recursive state, return values, global updates, edge cases, and complexity.'
          },
          {
            id: 'merge-intervals',
            title: 'Intervals',
            text: 'Given a list of intervals, explain how you would merge all overlapping intervals. Cover sorting, merge conditions, boundary cases, and time complexity.'
          },
          {
            id: 'subarray-sum-k',
            title: 'Prefix sums',
            text: 'Given an integer array that can include negative values and a target K, explain how you would count subarrays whose sum equals K. Derive why a prefix-sum hash map works.'
          }
        ]
      },
      {
        id: 'amazon-dsa',
        name: 'Amazon OA + Onsite',
        style: 'Direct, test-case heavy, edge-case aware, and focused on practical correctness under time pressure.',
        sourceBasis: 'Inspired by public Amazon technical interview guidance, online assessment practice patterns, and common data structure questions around heaps, maps, queues, and strings.',
        referenceLinks: [
          { label: 'Amazon interview guide', url: 'https://www.aboutamazon.com/news/workplace/amazon-interview-guide/' },
          { label: 'Amazon leadership principles', url: 'https://www.aboutamazon.com/working-at-amazon/our-leadership-principles' }
        ],
        focus: 'clear problem restatement, choosing reliable data structures, walking examples, handling edge cases, and explaining correctness under constraints',
        rubric: [
          { name: 'Problem restatement', weights: { clarity: 0.45, eyeContact: 0.2, pace: 0.2, energy: 0.15 } },
          { name: 'Data structure choice', weights: { clarity: 0.55, pace: 0.25, energy: 0.1, posture: 0.1 } },
          { name: 'Correctness reasoning', weights: { clarity: 0.5, pace: 0.3, eyeContact: 0.1, energy: 0.1 } },
          { name: 'Time pressure control', weights: { pace: 0.4, clarity: 0.3, posture: 0.15, energy: 0.15 } }
        ],
        prompts: [
          {
            id: 'top-k-frequent',
            title: 'Heap / bucket sort',
            text: 'Given a list of integers, explain how you would return the K most frequent elements. Compare a heap solution and a bucket-sort solution, then pick one and explain complexity.'
          },
          {
            id: 'lru-cache',
            title: 'Design data structure',
            text: 'Design an LRU cache with get and put in O(1). Explain the hash map plus doubly linked list design, update flow, eviction, and edge cases.'
          },
          {
            id: 'reorganize-string',
            title: 'Greedy string',
            text: 'Given a string, explain how you would rearrange characters so no adjacent characters are equal, or determine that it is impossible. Cover the greedy strategy and proof intuition.'
          }
        ]
      },
      {
        id: 'bloomberg-dsa',
        name: 'Bloomberg Pair Coding',
        style: 'Conversational, implementation-aware, collaborative, and interested in how you debug and refine a working solution.',
        sourceBasis: 'Inspired by public pair-coding interview patterns, candidate discussions, and common Bloomberg-style data structure and problem-solving exercises.',
        referenceLinks: [
          { label: 'Bloomberg careers', url: 'https://careers.bloomberg.com/job/detail/124574' }
        ],
        focus: 'collaborative problem solving, implementation narration, debugging aloud, incremental testing, and clean final complexity explanation',
        rubric: [
          { name: 'Pairing communication', weights: { clarity: 0.35, eyeContact: 0.25, energy: 0.25, posture: 0.15 } },
          { name: 'Implementation narration', weights: { clarity: 0.5, pace: 0.3, energy: 0.1, posture: 0.1 } },
          { name: 'Debugging aloud', weights: { clarity: 0.45, pace: 0.25, energy: 0.2, eyeContact: 0.1 } },
          { name: 'Incremental tests', weights: { clarity: 0.45, pace: 0.3, posture: 0.15, energy: 0.1 } }
        ],
        prompts: [
          {
            id: 'min-stack',
            title: 'Stack design',
            text: 'Design a stack that supports push, pop, top, and retrieving the minimum element in O(1). Explain the invariant, update flow, and how you would test it.'
          },
          {
            id: 'word-ladder',
            title: 'BFS transformation',
            text: 'Given a start word, end word, and dictionary, explain how you would find the shortest transformation sequence where each step changes one letter. Cover graph construction, BFS, and performance.'
          },
          {
            id: 'meeting-rooms',
            title: 'Scheduling',
            text: 'Given meeting intervals, explain how you would compute the minimum number of rooms required. Compare sweep-line and heap approaches and walk through an example.'
          }
        ]
      }
    ]
  },
  'Developer Relations': {
    label: 'Developer Relations',
    targets: [
      {
        id: 'stripe-devrel',
        name: 'Stripe DevRel',
        style: 'API-first, precise, demo-driven, and obsessed with developer trust and implementation clarity.',
        sourceBasis: 'Inspired by developer-platform content, Stripe API education patterns, and public developer advocacy interview expectations.',
        referenceLinks: [
          { label: 'Stripe docs', url: 'https://docs.stripe.com/' },
          { label: 'Stripe engineering blog', url: 'https://stripe.com/blog/engineering' }
        ],
        focus: 'technical storytelling, API clarity, live demo structure, developer empathy, and credibility under questions',
        rubric: [
          { name: 'API explanation', weights: { clarity: 0.5, pace: 0.25, energy: 0.15, eyeContact: 0.1 } },
          { name: 'Demo structure', weights: { clarity: 0.45, energy: 0.25, pace: 0.2, posture: 0.1 } },
          { name: 'Developer empathy', weights: { clarity: 0.35, eyeContact: 0.25, energy: 0.25, posture: 0.15 } },
          { name: 'Trust under Q&A', weights: { eyeContact: 0.3, clarity: 0.35, energy: 0.2, posture: 0.15 } }
        ],
        prompts: [
          {
            id: 'payments-demo',
            title: 'API demo pitch',
            text: 'Give a two-minute developer demo narrative for integrating payments into a marketplace. Explain the flow, edge cases, and why the API design is safe for developers.'
          },
          {
            id: 'webhook-teaching',
            title: 'Technical teaching',
            text: 'Teach a junior developer how webhooks work and how to debug a failed webhook delivery. Make it practical and confidence-building.'
          }
        ]
      },
      {
        id: 'github-devrel',
        name: 'GitHub DevRel',
        style: 'Community-first, open-source fluent, practical, and strong at explaining developer workflows.',
        sourceBasis: 'Inspired by public developer advocacy patterns, GitHub community education, and open-source product storytelling.',
        referenceLinks: [
          { label: 'GitHub blog', url: 'https://github.blog/' },
          { label: 'GitHub careers', url: 'https://www.github.careers/careers-home/' }
        ],
        focus: 'community trust, workflow teaching, open-source empathy, product storytelling, and concise technical communication',
        rubric: [
          { name: 'Community trust', weights: { energy: 0.25, eyeContact: 0.25, clarity: 0.35, posture: 0.15 } },
          { name: 'Workflow teaching', weights: { clarity: 0.5, pace: 0.25, energy: 0.15, eyeContact: 0.1 } },
          { name: 'Open-source empathy', weights: { clarity: 0.35, energy: 0.25, eyeContact: 0.25, posture: 0.15 } },
          { name: 'Storytelling', weights: { energy: 0.3, clarity: 0.4, pace: 0.2, posture: 0.1 } }
        ],
        prompts: [
          {
            id: 'actions-workshop',
            title: 'Workshop intro',
            text: 'Open a five-minute workshop on GitHub Actions for maintainers who have never automated CI before. Explain the value, first workflow, and common mistakes.'
          },
          {
            id: 'oss-maintainer',
            title: 'Community Q&A',
            text: 'An open-source maintainer says your product adds complexity and vendor lock-in. Respond with empathy and explain when the tool is and is not a good fit.'
          }
        ]
      },
      {
        id: 'twilio-devrel',
        name: 'Twilio DevRel',
        style: 'Demo-forward, builder-friendly, practical, and strong on translating APIs into customer outcomes.',
        sourceBasis: 'Inspired by public developer relations content, API demo talks, and communications-platform teaching patterns.',
        referenceLinks: [
          { label: 'Twilio docs', url: 'https://www.twilio.com/docs' },
          { label: 'Twilio blog', url: 'https://www.twilio.com/en-us/blog' }
        ],
        focus: 'live demo energy, API teaching, user outcome framing, troubleshooting clarity, and memorable close',
        rubric: [
          { name: 'Demo energy', weights: { energy: 0.45, eyeContact: 0.2, clarity: 0.25, posture: 0.1 } },
          { name: 'API teaching', weights: { clarity: 0.5, pace: 0.25, energy: 0.15, posture: 0.1 } },
          { name: 'Outcome framing', weights: { clarity: 0.4, energy: 0.3, eyeContact: 0.2, pace: 0.1 } },
          { name: 'Troubleshooting clarity', weights: { clarity: 0.45, pace: 0.35, energy: 0.1, posture: 0.1 } }
        ],
        prompts: [
          {
            id: 'sms-demo',
            title: 'Demo narrative',
            text: 'Give a short demo narrative for adding SMS notifications to a food delivery app. Explain developer steps, failure handling, and the customer outcome.'
          },
          {
            id: 'debug-delivery',
            title: 'Troubleshooting talk',
            text: 'A developer says their messages are not being delivered. Explain a debugging flow that is calm, specific, and easy to follow.'
          }
        ]
      }
    ]
  },
  'Sales Call': {
    label: 'Sales Call',
    targets: [
      {
        id: 'salesforce-enterprise',
        name: 'Salesforce Enterprise',
        style: 'Executive, value-led, discovery-aware, and strong on objection handling.',
        sourceBasis: 'Inspired by public enterprise sales call examples, SaaS discovery frameworks, and objection-handling discussions.',
        referenceLinks: [
          { label: 'Salesforce objection handling', url: 'https://www.salesforce.com/blog/sales/6-techniques-for-effective-objection-handling-blog/?bc=OTH' },
          { label: 'Trailhead objections module', url: 'https://trailhead.salesforce.com/content/learn/modules/objection-handling-strategies/learn-how-to-handle-common-objections' },
          { label: 'Reddit sales discussion', url: 'https://www.reddit.com/r/Sales_Professionals/comments/1sxxwj2/objection_handling/' }
        ],
        focus: 'energy arc, buyer pain, value framing, objection handling, and closing energy',
        rubric: [
          { name: 'Discovery clarity', weights: { clarity: 0.45, pace: 0.25, eyeContact: 0.3 } },
          { name: 'Value framing', weights: { energy: 0.35, clarity: 0.45, posture: 0.2 } },
          { name: 'Objection handling', weights: { clarity: 0.4, eyeContact: 0.3, energy: 0.3 } },
          { name: 'Closing energy', weights: { energy: 0.5, eyeContact: 0.25, pace: 0.25 } }
        ],
        prompts: [
          {
            id: 'cfo-switching',
            title: 'CFO objection',
            text: 'A CFO says switching costs are too high and the team is already overloaded. Handle the objection and earn a next meeting.'
          },
          {
            id: 'security-buyer',
            title: 'Security concern',
            text: 'A VP of Security likes your product but worries about compliance risk. Reframe the value and ask for a technical validation step.'
          }
        ]
      },
      {
        id: 'stripe-platform',
        name: 'Stripe Platform Sale',
        style: 'Technical buyer, crisp ROI, trust-heavy, and implementation-aware.',
        sourceBasis: 'Inspired by public developer-platform sales materials, technical buyer calls, and SaaS sales teardown patterns.',
        referenceLinks: [
          { label: 'Salesforce objection handling', url: 'https://www.salesforce.com/blog/sales/6-techniques-for-effective-objection-handling-blog/?bc=OTH' },
          { label: 'Reddit enterprise sales thread', url: 'https://www.reddit.com/r/SaaS/comments/1rovrkb/enterprise_sales_is_a_different_sport_took_us_2/' }
        ],
        focus: 'technical trust, ROI clarity, implementation confidence, and close discipline',
        rubric: [
          { name: 'Technical trust', weights: { clarity: 0.5, posture: 0.25, eyeContact: 0.25 } },
          { name: 'ROI clarity', weights: { clarity: 0.45, energy: 0.3, pace: 0.25 } },
          { name: 'Implementation confidence', weights: { energy: 0.3, clarity: 0.45, posture: 0.25 } },
          { name: 'Close discipline', weights: { energy: 0.45, eyeContact: 0.3, pace: 0.25 } }
        ],
        prompts: [
          {
            id: 'payments-migration',
            title: 'Platform migration',
            text: 'A CTO is worried that migrating payments infrastructure will slow the roadmap. Explain the migration path and secure agreement on a pilot.'
          }
        ]
      }
    ]
  }
}

export function getModePack(mode) {
  return interviewPacks[mode] || interviewPacks['Startup Pitch']
}

export function getTarget(mode, targetId) {
  const pack = getModePack(mode)
  return pack.targets.find((target) => target.id === targetId) || pack.targets[0]
}

export function getPrompt(mode, targetId, promptId) {
  const target = getTarget(mode, targetId)
  return target.prompts.find((prompt) => prompt.id === promptId) || target.prompts[0]
}

const ANSWER_KEY_STOP_WORDS = new Set([
  'a',
  'all',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'can',
  'cover',
  'derive',
  'design',
  'do',
  'evaluate',
  'explain',
  'find',
  'for',
  'from',
  'given',
  'handle',
  'how',
  'including',
  'is',
  'it',
  'keep',
  'should',
  'talk',
  'the',
  'then',
  'through',
  'to',
  'under',
  'walk',
  'what',
  'where',
  'why',
  'with',
  'would',
  'you',
  'your'
])

function normalizeAnswerTerm(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9+\s-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function termsFromPhrase(phrase = '') {
  const normalized = normalizeAnswerTerm(phrase)
  const words = normalized
    .split(/\s+/)
    .filter((word) => word.length > 2 && !ANSWER_KEY_STOP_WORDS.has(word))

  return [...new Set([normalized, ...words].filter((term) => term.length > 2))]
}

function splitExpectedPhrases(text = '') {
  return String(text)
    .replace(/\b(explain|cover|including|talk through|walk through|compare|derive|state)\b/gi, ',')
    .split(/[,.;:]/)
    .map((item) => normalizeAnswerTerm(item))
    .filter((item) => {
      const words = item.split(/\s+/).filter((word) => word && !ANSWER_KEY_STOP_WORDS.has(word))
      return words.length > 0 && item.length > 3
    })
    .slice(0, 8)
}

function buildAnswerKey({ prompt, target }) {
  if (prompt.answerKey) return prompt.answerKey

  const promptPhrases = splitExpectedPhrases(prompt.text)
  const rubricPhrases = (target.rubric || []).map((dimension) => dimension.name)
  const focusPhrases = String(target.focus || '')
    .split(/,|\band\b/)
    .map((item) => normalizeAnswerTerm(item))
    .filter(Boolean)
    .slice(0, 5)

  const labels = [...promptPhrases, ...rubricPhrases, ...focusPhrases]
  const groups = []
  const seen = new Set()

  labels.forEach((label) => {
    const normalized = normalizeAnswerTerm(label)
    if (!normalized || seen.has(normalized)) return
    seen.add(normalized)
    groups.push({
      label,
      terms: termsFromPhrase(label)
    })
  })

  return {
    groups: groups.slice(0, 10),
    source: prompt.answerKey ? 'explicit' : 'generated-from-prompt'
  }
}

export function buildPracticeContext({ mode, targetId, promptId, customPrompt }) {
  const target = getTarget(mode, targetId)
  const prompt = getPrompt(mode, target.id, promptId)
  const promptText = customPrompt?.trim() || prompt.text
  const answerKey = customPrompt?.trim()
    ? {
        groups: splitExpectedPhrases(customPrompt).map((phrase) => ({
          label: phrase,
          terms: termsFromPhrase(phrase)
        })),
        source: 'generated-from-custom-prompt'
      }
    : buildAnswerKey({ prompt, target })

  return {
    mode,
    targetId: target.id,
    targetName: target.name,
    promptId: prompt.id,
    interviewerStyle: target.style,
    sourceBasis: target.sourceBasis,
    referenceLinks: target.referenceLinks || [],
    focus: target.focus,
    promptTitle: customPrompt?.trim() ? 'Custom prompt' : prompt.title,
    promptText,
    answerKey,
    isCustomPrompt: Boolean(customPrompt?.trim()),
    rubric: target.rubric
  }
}

export function computeRubricBaseline(signals, practiceContext) {
  const hints = signals?.scoresHint || {}
  const contentScore = hints.content ?? signals?.contentCoverage?.score ?? 0
  const attemptMultiplier = signals?.attemptQuality?.multiplier ?? 1
  const dimensions = (practiceContext?.rubric || []).map((dimension) => {
    const score = Object.entries(dimension.weights).reduce((sum, [metric, weight]) => {
      return sum + (hints[metric] || 0) * weight
    }, 0)
    const adjustedScore = score * 0.78 + contentScore * 0.22

    return {
      name: dimension.name,
      score: Math.max(0, Math.min(100, Math.round(adjustedScore)))
    }
  })

  const rawOverall = dimensions.length
    ? Math.round(dimensions.reduce((sum, dimension) => sum + dimension.score, 0) / dimensions.length)
    : 0
  const overall = Math.max(0, Math.min(100, Math.round(rawOverall * attemptMultiplier)))

  return {
    overall,
    dimensions,
    contentScore,
    attemptStatus: signals?.attemptQuality?.status || 'unknown',
    basis: 'Local benchmark score computed from delivery signals, transcript quality, and prompt-specific answer-key coverage.'
  }
}
