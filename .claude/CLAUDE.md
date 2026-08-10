# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Startup of the Dead** is a multi-agent system that researches failed YC startups, analyzes why they failed, and generates working MVPs reimagined with modern AI capabilities. The system combines deep research, strategic analysis, and automated code generation.

## Tech Stack

**Frontend (Next.js)**
- Next.js 16 with App Router
- React 19, TypeScript
- Tailwind CSS 4
- v0-sdk for AI app generation

**Backend (Python)**
- LangGraph for agent orchestration (langgraph-cli)
- DeepAgents framework for multi-agent coordination
- Perplexity API for web research
- OpenAI GPT-4o/gpt-4o-mini for agents
- Hyperspell for YC company data indexing
- FastAPI for HTTP endpoints

**Infrastructure**
- Vercel for frontend deployment
- LiveKit for voice agent interactions

## Development Commands

### Next.js Frontend
```bash
# Development
npm run dev              # Start Next.js dev server on localhost:3000

# Build & Deploy
npm run build           # Production build
npm start               # Run production build
npm run lint            # Run ESLint
```

### Python Backend
```bash
# Setup (uses uv for dependency management)
uv sync                 # Install Python dependencies

# Run agents
langgraph dev          # Start LangGraph development server

# Code formatting (pre-commit hooks configured)
pre-commit run --all-files
```

### FastAPI Server
```bash
# Start FastAPI server (api.py)
uvicorn api:app --reload
```

## Architecture

### Multi-Agent Research System

The core of the system is a **14-agent swarm** orchestrated using DeepAgents (deep_research.py):

**Research Agents** (gather information):
- `scoping-agent` - Initial scoping & hypotheses generation
- `web-agent` - Broad web search
- `deep-agent` - Deep synthesis from multiple sources
- `funding-agent` - Funding rounds & investor dynamics
- `org-agent` - Organization structure & people
- `gtm-agent` - Go-to-market strategy & ads
- `reviews-agent` - Customer reviews & NPS
- `finance-agent` - Financial modeling & unit economics
- `external-agent` - PESTEL (external market factors)
- `founder-retrospective-agent` - Founder post-mortems
- `rebuild-2025-agent` - How to rebuild with 2025 tech (AI focus)
- `market-2025-agent` - Current market dynamics

**Synthesis Agents** (combine findings):
- `format-agent` - Format research output with proper citations
- `synthesis-agent` - Generate final markdown report (uses GPT-4o for quality)

Each agent has:
- Specific `system_prompt` from prompts.py
- Access to tools: `web_search`, `deep_research`, `get_company_details`, `save_result`
- Optional model override (default: gpt-4o-mini, synthesis uses gpt-4o)

### Research Pipeline Flow

```
User Input (company name)
  → Research Orchestrator (coordinates subagents)
    → Parallel agent execution (each investigates specific aspect)
      → Format Agent (structures output)
        → Synthesis Agent (final report generation)
          → save_result → reports/{company}-research-report.md
```

**Output**: 5,000-word research report following structure in `RESEARCH_AGENT_FORMAT` (prompts.py). See `reports/fetchr-research-report.md` as gold standard example.

### Specification Generation

After research, `spec_generation.py` converts research report into technical specification for code generation (not yet fully implemented).

### Frontend Architecture

**Next.js App Structure** (app/):
- `page.tsx` - Main landing page and startup input
- `api/` - API route handlers:
  - `generate/` - v0 AI app generation
  - `deployments/` - Vercel deployment automation
  - `autodeploy/` - One-click generation + deployment
  - `startups/` - Startup data endpoints

**Key Libraries** (lib/):
- `markdown-parser.ts` - Parse research reports
- `meilisearch.ts` - Search indexing for YC companies
- `livekit.ts` - Voice agent integration
- `mock-data.ts` - Sample company data

### Data Sources

**YC Companies**:
- `scripts/yc_companies_formatted.json` - Full YC company dataset (17MB)
- Indexed via Hyperspell for search: `get_company_details(company_name)` tool
- Also available as JSONL: `scripts/yc_companies_formatted.jsonl`

**Research Outputs**:
- `reports/` - Generated research reports
- `examples/` - Example reports and specs

## Key Files & Prompts

### Agent Configuration
- `deep_research.py` - Main agent orchestration setup
- `prompts.py` - All agent system prompts (1500+ lines)
  - `RESEARCH_AGENT_FORMAT` - Gold standard report structure
  - `EVIDENCE_RULES` - Research quality standards
  - Individual agent prompts with specific parameters to investigate

### Tools
- `tools.py` - Agent tools:
  - `web_search(query)` - Perplexity search
  - `deep_research(query)` - OpenAI deep research (gpt-4.1)
  - `get_company_details(name)` - Hyperspell YC data
  - `save_result(result)` - Write to reports/

### API Endpoints
- `api.py` - FastAPI server with three endpoints:
  - `POST /deep_research` - Start research job
  - `POST /generate-coding-specs` - Generate spec from report
  - `POST /create-prototype` - Generate code (TODO)

## Environment Variables

Required in `.env`:
```bash
# AI Services
ANTHROPIC_API_KEY=xxx
OPENAI_API_KEY=xxx
PERPLEXITY_API_KEY=xxx

# Data & Search
HYPERSPELL_API_KEY=xxx

# Frontend (Next.js, optional for v0 generation)
V0_API_KEY=xxx

# LiveKit (optional, for voice agents)
LIVEKIT_API_KEY=xxx
LIVEKIT_API_SECRET=xxx
```

## Testing

To test the research pipeline:
```bash
# Example test file
python test_homejoy.py
```

This invokes the agent with a specific company and validates output format.

## LiveKit Voice Agent

The `livekit/` directory contains a voice-enabled research agent that can discuss startup failures over voice calls. Uses LiveKit for real-time audio streaming.

## Vibehacker Subproject

`vibehacker/` is a standalone Next.js application ("Simple v0") - a simplified interface for v0 app generation with:
- Real-time AI app generation preview
- One-click Vercel deployment
- Project & chat management
- Rate limiting via Upstash Redis

See `vibehacker/README.md` for details. This is used as the UI for generated startup MVPs.

## Common Workflows

### 1. Research a Failed Startup
```bash
# Start LangGraph dev server
langgraph dev

# In another terminal, trigger research via API
curl -X POST http://localhost:8000/deep_research \
  -H 'Content-Type: application/json' \
  -d '{"company": "Homejoy"}'

# Output: reports/report.md (check email after ~30 min)
```

### 2. Generate Coding Spec from Report
```bash
# After research completes
curl -X POST http://localhost:8000/generate-coding-specs \
  -H 'Content-Type: application/json' \
  -d '{"company": "Fetchr"}'
```

### 3. Generate & Deploy App via Frontend
```bash
# Start Next.js dev server
npm run dev

# Use web UI at localhost:3000 or hit API:
curl -X POST http://localhost:3000/api/autodeploy \
  -H 'Content-Type: application/json' \
  -d '{"message": "Create an app for...", "modelId": "v0-1.5-md"}'
```

## Output Formats

**Research Report** (`reports/{company}-research-report.md`):
- Follows strict format from `RESEARCH_AGENT_FORMAT` in prompts.py
- Sections: Why Failed, Thesis, Founding Story, Product, Growth, Operations, Financials, Market Dynamics, Post-Mortem, 2025 Rebuild Analysis
- 5,000 words, inline citations, specific dates/numbers/quotes
- Reference `reports/fetchr-research-report.md` for quality standard

**Technical Spec** (planned):
- System architecture
- 3-4 core MVP features
- Tech stack selection
- AI integration points

## Code Style

**Python**:
- Formatted with Black (line length 88)
- Import sorting with isort (black profile)
- Pre-commit hooks enforce style
- Run `pre-commit run --all-files` before committing

**TypeScript**:
- ESLint configured (eslint.config.mjs)
- Run `npm run lint` to check

## Important Constraints

1. **Research Quality**: All claims must cite sources with URLs. Follow two-source rule for material claims. See `EVIDENCE_RULES` in prompts.py
2. **Agent Coordination**: DeepAgents handles message passing between subagents automatically
3. **Model Selection**: Synthesis uses GPT-4o for quality; other agents use gpt-4o-mini for cost efficiency
4. **Report Format**: Must exactly match `RESEARCH_AGENT_FORMAT` structure - see fetchr-research-report.md example
5. **Rate Limits**: When using Perplexity/OpenAI APIs, be mindful of rate limits (especially in parallel agent execution)

- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

## PR Comments

- When tagging Claude in GitHub issues, use '@claude'

## Changesets

To add a changeset, write a new file to the `.changeset` directory.

The file should be named `0000-your-change.md`. Decide yourself whether to make it a patch, minor, or major change.

The format of the file should be:

```md
---
"evalite": patch
---

Description of the change.
```

The description of the change should be user-facing, describing which features were added or bugs were fixed.

## GitHub

- Your primary method for interacting with GitHub should be the GitHub CLI.

## Git

- When creating branches, prefix them with `oh-` to indicate they came from me.

## Plans

- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise.
