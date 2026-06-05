# AgentBridge — Complete Implementation Master Map
> V1 + V2 Unified. Your printable build guide. Senior mentor edition.

---

## HOW TO READ THIS DOCUMENT

This file has two phases:

**Phase 1 (Days 1–15):** Build V1. Webhook → Transcript → Gemini → Search.
Ship it. Get it live. Get real calls through it.

**Phase 2 (Days 16–30):** Build V2. Voice Intelligence Metrics.
Only start this after V1 success criteria are ALL checked.

The phases do not overlap. Do not read Phase 2 while building Phase 1.
It will distract you.

**The rule:** If it's not in the current phase, it doesn't get built yet.

---

---

# ═══════════════════════════════════════
# PHASE 1 — V1: The Pipeline (Days 1–15)
# ═══════════════════════════════════════

---

## Part 1 — What You're Actually Building (Mental Model)

Before touching any technology, understand the data flow.
Read this until you can draw it from memory.

```
VOICE AGENT (Retell / Vapi)
        │
        │  "A call just ended"
        │  [POST request with call data]
        ▼
AGENTBRIDGE WEBHOOK ENDPOINT
        │
        │  Receives the raw call data
        │  Stores it immediately
        ▼
DATABASE (PostgreSQL)
        │
        │  Raw transcript + metadata saved
        ▼
AI PIPELINE (Gemini)
        │
        │  Reads the transcript
        │  Returns: summary, outcome, sentiment
        ▼
DATABASE (again)
        │
        │  Stores the AI analysis alongside the call
        ▼
SEARCH ENGINE
        │
        │  User types: "show angry calls"
        │  System converts to a database query
        │  Returns matching calls
        ▼
UI (Next.js)
        │
        │  Shows the results in a simple list
        ▼
USER SAYS "OH."
```

That flow is the entire V1 product.
Every piece of code you write serves one step in that chain.

---

## Part 2 — Free Tier Stack (Everything Is Free)

| Layer | Tool | Why This One | Free Limit |
|---|---|---|---|
| Framework | Next.js 14 | Frontend + Backend in one project | Always free |
| Language | TypeScript | Catches errors before runtime | Always free |
| Database | Neon PostgreSQL | Serverless Postgres, no credit card | 0.5GB storage |
| ORM | Prisma | Talk to database without raw SQL | Always free |
| AI | Google Gemini API | Best free tier of any LLM | 15 req/min free |
| Webhook Testing | ngrok | Expose localhost to internet | 1 tunnel free |
| Deployment | Vercel | Deploy Next.js instantly | Hobby plan free |
| Version Control | GitHub | Required | Always free |
| Package Manager | pnpm | Faster than npm | Always free |

**Important:** Sign up for ALL of these accounts on Day 0 before writing any code.

---

## Part 3 — What To Learn Before You Start

### Tier 1 — Must Know Before Day 1

**Concept: What is a Webhook?**
- A webhook is NOT you calling an API
- A webhook is someone ELSE calling YOUR server
- When a call ends on Retell, Retell sends a POST request to your URL
- Key question: What is the difference between polling and webhooks?

**Concept: What is JSON?**
- Every webhook payload arrives as JSON
- Key question: What is the difference between JSON.parse() and JSON.stringify()?

**Concept: What is an Environment Variable?**
- API keys must NEVER go in your code
- They live in a .env file — NEVER committed to GitHub
- Key question: What is .gitignore and why does .env belong in it?

**Concept: HTTP Methods**
- GET = read data / POST = send data
- Your webhook endpoint will be a POST route
- Key question: Why can't a webhook use GET?

**Concept: TypeScript Basics**
- Interfaces: what shape does this data have?
- Types: what kind of value is this?
- Key question: What is the difference between type and interface?

---

### Tier 2 — Learn As You Build (Week 1)

**Next.js App Router** — Learn on Day 3
- What is a Server Component vs Client Component?
- What is a Route Handler?
- What is the difference between /app/api/ and /pages/api/?

**Prisma ORM** — Learn on Day 4
- What is a schema.prisma file?
- What is a migration?
- What does prisma generate do?
- findMany, create, update — what does each do?

**PostgreSQL Basics** — Learn on Day 4
- Tables, rows, columns, relations
- Prisma writes the SQL. You must understand what it's doing.

**ngrok** — Learn on Day 3
- One command exposes your localhost to the internet
- Without ngrok, you cannot test webhooks locally

---

### Tier 3 — Learn As You Build (Week 2)

**Gemini API** — Learn on Day 7
- How to make an API call to Gemini
- How to write a prompt that returns structured JSON
- What is a system prompt vs user prompt?

**Full-Text Search in PostgreSQL** — Learn on Day 9
- tsvector and tsquery are the tools
- Prisma can use raw queries for this

**Vercel Deployment** — Learn on Day 14
- Connect GitHub repo → automatic deploys
- How to set environment variables in Vercel dashboard

---

## Part 4 — Project Structure

Create this structure on Day 2. Nothing goes outside of it.

```
agentbridge/
│
├── app/                           ← Next.js App Router
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── retell/route.ts    ← Retell webhook receiver
│   │   │   ├── vapi/route.ts      ← Vapi webhook receiver
│   │   │   └── generic/route.ts   ← Any provider webhook
│   │   ├── calls/route.ts         ← GET all calls, search calls
│   │   └── calls/[id]/route.ts    ← GET single call details
│   │
│   ├── calls/
│   │   ├── page.tsx               ← Call list + search UI
│   │   └── [id]/page.tsx          ← Single call detail page
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/                           ← All backend logic. No UI here.
│   ├── db.ts                      ← Prisma client singleton
│   ├── search.ts                  ← Search logic
│   ├── normalizer/                ← Convert provider payloads → StandardCall
│   │   ├── retell.ts
│   │   ├── vapi.ts
│   │   └── generic.ts
│   │
│   └── analyzers/                 ← [V2-AWARE] AI analysis pipeline
│       ├── index.ts               ← Runs all active analyzers
│       └── v1/
│           └── gemini.ts          ← V1: summary, outcome, sentiment
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── types/
│   └── index.ts                   ← All TypeScript interfaces
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

**Why `lib/analyzers/` exists in V1:**
V1 only has one analyzer: Gemini (summary, outcome, sentiment).
V2 will add more analyzers (loop detection, sentiment arc, etc).
By creating the folder in V1, V2 is just adding files — not restructuring.

---

## Part 5 — Database Schema

### Table 1: calls
One row = one phone call.

Fields:
- id (auto-generated unique ID)
- provider (retell / vapi / generic)
- provider_call_id (their ID — for deduplication)
- call_type (sales / support / debt / healthcare / unknown) ← [V2-AWARE]
- status (started / connected / ended / failed)
- duration_seconds
- transcript (full conversation text)
- audio_metadata (JSONB — timing, silence, overlap from provider) ← [V2-AWARE]
- raw_payload (entire original webhook JSON)
- created_at
- updated_at

### Table 2: call_analysis
One row per call, created after AI processes the transcript.

Fields:
- id
- call_id (foreign key → calls.id)
- summary (Gemini summary paragraph)
- outcome (resolved / unresolved / escalated / converted)
- sentiment (positive / neutral / negative)
- search_vector (PostgreSQL full-text search index)
- metrics (JSONB — empty in V1, V2 writes here) ← [V2-AWARE]
- created_at

---

### The Three V2-Aware Fields Explained

These three fields cost you nothing in V1 but unlock everything in V2.

**`call_type`** on the calls table:
- In V1: always set to 'unknown'
- In V2: Gemini classifies the call type on ingestion
- Why: V2 metrics are call-type specific. Sales metrics ≠ support metrics.

**`audio_metadata`** on the calls table:
- In V1: store raw provider metadata (Retell/Vapi include timing data in webhooks)
- In V2: parse this to extract silence_rate, talk_over_rate, speaking_pace
- Why: Voice-native metrics need audio data. Collect it in V1. Parse it in V2.

**`metrics`** JSONB on call_analysis:
- In V1: stored as empty {} — costs nothing
- In V2: each analyzer writes its results here
  ```
  {
    "sentiment_arc": { "q1": -0.3, "q2": 0.1, "q3": 0.6, "q4": 0.8 },
    "loop_detected": false,
    "human_handoff_needed": true,
    "silence_rate": 0.04
  }
  ```
- Why: Adding new metrics in V2 = add a key to this JSON. No schema migration needed.

---

## Part 6 — The Normalizer Pattern

**The problem:** Retell and Vapi send different payload shapes.

**The solution:** At the moment data enters the system, convert to YOUR format.
After that, your entire app only knows about StandardCall.

```
Retell payload  ──→  normalizer/retell.ts   ──→  StandardCall
Vapi payload    ──→  normalizer/vapi.ts     ──→  StandardCall
Generic payload ──→  normalizer/generic.ts  ──→  StandardCall
                                                      │
                                              Everything downstream
                                              only sees this shape
```

**StandardCall interface (define in types/index.ts):**
- provider
- providerCallId
- callType (default: 'unknown' in V1)
- status
- durationSeconds
- transcript
- audioMetadata (store raw — parse in V2)
- rawPayload
- startedAt
- endedAt

---

## Part 7 — The Analyzer Pipeline

**V1 design (simple, one analyzer):**

```
transcript
    ↓
lib/analyzers/index.ts  (runs all analyzers)
    ↓
lib/analyzers/v1/gemini.ts
    ↓
{ summary, outcome, sentiment }
    ↓
saved to call_analysis.metrics + individual columns
```

**Why this structure matters for V2:**
When V2 arrives, you add `lib/analyzers/v2/sentiment-arc.ts`.
Then register it in `lib/analyzers/index.ts`.
No other files change.

**Gemini prompt design (V1):**
- System: "You are a voice call analyst. Return ONLY valid JSON."
- User: "Analyze this transcript. Return exactly: { summary, outcome, sentiment }"
- Output: parsed JSON → saved to database

**V1 Gemini returns these fields only:**
```
{
  "summary": "string — 2-3 sentence description of what happened",
  "outcome": "resolved | unresolved | escalated | converted",
  "sentiment": "positive | neutral | negative"
}
```

Nothing more. The simplicity is intentional.

---

## Part 8 — Natural Language Search

**Two-step process:**

Step 1 — Query Understanding (Gemini):
- User types: "show me angry calls from yesterday"
- Send to Gemini: "Convert to search filters. Return JSON: { sentiment, keyword, dateRange }"
- Returns: { sentiment: "negative", dateRange: "yesterday" }

Step 2 — Database Query:
- Use filters from Step 1
- PostgreSQL full-text search on transcript + analysis
- Return matching calls

**Why this approach:**
Fast (database query, not AI retrieval) + Reliable (AI interprets, database finds).

---

## Part 9 — Webhook Security

Every webhook must be verified before processing.

**How it works:**
- Retell/Vapi sign each webhook with a secret
- You verify the signature header
- If verification fails → return 401, store nothing
- Concept to understand: HMAC signature verification

**For generic webhook:**
- You generate a secret, give it to whoever configures the integration
- They include it in every request header
- You verify it matches

---

## Part 10 — 15-Day Build Timeline

### PRE-WORK (Day 0) — Setup Only, No Code

Accounts to create:
- GitHub
- Neon (neon.tech)
- Google AI Studio (aistudio.google.com) — get Gemini API key
- Vercel (vercel.com)
- ngrok (ngrok.com)

To read (not watch):
- Next.js App Router overview (official docs, 15 mins)
- Prisma intro page (10 mins)
- Retell webhook documentation (20 mins)

---

### WEEK 1 — The Pipeline (Days 1–7)
**Goal:** A real call goes in, AI analysis comes out. No UI.

---

**Day 1 — Project Foundation**
- Create Next.js 14 project with TypeScript
- Set up folder structure from Part 4 exactly
- Configure .env and .env.example
- Set up ESLint and Prettier

Checkpoint: Project runs locally. Zero errors. Folder structure matches Part 4.

---

**Day 2 — Database Setup**
- Connect to Neon PostgreSQL
- Write schema.prisma with both tables + all V2-aware fields
- Run first migration
- Verify tables exist in Neon dashboard

Topics: connection string, schema.prisma, prisma db push vs migrate,
foreign keys, JSONB columns

Checkpoint: Both tables visible in Neon. JSONB columns included.

---

**Day 3 — Webhook Receiver**
- Build Retell webhook endpoint (POST route)
- Start ngrok tunnel
- Set webhook URL in Retell dashboard
- Log incoming payload to terminal

Topics: Next.js Route Handler, reading request body,
ngrok tunnel, Retell webhook docs

Checkpoint: ngrok running. Test call made. Raw payload visible in terminal.

---

**Day 4 — Normalizer + Database Save**
- Build normalizer/retell.ts → StandardCall
- Build normalizer/vapi.ts → StandardCall
- Build normalizer/generic.ts → StandardCall
- Save normalized call to database
- Implement idempotency check (same call_id twice = upsert not duplicate)

Topics: normalizer pattern, Prisma create(), upsert, idempotency

Checkpoint: Make a test call. Row appears in calls table in Neon.
audio_metadata stored. call_type stored as 'unknown'.

---

**Day 5 — Gemini Analyzer**
- Build lib/analyzers/index.ts (runs analyzers after save)
- Build lib/analyzers/v1/gemini.ts
- Write Gemini prompt for summary, outcome, sentiment
- Parse response and save to call_analysis

Topics: Gemini SDK, system vs user prompt, structured JSON output,
try/catch around AI calls, stripping markdown from JSON response

Checkpoint: Test call → both tables have data → call_analysis.metrics
contains { summary, outcome, sentiment }.

---

**Day 6 — Buffer Day**
Nothing new. Fix only what broke in Days 1–5.

Common Day 1–5 failures:
- Webhook signature verification failing
- Gemini returning markdown-wrapped JSON
- Prisma client not regenerating after schema change
- Environment variables not loading
- ngrok URL expiring (changes every restart on free tier)

Checkpoint: Full pipeline works reliably 3 times in a row.

---

**Day 7 — Search Foundation**
- Add search_vector column population after each call save
- Build search API endpoint (GET /api/calls with query params)
- PostgreSQL full-text search on transcript + summary

Topics: tsvector, tsquery, to_tsvector(), database index,
Prisma raw queries, dynamic query parameters

Checkpoint: GET /api/calls?q=angry returns matching calls. Via API only.

---

### WEEK 2 — The Intelligence (Days 8–11)
**Goal:** Natural language search works. The aha moment is real.

---

**Day 8 — Query Understanding**
- Build Gemini query interpreter
- Input: plain English → Output: structured filters JSON
- Supported filters: sentiment, dateRange, keyword, outcome, callType

Topics: prompt engineering for classification, structured extraction,
handling queries with no matching filters

Checkpoint: "show angry calls" → { sentiment: "negative" } → results return.

---

**Day 9 — Combined Search**
- Combine query understanding with full-text search
- Dynamic Prisma where clause (optional filters)
- Handle empty results gracefully

Checkpoint: Three different natural language queries return sensible results.

---

**Day 10 — UI: Call List Page**
- Call list with search input
- Server Component fetches initial data
- Client-side search input triggers API

Topics: Server vs Client Components, use client directive,
loading.tsx, search input pattern

Checkpoint: Open app in browser. Search works. Results appear.

---

**Day 11 — UI: Call Detail Page**
- Dynamic route /calls/[id]
- Show: transcript, summary, outcome, sentiment
- Color-code sentiment visually

Topics: dynamic routes, single record fetch,
transcript display with line breaks, conditional styling

Checkpoint: Clicking any call shows full details including AI analysis.

---

### WEEK 3 — Ship It (Days 12–15)
**Goal:** Live, documented, shareable.

---

**Day 12 — Error Handling**
- Gemini down → call still saves (analysis queued or skipped)
- Duplicate webhook → idempotency handles it silently
- Empty transcript → skip analysis, flag call
- All endpoints return correct HTTP status codes

Checkpoint: Break things intentionally. All failures are graceful.

---

**Day 13 — Deployment**
- Connect GitHub to Vercel
- Set all environment variables in Vercel dashboard
- Update webhook URL in Retell/Vapi to production URL
- Verify a real call reaches production

Checkpoint: Live Vercel URL receives a real call end-to-end.

---

**Day 14 — README + Demo**
README structure (in this exact order):
1. One-sentence description
2. Demo GIF (call ends → search finds it)
3. Why this exists
4. Quick start (4 commands max)
5. Connect your voice agent (Retell, Vapi, generic)
6. Environment variables reference
7. Contributing

Checkpoint: A stranger can set up AgentBridge using only the README.

---

**Day 15 — First DM**
Find 3 voice-agent founders on Twitter/X.
Search: "built with Retell" or "built with Vapi"

Message template (write your own version):
- One sentence: what you built
- One sentence: why
- One question: does this solve a real problem?
- GitHub link
- No ask to hire. Just genuine curiosity.

Checkpoint: 3 DMs sent. Repo public. V1 done.

---

## Part 11 — V1 Success Criteria

**V1 is done when ALL of these are true. Not before.**

- [ ] Retell test call arrives and saves within 5 seconds
- [ ] Vapi test call arrives and saves within 5 seconds
- [ ] Every saved call has Gemini analysis within 30 seconds
- [ ] call_analysis.metrics JSONB column populated on every call
- [ ] audio_metadata stored on every call (raw, unparsed)
- [ ] Searching "angry" returns negative sentiment calls
- [ ] Searching "refund" returns calls with that word in transcript
- [ ] App is live on public Vercel URL
- [ ] A stranger can set it up from the README alone
- [ ] README has a demo GIF
- [ ] GitHub repo is public

**When all 11 boxes are checked, open Phase 2 of this document.**

---

## Part 12 — Boundaries (V1)

**Always do:**
- Commit to GitHub at end of every day
- Keep .env out of GitHub
- Test full pipeline after any lib/ change

**Ask before doing:**
- Adding any npm package not mentioned here
- Changing the database schema after Day 4
- Adding any feature outside V1 scope

**Never do:**
- API keys in any .ts or .tsx file
- Provider-specific code outside lib/normalizer/
- Multi-tenancy, auth, or billing before core pipeline works
- Features that don't serve: "I made a call and instantly know what happened"

---

---

# ════════════════════════════════════════════
# PHASE 2 — V2: Voice Intelligence (Days 16–30)
# ════════════════════════════════════════════

> **READ THIS ONLY AFTER ALL V1 SUCCESS CRITERIA ARE CHECKED.**
> Building V2 before V1 is validated is a trap. Don't fall into it.

---

## Part 13 — What V2 Actually Is

V1 answers: "What happened on this call?"
V2 answers: "Why did it go well or badly — and exactly where?"

V1 gives you: summary, outcome, sentiment.
V2 gives you: the full picture of agent behavior, customer emotion,
call health — AND the ability to define your own metrics without writing code.

The pipeline structure doesn't change.
You are adding analyzers to `lib/analyzers/v2/`.
Each one writes results to `call_analysis.metrics` JSONB.
New tables support custom metric definitions, thresholds, and issues.

```
V1 Flow (unchanged):
transcript → gemini.ts → { summary, outcome, sentiment }

V2 Addition (parallel, after V1 save):
transcript + audio_metadata → v2 analyzers → { metrics JSONB }
user-defined prompts      → llm-judge.ts  → { custom metrics JSONB }
keyword/regex rules       → patterns.ts   → { pattern matches JSONB }
threshold rules           → thresholds.ts → { issues created if triggered }
```

---

## Part 14 — V2 Mental Model (Before Writing Any Code)

**The Dual-Readability Principle**

Every V2 metric produces two outputs. Non-negotiable.

```
Metric: Sentiment Arc
Developer:   { q1: "negative", q2: "neutral", q3: "positive", q4: "positive" }
Business:    "Customer started frustrated, ended satisfied. Agent recovered well."

Metric: Loop Detection
Developer:   { triggered: true, turn: 14, sample: "I understand your concern", count: 3 }
Business:    "Agent repeated the same response 3 times. Script update needed."

Metric: Human Handoff Detection
Developer:   { needed: true, recognized: false, trigger: "manager_request", turn: 9 }
Business:    "This call needed a human. Agent did not escalate. Review required."

Custom Metric (LLM as Judge):
Developer:   { result: false, confidence: 0.91, reasoning: "Agent skipped verification step" }
Business:    "Identity not verified. Compliance risk."
```

Developer score → `metrics` JSONB.
Business verdict → `verdicts` JSONB.
Both on the same `call_analysis` row.

---

## Part 15 — V2 Database Changes

Four additions. All migrations, not rebuilds.

**Add to call_analysis table:**
```
verdicts  JSONB   ← plain-English business verdict per metric
```

**Add to calls table:**
```
call_type  TEXT   ← update from 'unknown' to actual type via Gemini
```

**New table: metric_definitions**
Stores user-defined custom metrics (LLM as Judge + Pattern).
```
id           TEXT  (auto)
name         TEXT  ("Identity Verified", "Refund Mentioned")
type         TEXT  (llm_judge | pattern)
prompt       TEXT  (for llm_judge: the evaluation prompt)
pattern      TEXT  (for pattern: keywords or regex)
output_type  TEXT  (boolean | scale | classification | count)
created_at   TIMESTAMP
```

**New table: issues**
Stores flagged calls (created when threshold is breached).
```
id           TEXT  (auto)
call_id      TEXT  (foreign key → calls.id)
metric_name  TEXT  ("frustration_score", "human_handoff")
severity     TEXT  (low | medium | high | critical)
reason       TEXT  (plain-English description)
status       TEXT  (open | reviewed | resolved)
created_at   TIMESTAMP
```

Everything else already exists from V1's V2-aware schema decisions.

---

## Part 16 — V2 Folder Structure Addition

```
lib/
├── analyzers/
│   ├── index.ts              ← Updated: runs all analyzers in sequence
│   ├── v1/
│   │   └── gemini.ts         ← Unchanged from V1
│   └── v2/
│       ├── call-classifier.ts  ← Classifies call_type
│       ├── loop-detector.ts    ← String-based repetition detection
│       ├── sentiment-arc.ts    ← Quarter-by-quarter sentiment via Gemini
│       ├── frustration-spike.ts ← Sudden drop detection via Gemini
│       ├── human-handoff.ts    ← Escalation signal detection
│       ├── voice-metrics.ts    ← Silence, pace, talk-over from audio_metadata
│       ├── quality-metrics.ts  ← redundant_questions, comprehension_failure, etc.
│       ├── llm-judge.ts        ← Runs user-defined custom metric prompts
│       └── pattern-detector.ts ← Keyword/regex matching on transcript
│
└── thresholds/
    └── evaluator.ts          ← Checks metrics against threshold rules → creates issues
```

Each analyzer follows the same interface:
- Input: `{ transcript: string, audioMetadata: object, callDuration: number }`
- Output: `{ score: object, verdict: string }`

---

## Part 17 — V2 Metric Groups

### Group 1 — Loop Detection
*Build this FIRST on Day 17. Easiest win, clearest signal.*

**What it measures:**
Did the agent repeat the same or very similar response 3+ times?

**Why first:**
Easiest to verify. You can see it with your own eyes in the transcript.
Good calibration test for your V2 pipeline before tackling harder metrics.

**Detection method — string normalization (no ML, no embeddings):**
1. Extract all agent turns from transcript
2. Normalize each: lowercase, remove punctuation, strip filler words
3. Compare each pair using simple character overlap ratio
4. If ratio > 0.75 between 3+ turns → loop detected
5. Record which turn numbers and a sample phrase

**Why NOT semantic similarity:**
Semantic similarity requires embeddings (extra library, extra cost, extra complexity).
String normalization catches loops just as well — agents repeat nearly identical text.
Simple is better here.

**Output:**
```json
{
  "loop_detected": true,
  "repeated_turns": [5, 9, 13],
  "sample_phrase": "I understand your concern, let me check that for you",
  "loop_count": 3,
  "repetition_density": 0.43
}
```
Verdict: "Agent repeated the same response 3 times at turns 5, 9, and 13."

---

### Group 2 — Sentiment Arc + Frustration Spike
*Build together on Days 18–19. Core value of V2.*

**Sentiment Arc — What it measures:**
How customer emotion CHANGED across the call, not just the final state.
Split transcript into 4 equal quarters. Score each quarter separately.

**Why better than a single sentiment score:**
"Started angry, ended satisfied" = agent WIN.
"Started neutral, ended angry" = agent FAILURE.
Both score as "mixed." The arc tells the truth.

**Gemini prompt concept for arc:**
"You are analyzing a voice call transcript.
Divide the customer's dialogue into 4 equal time segments.
For each segment, classify customer sentiment:
very_negative / negative / neutral / positive / very_positive.
Return only JSON: { q1: '', q2: '', q3: '', q4: '' }"

**Frustration Spike — What it measures:**
The exact turn where sentiment suddenly dropped.
What the agent said immediately before it dropped.

**Gemini prompt concept for spike:**
"Review this transcript. Did the customer's frustration suddenly increase
at any point? If yes, identify: the turn number, what the agent said
that triggered it, and whether the agent attempted recovery.
Return only JSON: { spike_detected: bool, turn: number, trigger: string, recovery: bool }"

**Output (Arc):**
```json
{ "q1": "negative", "q2": "negative", "q3": "neutral", "q4": "positive" }
```
Verdict: "Customer started frustrated but agent turned the call around."

**Output (Spike):**
```json
{ "spike_detected": true, "turn": 14, "trigger": "I cannot process refunds", "recovery": false }
```
Verdict: "Frustration spike at turn 14. Agent's refund denial triggered it. No recovery attempted."

---

### Group 3 — Human Handoff Detection
*Day 20. Most business-critical metric.*

**What it measures:**
Two things combined:
1. Did this call NEED a human?
2. Did the agent RECOGNIZE it and escalate?

**Why this matters above everything else:**
A call that needed a human but didn't get one is a failed call regardless
of all other metrics. This is what keeps operations managers up at night.

**Detection — two layers:**

Layer 1 (Pattern, instant, no AI):
Scan transcript for escalation signals:
- "speak to a manager" / "talk to a human" / "real person"
- "this is unacceptable" / "I'm going to complain"
- "you're not understanding me" (3+ times)
- "I've already told you"

Layer 2 (Gemini, confirms and enriches):
"Based on this transcript, did the situation require human intervention?
Did the agent recognize this and escalate? Return JSON:
{ needed: bool, recognized: bool, trigger_signals: string[], turn: number }"

**Why two layers:**
Pattern catches the obvious cases fast and cheap.
Gemini handles the subtle cases where no explicit words were used
but the situation clearly needed a human.

**Output:**
```json
{
  "human_needed": true,
  "agent_recognized": false,
  "trigger_signals": ["manager_request", "repeated_issue"],
  "trigger_turn": 11
}
```
Verdict: "Escalation was needed at turn 11. Agent did not recognize this. Review required."

---

### Group 4 — Voice-Native Metrics
*Day 21. Calculable from audio_metadata stored in V1.*

These metrics DO NOT require ML models.
Retell and Vapi include word-level timestamps in their webhook payloads.
V1 stored all of it in `audio_metadata` JSONB. V2 just parses it.

**Silence Rate:**
- What: % of call duration with gaps > 2 seconds between turns
- How: parse `audio_metadata.word_timestamps`, find gaps between last
  word of one turn and first word of next turn
- Signal: >8% silence = agent has response delay problem
- Output: `{ silence_rate: 0.06, longest_pause_seconds: 4.2 }`

**Speaking Pace:**
- What: Agent words per minute
- How: agent word count from transcript / (agent talk time from audio_metadata)
- Signal: <100 WPM = too slow / >180 WPM = too fast
- Output: `{ agent_wpm: 142, classification: "normal" }`

**Talk-Over Rate:**
- What: % of call where agent and customer spoke simultaneously
- How: overlap between agent turn timestamps and customer turn timestamps
- Signal: >3% overlap = agent interruption problem
- Output: `{ overtalk_ratio: 0.02, agent_cutoff_count: 1 }`

**Important caveat:** If your Retell/Vapi webhook payload does NOT include
word-level timestamps, these metrics will be null. Check the provider docs
during V1 to confirm what timing data is available.

---

### Group 5 — Quality Metrics via Gemini
*Day 21 (combined with voice-native, same day).*
*Inspired directly by Roark's system metric reference.*
*All implemented as Gemini prompts — no specialized ML needed.*

| Metric | What Gemini Checks | Output Type |
|---|---|---|
| `redundant_question_count` | Times agent asked for info customer already gave | Count |
| `comprehension_failure` | Did agent misunderstand what customer said? | Boolean |
| `instruction_follow` | Did agent follow its system prompt instructions? | Scale 1-5 |
| `user_effort_score` | How hard did customer work to get help? | Scale 1-5 |
| `voicemail_detected` | Did call reach voicemail instead of a person? | Boolean |
| `missed_response` | Times agent should have responded but didn't | Count |

These all go in one Gemini call per call — one prompt asking for all six values.
Efficient. One API call, six metrics.

---

### Group 6 — LLM as Judge (Custom Metrics UI)
*Day 22. This is the most powerful V2 feature.*

**What it is:**
Users define their own evaluation metrics through the UI.
No code. Just a prompt and an expected output type.
AgentBridge runs it against every new call automatically.

**Why this matters:**
Every business has different requirements. A healthcare company needs
"Did agent ask for insurance information?" A sales company needs
"Did customer agree to a demo?" Hardcoded analyzers can't cover this.
LLM as Judge means AgentBridge adapts to any use case.

**How it works:**
1. User opens "Custom Metrics" page in AgentBridge UI
2. Writes a metric name: "Identity Verified"
3. Writes a prompt: "Did the agent verify the caller's identity before
   proceeding? Answer only with true or false."
4. Selects output type: boolean
5. Saves. From that point, every new call is evaluated against this metric.

**The `llm-judge.ts` analyzer:**
- Loads all active metric_definitions from database
- For each definition: sends transcript + prompt to Gemini
- Parses typed response (boolean / scale / classification / count)
- Writes result to `call_analysis.metrics.custom`

**Example custom metrics users would define:**
```
"Did the agent verify identity?"           → boolean
"Rate empathy on a scale of 1 to 5"       → scale
"What was the primary call reason?"        → classification
"How many times did customer repeat issue?"→ count
"Did agent offer a refund proactively?"    → boolean
"Did call end with a clear next step?"     → boolean
```

**Output:**
```json
{
  "custom": {
    "identity_verified": { "result": false, "reasoning": "No verification step taken" },
    "empathy_score": { "result": 3, "reasoning": "Acknowledged frustration but didn't validate" }
  }
}
```

---

### Group 7 — Pattern Detection
*Day 23. No AI. Instant. High value.*

**What it is:**
User defines keywords or phrases. AgentBridge flags every call where
those words appear in the transcript. Zero AI cost. Pure string matching.

**Why this is powerful:**
- Fastest feature to use once built
- Business owners understand it immediately
- No prompts to engineer, no AI to tune
- Works offline if Gemini is down

**How it works:**
1. User opens "Patterns" page
2. Writes pattern name: "Refund Mentions"
3. Writes keywords: `refund, money back, return payment, give me back`
4. Saves. Every call is scanned. Matching calls are flagged.

**The `pattern-detector.ts` analyzer:**
- Loads all active pattern definitions from database
- Scans transcript for each keyword (case-insensitive)
- Records which turn each match appeared on
- Writes to `call_analysis.metrics.patterns`

**Example patterns users would create:**
```
"Competitor Mentions"    → amazon, google, other company, competitor
"Cancellation Risk"      → cancel, unsubscribe, stop service, want out
"Legal Threats"          → lawyer, lawsuit, sue, legal action
"Positive Signals"       → love it, great service, very helpful, perfect
"Compliance Keywords"    → recording, data, privacy, GDPR, delete my data
```

**Output:**
```json
{
  "patterns": {
    "refund_mentions": { "matched": true, "turns": [7, 12], "count": 2 },
    "cancellation_risk": { "matched": false }
  }
}
```

---

### Group 8 — Thresholds and Issues System
*Day 26. The operational layer.*

**What it is:**
User defines rules: "if metric X crosses value Y, create an issue."
Issues are flagged calls that need human review.

**Why this matters:**
Metrics alone are data. Thresholds turn data into action.
Without thresholds, someone has to manually scan all metrics.
With thresholds, AgentBridge tells you what to look at.

**How thresholds work:**
User sets in UI:
```
if frustration_score > 3          → create HIGH severity issue
if human_handoff.needed = true
   AND human_handoff.recognized = false → create CRITICAL issue
if loop_detection.loop_count > 2  → create MEDIUM issue
if custom.identity_verified = false → create HIGH issue
```

**The `thresholds/evaluator.ts` logic:**
- Runs after all analyzers complete
- Loads all threshold rules from database
- Evaluates each rule against the call's metrics
- Creates issue rows in the `issues` table for triggered rules

**Issues UI:**
- Issues list page: all open issues, sorted by severity
- Filter by: severity, metric name, date, agent
- Mark as: reviewed / resolved
- One-click to the call that triggered it

**Output (issue row):**
```json
{
  "call_id": "abc123",
  "metric_name": "human_handoff",
  "severity": "critical",
  "reason": "Call needed human escalation but agent did not recognize it.",
  "status": "open"
}
```

---

### Group 9 — Call Type Specific Metrics
*Days 25-26. Gated by call_type.*

Run only when call_type matches. Gemini-based. One prompt per type.

**Sales Calls:**
- Did customer show buying signals?
- Did call end with a confirmed next step?
- Were all major objections addressed?

**Support Calls:**
- Did agent correctly identify the problem?
- Was the solution complete or partial?
- Did agent lack information they should have had?

**Debt Collection Calls:**
- Did customer commit to a payment? (Amount + date extracted)
- Did agent stay within professional tone under pressure?
- Was a payment dispute handled correctly?

---

## Part 18 — What V2 Is NOT Building

| Skipped | Why |
|---|---|
| 64+ emotion detection | Requires Hume or equivalent specialized ML model. Not Gemini. |
| Accent detection | Requires audio + specialized classification model. Not transcript. |
| DNSMOS speech quality | ITU-T MOS scoring requires audio signal processing. Not possible from text. |
| Semantic similarity for loops | Requires embeddings. String normalization is simpler and good enough. |
| Simulation engine | Separate product (FutureAGI, Roark do this). Not AgentBridge's lane. |
| Compliance group (FDCPA, HIPAA) | V3. Needs legal review and industry-specific configuration. |
| Formula metrics (combine metrics) | V3. Complex UI builder. Not worth building before users ask for it. |
| BLEU / ROUGE scores | Statistical NLP metrics. Meaningless for voice call quality. |

---

## Part 19 — 15-Day V2 Timeline

**Before Day 16:**
Observe 100 real calls that came through V1.
Don't build anything. Just read the transcripts.
Ask: where do agents fail most? What do you see that a metric should catch?
That observation calibrates which thresholds make sense.

---

**Day 16 — V2 Foundation**
- Add `verdicts` JSONB column to call_analysis (migration)
- Create `metric_definitions` table (migration)
- Create `issues` table (migration)
- Update lib/analyzers/index.ts to support multiple analyzers in sequence
- Define the shared analyzer interface in types/index.ts
- Build call-classifier.ts (Gemini classifies call_type)

Checkpoint: Old calls get call_type classified. New tables exist in Neon.

---

**Day 17 — Loop Detection**
*Start here. Build confidence with V2 pipeline before harder metrics.*

- Build lib/analyzers/v2/loop-detector.ts
- String normalization approach (no embeddings)
- Writes to call_analysis.metrics.loop_detection + verdicts

Checkpoint: A call with a looping agent correctly flags loop_detected: true.
Verify by reading a real transcript and confirming the output matches what you see.

---

**Day 18-19 — Sentiment Arc + Frustration Spike**
- Build lib/analyzers/v2/sentiment-arc.ts
- Build lib/analyzers/v2/frustration-spike.ts
- Both use Gemini. Two separate prompts. Both write to metrics + verdicts.

Topics to understand: how to structure a Gemini prompt that returns
consistent JSON across different call types. Prompt stability matters here —
test with 5+ real transcripts before considering this done.

Checkpoint: A call that started negative and ended positive shows a positive arc.
A call where agent caused frustration shows the correct trigger turn.

---

**Day 20 — Human Handoff Detection**
*Give this a full day. It's the most important metric.*

- Build lib/analyzers/v2/human-handoff.ts
- Layer 1: keyword pattern matching (fast, no API call)
- Layer 2: Gemini confirmation (slower, more accurate)
- Dual output: needed + recognized

Checkpoint: A call containing "speak to a manager" flags human_needed: true.
A call with subtle escalation need (no explicit words) also flags correctly.

---

**Day 21 — Voice-Native + Quality Metrics**
*Two sets of metrics, one day. They're simpler than previous days.*

Morning: Voice-native (parse audio_metadata)
- Build silence rate calculator
- Build speaking pace calculator
- Build talk-over rate calculator

Afternoon: Quality metrics (one Gemini call, six outputs)
- Build lib/analyzers/v2/quality-metrics.ts
- One prompt asking Gemini for all six quality metrics at once
- redundant_questions, comprehension_failure, instruction_follow,
  user_effort_score, voicemail_detected, missed_response

Checkpoint: All metrics populated. Voice metrics null on calls without
audio_metadata timing data (that's fine — log it, don't crash).

---

**Day 22 — LLM as Judge (Custom Metrics)**
*The feature that makes AgentBridge feel like a real product.*

- Build metric_definitions CRUD API (create, read, update, delete)
- Build lib/analyzers/v2/llm-judge.ts
- Build simple Custom Metrics UI page
- Wire up: save metric definition → runs on every future call

Topics: how to build a CRUD API in Next.js App Router.
How to store and retrieve user-defined prompts safely.

Checkpoint: Create a custom metric "Did agent verify identity?" → boolean.
Make a test call. Confirm the custom metric result appears on the call detail page.

---

**Day 23 — Pattern Detection**
*Fastest day in V2. Build confidence.*

- Build pattern definitions CRUD API
- Build lib/analyzers/v2/pattern-detector.ts
- Build simple Patterns UI page
- Wire up: save pattern → scans every future call transcript

Checkpoint: Create pattern "Cancellation Risk" with keywords "cancel, unsubscribe".
Make a test call mentioning cancellation. Confirm it's flagged correctly.

---

**Day 24 — V2 UI: Metrics Dashboard**
- Update call detail page to show all V2 metrics
- Sentiment arc as a simple 4-point visual (colored dots or bar)
- Human handoff flag as a red alert banner at the top
- Loop detection as an amber warning badge
- Custom metric results as a card list
- Pattern matches highlighted in transcript
- Verdicts shown as plain-English sentences — not JSON, not numbers

Topics: conditional rendering in React.
How to highlight specific text in a transcript display.

Checkpoint: A non-technical person opens a call and immediately understands
what happened and what needs attention. No explanation required.

---

**Day 25-26 — Thresholds + Issues System**
- Build threshold rules CRUD API
- Build lib/thresholds/evaluator.ts
- Build Issues list page (filter by severity, status, metric)
- Build Issues detail: links back to the call that triggered it
- Wire up: after analyzers complete → evaluator runs → issues created

Checkpoint: Set threshold "frustration_score > 3 → HIGH severity issue."
Make a call with an angry customer. Confirm an issue appears in the issues list.

---

**Day 27 — Call Type Specific Metrics + Buffer**
Morning: Build Sales + Support analyzers (gated by call_type)
Afternoon: Fix everything that broke in Days 16–26

Checkpoint: A sales call shows sales metrics. A support call shows support metrics.
Full V2 pipeline runs reliably 3 times in a row end-to-end.

---

**Day 28 — FutureAGI Optional Exporter**
*The strategic contribution. One config flag.*

- Build lib/exporters/futureagi.ts
- Config: EVALUATION_PROVIDER=futureagi
- When enabled: post call transcript + analysis to FutureAGI tracing API
- When disabled (default): Gemini only. AgentBridge works standalone.

This is your PR contribution to their n8n repo.
This is your conversation starter with their team.

Checkpoint: EVALUATION_PROVIDER=futureagi set → call appears in FutureAGI dashboard.

---

**Day 29 — V2 README Update**
- Add V2 section to README
- Document: custom metrics, pattern detection, thresholds, issues
- Add V2 demo GIF showing: custom metric created → call made → issue triggered
- Keep quick start section to 4 commands maximum

---

**Day 30 — Outreach**
- Find 3 founders using Retell/Vapi + FutureAGI on Twitter
- DM: "I built the open-source observability layer for voice agents. Custom metrics, pattern detection, threshold alerts. No cloud required. Would love feedback."
- Submit PR to FutureAGI n8n repo with voice agent workflow example
- Post GitHub repo with demo GIF publicly

---

## Part 20 — V2 Success Criteria

**Core pipeline:**
- [ ] Every call has a sentiment arc (4-point trajectory, not single score)
- [ ] Loop detection fires correctly using string normalization
- [ ] Human handoff correctly identifies escalation-needed calls
- [ ] Quality metrics (6 total) populated on every call via single Gemini call
- [ ] Voice-native metrics populated where audio_metadata is available

**Custom system:**
- [ ] User can create a custom LLM as Judge metric with no code
- [ ] Custom metric runs automatically on every new call
- [ ] User can create a keyword pattern and it flags matching calls
- [ ] User can set a threshold rule and it creates issues automatically

**UI:**
- [ ] Verdicts show plain-English explanations on every call
- [ ] Issues list is filterable by severity and status
- [ ] A business owner can understand a call detail page without explanation

**Strategic:**
- [ ] FutureAGI exporter works with EVALUATION_PROVIDER=futureagi
- [ ] V2 README documents all features clearly
- [ ] Demo GIF shows the custom metric flow end-to-end

---

## Part 21 — V3 Ideas (Do Not Build Yet)

These are real features. Build them only after V2 has real users.

- Formula metrics (combine multiple metrics with boolean logic)
- Compliance pack (FDCPA, HIPAA, GDPR — needs legal review)
- Scheduled metric collection jobs (re-run metrics on old calls)
- Real-time monitoring (live call alerts via WebSocket)
- Cross-provider comparison dashboard (Retell vs Vapi side-by-side)
- Knowledge base upload (attach SOPs, agent scripts for compliance checks)

---

## The Two Sentences That Govern This Project

**V1:**
> "I made a call and instantly know what happened."

**V2:**
> "I made a call and instantly know not just what happened — but exactly
>  where it went wrong, for which customer, and what to fix.
>  And I can define what 'wrong' means for my own business."

If what you're building doesn't serve one of these sentences, it goes in the backlog.

