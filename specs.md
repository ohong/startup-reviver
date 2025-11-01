# Startup of the Dead - Project Specification

## TL;DR
Multi-agent system that takes a failed YC startup name and outputs a working MVP codebase for a 2025 AI-powered version. Three sequential stages: Research & Analysis → Technical Design → Parallel Code Generation. Pipeline time: ~20-30 minutes per startup.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                       │
│         Routes messages, tracks progress, handles errors    │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
        ┌─────────────────┐    ┌──────────────────┐
        │  RESEARCH       │◄───┤  Message Queue   │
        │  AGENT          │    │   (AgentMail)    │
        └─────────────────┘    └──────────────────┘
                │                        ▲
                ▼                        │
        ┌─────────────────┐              │
        │  STRATEGY       │─────────-────┤
        │  AGENT          │              │
        └─────────────────┘              │
                │                        │
                ▼                        │
        ┌─────────────────┐              │
        │  ARCHITECT      │─────────────-┤
        │  AGENT          │              │
        └─────────────────┘              │
                │                        │
                ▼                        │
        ┌─────────────────────────────┐  │
        │  CODE AGENTS (Parallel)     │  │
        │  • Frontend                 │─-┤
        │  • Backend                  │  │
        │  • AI Integration           │─-┘
        └─────────────────────────────┘
                │
                ▼
        Working MVP in /output folder
```

---

## Agent Specifications

### **Orchestrator Agent**
- Accepts startup name, fetches YC API data
- Routes messages between agents via message queue pattern
- Each agent has a "mailbox" - sends structured messages: `{from, to, type, payload}`
- Tracks pipeline state machine, handles timeouts (30min hard limit)
- Outputs final package: research report + technical spec + code files

### **Research Agent** (8-12 minutes)
**Tools:** Claude Sonnet 4.5 + Perplexity API

**Process:**
1. Run 3 Perplexity searches: failure narrative, founder post-mortem, market context
2. Extract key facts: founding/shutdown dates, funding, stated failure reasons, competitors
3. Synthesize structured report

**Output:** Company profile, what they did (2-3 sentences), why they failed (3-5 specific reasons), market context (customer/problem/competitors), sources

**Quality Bar:** Must find ≥1 authoritative source on failure reasons

---

### **Strategy Agent** (5-7 minutes)
**Tools:** Claude Sonnet 4.5

**Analysis Framework:**
- For each failure reason: Is this still a problem in 2025? Can AI solve this? What's changed?

**Output:** 
- Executive summary (what/why failed/why now)
- Failure analysis (original reasons + 2025 mitigations using AI)
- Resurrection strategy (core value prop, modern approach, specific AI components, differentiators)
- Market opportunity (target user, pain point, solution)

**Example:** Homejoy failed on unit economics and cleaner retention → 2025 version uses AI matching, photo-based quality verification, AI customer service

---

### **Architect Agent** (5-7 minutes)
**Tools:** Claude Sonnet 4.5

**Output:**
- Tech stack (frontend: React/Tailwind, backend: Node/Express/SQLite, AI: Claude API)
- System architecture (components, responsibilities, data flow)
- MVP features (3-4 max) with user stories and acceptance criteria
- File structure + API contracts for agent coordination

**Design Principles:**
- Single-page app, local file DB, minimal dependencies
- Must run with `npm install && npm run dev`

---

### **Code Generation Team** (3 Parallel Agents, 10-15 min each)

**Frontend Agent:**
- Generate React components for all UI screens
- Implement API calls to backend
- Tailwind styling, form validation
- Outputs: Component files + package.json dependencies

**Backend Agent:**
- Express.js API server + SQLite schema
- API endpoints per architect spec
- Basic error handling
- Outputs: Server files + schema + environment variables needed
- Sends `API_READY` message to Frontend Agent with endpoint details

**AI Agent:**
- Claude API integration + prompt templates
- Build AI-powered endpoints (semantic search, recommendations, content generation)
- Outputs: AI service files + integration code
- Sends `AI_ENDPOINTS_READY` to Backend Agent with new routes

**Coordination:** Agents communicate via message queue - Frontend asks "I need /api/bookings endpoint with date param" → Backend confirms and implements

---

## Message Passing Protocol

Agents use structured messages with: `id, timestamp, from, to, type, payload, replyTo, priority`

**Key message types:** START_RESEARCH, RESEARCH_COMPLETE, STRATEGY_COMPLETE, SPEC_COMPLETE, CODE_COMPLETE, QUESTION, ANSWER, ERROR

**Example coordination:**
```
FRONTEND → BACKEND: "Need booking endpoint with date filter"
BACKEND → FRONTEND: "Confirmed, adding date param"
BACKEND: Updates code, sends CODE_UPDATE notification
```

---

## Demo Flow (5 minutes total)

**Slide 1 (30s):** Problem - thousands of startups fail, many were just too early  
**Slide 2 (30s):** Solution - show architecture diagram  
**Slide 3 (3min):** Live demo
- Enter "Homejoy"
- Show real-time progress for each agent
- Display research report highlights
- Show generated file tree
- Run MVP locally (or screen recording backup)

**Slide 4 (45s):** Why this wins - hits all 5 judging criteria  
**Slide 5 (15s):** Vision - startup resurrection as a service

---

## Success Metrics

**Functionality (5/5):** Pipeline completes end-to-end, code runs locally  
**Innovation (5/5):** Novel idea + sophisticated multi-agent coordination, not just a wrapper  
**Technical Quality (4-5/5):** Clean architecture, message passing, error handling  
**Impact (4-5/5):** Real-world application, perfect fit for "Agents that Coordinate" track  
**Presentation (5/5):** Clear narrative, live demo, memorable concept

**Projected Total: 23-25/25**

---

## Test Startups (Well-Documented Failures)

- **[Homejoy](https://www.ycombinator.com/companies/homejoy):** Cleaning marketplace, failed on unit economics
- **[Exec](https://www.ycombinator.com/companies/exec):** On-demand assistants, failed on retention

---

## Key Implementation Notes

- **External APIs:** YC API (company data), Perplexity (research), Claude Sonnet 4.5 (all agents)
- **Storage:** Cache research in JSON, write generated code to `/output/[startup-name]/`
- **Error handling:** 3 retries per agent, graceful degradation, 30min hard timeout
- **MVP constraint:** 3-4 core features max per startup - keep it tight