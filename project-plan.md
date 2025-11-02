# Startup of the Dead - Project Plan

## Work Streams (4 Parallel Tracks)

### **Stream 1: Orchestration & Infrastructure**
**Owner:** Engineer A
**Duration:** Hours 0-3, then integration support

**Tasks:**
1. Set up Mastra agent framework + message queue implementation
2. Build orchestrator agent with state machine (research → strategy → architect → code gen)
3. Implement message routing system with mailbox pattern
4. Create error handling: retries (3x), timeouts (30min hard limit), graceful degradation
5. Build YC API client + response caching
6. Set up output directory structure (`/output/[startup-name]/`)
7. Create progress tracking UI for demo (real-time agent status)

**Dependencies:** None - blocks all other streams
**Critical Path:** Must complete tasks 1-3 by Hour 1 for other streams to integrate

---

### **Stream 2: Research & Analysis Pipeline**
**Owner:** Engineer B
**Duration:** Hours 1-4

**Tasks:**
1. Integrate Perplexity API (rate limiting, retry logic)
2. Build Research Agent:
   - 3 search query templates (failure narrative, post-mortem, market context)
   - Parse Perplexity results → structured data extraction
   - Generate company profile + failure analysis report
3. Build Strategy Agent:
   - Failure reason analysis (still relevant in 2025? AI solvable?)
   - Generate resurrection strategy (value prop, modern approach, AI components)
   - Output structured JSON for architect
4. Test with 2 startups (Homejoy, Yik Yak)
5. Implement report caching for demo repeatability

**Dependencies:** Needs message queue from Stream 1 (Hour 1)
**Integration Point:** Sends STRATEGY_COMPLETE to Stream 3

---

### **Stream 3: Design & Code Generation Pipeline**
**Owner:** Engineer C
**Duration:** Hours 1-5

**Tasks:**
1. Build Architect Agent:
   - Tech stack selection logic (React/Express/SQLite default)
   - Generate file structure + API contracts
   - Create 3-4 MVP feature specs with acceptance criteria
   - Output technical spec in structured format
2. Build Frontend Code Agent:
   - React component generation from feature specs
   - API integration code
   - Tailwind styling templates
3. Build Backend Code Agent:
   - Express server + route generation
   - SQLite schema creation
   - API endpoint implementation
4. Build AI Integration Agent:
   - Claude API wrapper + prompt templates
   - AI endpoint generation (matching, recommendations, content gen)
5. Implement agent coordination (API_READY, AI_ENDPOINTS_READY messages)
6. Add code validation (syntax check before CODE_COMPLETE)

**Dependencies:** Needs strategy output from Stream 2
**Critical:** This is the most complex stream - consider sequential fallback if parallel coordination fails

---

### **Stream 4: Demo & Presentation**
**Owner:** Engineer D
**Duration:** Hours 0-2 (prep), Hours 6-8 (finalize)

**Phase 1 (Hours 0-2):**
1. Create 5-slide deck template
2. Design architecture diagram (for Slide 2)
3. Build demo UI skeleton (startup input + progress visualization)
4. Set up screen recording tooling (backup if live demo fails)

**Phase 2 (Hours 6-8):**
1. Test full pipeline with Homejoy
2. Record successful run (2-3 min video backup)
3. Finalize slides with actual outputs (report snippets, code screenshots)
4. Practice 5-minute presentation with transitions
5. Prepare talking points for each judging criterion

**Dependencies:** Needs working pipeline from other streams by Hour 6

---

## Timeline & Integration Points

**Hour 0-1:** Stream 1 builds core infrastructure; Stream 4 preps demo assets
**Hour 1:** Streams 2 & 3 begin (blocked until message queue ready)
**Hour 4:** Integration checkpoint - test Research → Strategy → Architect flow
**Hour 5:** Full pipeline test with code generation
**Hour 6-8:** All engineers debug, polish, demo prep

**Critical Success Factor:** Hour 4 checkpoint must show end-to-end flow (even if code gen is incomplete). This validates architecture before final push.
