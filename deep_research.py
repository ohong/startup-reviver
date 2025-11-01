from deepagents import create_deep_agent
from dotenv import load_dotenv
from tools import deep_research, web_search, get_company_details

from prompts import get_prompt

load_dotenv()

# Subagents (static system prompts)
subagents = [
    {
        "name": "scoping-agent",
        "description": "Scoping & hypotheses",
        "system_prompt": get_prompt("scoping-agent"),
        "tools": [web_search, get_company_details],
    },
    {
        "name": "web-agent",
        "description": "Broad web search",
        "system_prompt": get_prompt("web-agent"),
        "tools": [web_search, get_company_details],
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
        "tools": [web_search, deep_research, get_company_details],
    },
    {
        "name": "org-agent",
        "description": "Org & people",
        "system_prompt": get_prompt("org-agent"),
        "tools": [deep_research, get_company_details],
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
        "name": "founder-retrospective-agent",
        "description": "Founder retrospectives & post-mortems",
        "system_prompt": get_prompt("founder-retrospective-agent"),
        "tools": [web_search, deep_research, get_company_details],
    },
    {
        "name": "rebuild-2025-agent",
        "description": "2025 rebuild analysis with new tech",
        "system_prompt": get_prompt("rebuild-2025-agent"),
        "tools": [web_search, deep_research],
    },
    {
        "name": "market-2025-agent",
        "description": "Current market dynamics 2025",
        "system_prompt": get_prompt("market-2025-agent"),
        "tools": [web_search, deep_research],
    },
    {
        "name": "format-agent",
        "description": "Research format preparation & citation formatting",
        "system_prompt": get_prompt("format-agent"),
        "tools": [deep_research],
        "model": "openai:gpt-4o",
    },
    {
        "name": "synthesis-agent",
        "description": "Causal synthesis & Research Agent markdown report generation",
        "system_prompt": get_prompt("synthesis-agent"),
        "tools": [deep_research],
        "model": "openai:gpt-4o",  # Use gpt-4o for high-quality synthesis
    },
]

agent = create_deep_agent(
    model="openai:gpt-4o-mini",  # default model for agents without overrides
    system_prompt=get_prompt("research-orchestrator-system-prompt"),
    subagents=subagents,
    debug=True,
)

# Test query function for validation
def test_research(company_query: str):
    """Test the research agent with a company query."""
    result = agent.run(company_query)
    return result
