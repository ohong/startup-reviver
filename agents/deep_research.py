from deepagents import create_deep_agent
from dotenv import load_dotenv
from prompts import get_prompt, research_orchestrator_prompt
from tools import deep_research, web_search

load_dotenv()

# Subagents (static system prompts)
subagents = [
    {
        "name": "scoping-agent",
        "description": "Scoping & hypotheses",
        "system_prompt": get_prompt("scoping-agent"),
        "tools": [web_search],
    },
    {
        "name": "web-agent",
        "description": "Broad web search",
        "system_prompt": get_prompt("web-agent"),
        "tools": [web_search],
    },
    {
        "name": "deep-agent",
        "description": "Deep synthesis",
        "system_prompt": get_prompt("deep-agent"),
        "tools": [deep_research],
    },
    {
        "name": "funding-agent",
        "description": "Funding dynamics",
        "system_prompt": get_prompt("funding-agent"),
        "tools": [web_search, deep_research],
    },
    {
        "name": "org-agent",
        "description": "Org & people",
        "system_prompt": get_prompt("org-agent"),
        "tools": [deep_research],
    },
    {
        "name": "gtm-agent",
        "description": "GTM & ads",
        "system_prompt": get_prompt("gtm-agent"),
        "tools": [web_search],
    },
    {
        "name": "reviews-agent",
        "description": "Reviews & NPS",
        "system_prompt": get_prompt("reviews-agent"),
        "tools": [web_search],
    },
    {
        "name": "finance-agent",
        "description": "Finance & sim",
        "system_prompt": get_prompt("finance-agent"),
        "tools": [deep_research],
    },
    {
        "name": "external-agent",
        "description": "PESTEL overlay",
        "system_prompt": get_prompt("external-agent"),
        "tools": [web_search],
    },
    {
        "name": "synthesis-agent",
        "description": "Causal synthesis",
        "system_prompt": get_prompt("synthesis-agent"),
        "tools": [deep_research],
        "model": "openai:gpt-4o",
    },
]

agent = create_deep_agent(
    model="openai:gpt-4.1",  # default model for agents without overrides
    system_prompt=research_orchestrator_prompt,  # orchestrator/system-level guidance
    subagents=subagents,
    debug=True,
)
