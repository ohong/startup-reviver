# 🧟 Startup of the Dead

> **Resurrect failed YC startups for the AI era. Automatically.**

A multi-agent system that researches dead startups, analyzes why they failed, and generates working MVPs reimagined with modern AI capabilities.

## 💀 The Motivation

Great ideas often fail due to bad timing. A startup that couldn't make unit economics work in 2015 might thrive today with LLMs handling the expensive human labor. But manually researching, analyzing, and rebuilding these companies is time-consuming.

What if an AI agent swarm could do it automatically?

**Startup of the Dead** takes a failed YC company name and outputs:
- Deep research report on what went wrong
- Strategic analysis of how AI changes the game in 2025
- Complete technical specification
- Working MVP codebase, ready to run

Think of it as a startup resurrection machine.

## 🔮 How It Works

**Input:** Name of a defunct YC startup (e.g., "Homejoy")

**Output:** Fully functional MVP rebuilt with AI

### The Pipeline

```
User Input → Research → Strategy → Architecture → Code Generation → Working MVP
```

**1. Research Agent** (Perplexity + Claude)
- Searches for failure post-mortems, press coverage, founder reflections
- Extracts why the startup shut down and what they were trying to solve

**2. Strategy Agent** (Claude)
- Analyzes each failure reason: still relevant in 2025? Can AI solve it?
- Generates resurrection strategy with specific AI components

**3. Architect Agent** (Claude)
- Converts strategy into technical specification
- Designs system architecture and tech stack
- Defines 3-4 core MVP features

**4. Code Generation Team** (3 parallel agents)
- **Frontend Agent:** React components, UI, API integration
- **Backend Agent:** Express server, SQLite database, API endpoints
- **AI Agent:** Claude API integration, prompt engineering, intelligent features

All agents communicate via message queue, coordinating like a real engineering team.

**Total pipeline time:** ~20-30 minutes per startup

## 🛠 Tech Stack

**Orchestration**
- Mastra (agent framework)
- Message queue for agent coordination

**Research & Analysis**
- Perplexity API (web research)
- Claude Sonnet 4.5 (all agents)
- YC Company API (startup data)

**Generated Stack** (for resurrected startups)
- Frontend: React, Tailwind CSS, Vite
- Backend: Node.js, Express, SQLite
- AI: Claude API via Anthropic SDK

**Storage**
- Research cache (JSON)
- Generated code output directory

## 🎯 Built For

**The Summoners Track** - Agents that orchestrate other agents, end-to-end task completion

## 🚀 Quick Start

```bash
# Input a dead startup
node index.js --startup "Homejoy"

# Watch the magic happen
# Research → Strategy → Spec → Code → MVP

# Output location
./output/homejoy/
```

---

*Built at the [AgentMail HackHalloween](https://events.ycombinator.com/agentmail-yc25) at YC - October 31, 2025*
