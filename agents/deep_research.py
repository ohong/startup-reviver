import os
from deepagents import create_deep_agent
from prompts import get_prompt, research_orchestrator_prompt
from perplexity import Perplexity
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Tools
perplexity_client = Perplexity()
openai_client = OpenAI()

def web_search(query: str, max_results: int = 5):
    """Perform a web search for the given query using the Perplexity client.

    Args:
        query (str): The search query.
        max_results (int, optional): Maximum number of results to return. Default is 5.

    Returns:
        list or dict: Search results returned by the Perplexity client.
    """
    res = perplexity_client.search(query=query, max_results=max_results)
    return res

def deep_research(query: str):
    """
    Perform a deep research task for the given query using the OpenAI client.

    Args:
        query (str): The research query to process.

    Returns:
        obj: The response from the OpenAI deep research endpoint.
    """
    # Replace with your Deep Research endpoint if different
    r = openai_client.responses.create(model="gpt-4.1", input=[{"role":"user","content":query}])
    return r.output_text

# Subagents (static system prompts)
subagents = [
    {
        "name":"scoping-agent",
        "description":"Scoping & hypotheses",
        "system_prompt": get_prompt("scoping-agent"),
        "tools":[web_search]
    },
    {
        "name":"web-agent",
        "description":"Broad web search",
        "system_prompt": get_prompt("web-agent"),
        "tools":[web_search]},
    {
        "name":"deep-agent",
        "description":"Deep synthesis",
        "system_prompt": get_prompt("deep-agent"),
        "tools":[deep_research]
    },
    {
        "name":"funding-agent",
        "description":"Funding dynamics",
        "system_prompt": get_prompt("funding-agent"),
        "tools":[web_search, deep_research]
    },
    {
        "name":"org-agent",
        "description":"Org & people",
        "system_prompt": get_prompt("org-agent"),
        "tools":[deep_research]
    },
    {
        "name":"gtm-agent",
        "description":"GTM & ads",
        "system_prompt": get_prompt("gtm-agent"),
        "tools":[web_search]
    },
    {
        "name":"reviews-agent",
        "description":"Reviews & NPS",
        "system_prompt": get_prompt("reviews-agent"),
        "tools":[web_search]
    },
    {
        "name":"finance-agent",
        "description":"Finance & sim",
        "system_prompt": get_prompt("finance-agent"),
        "tools":[deep_research]
    },
    {
        "name":"external-agent",
        "description":"PESTEL overlay",
        "system_prompt": get_prompt("external-agent"),
        "tools":[web_search]
    },
    {
        "name":"synthesis-agent",
        "description":"Causal synthesis",
        "system_prompt": get_prompt("synthesis-agent"),
        "tools":[deep_research]
    },
]

agent = create_deep_agent(
    model="openai:gpt-4.1",
    system_prompt=research_orchestrator_prompt,
    subagents=subagents,
)

# At RUN TIME, pass the company in the USER MESSAGE (no prompt changes needed):
company = "Homejoy"
question = f"Company to analyze: {company}. Task: Reconstruct why it failed and whether it would work now. Include funding, GTM, ads, reviews/NPS, struggles/shutdown, and a 2025 viability verdict."

result = agent.invoke({"input": question})
print(result)