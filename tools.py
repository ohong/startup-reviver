import os

from dotenv import load_dotenv
from hyperspell import Hyperspell
from langchain_core.tools import tool
from openai import OpenAI
from perplexity import Perplexity

load_dotenv()

hyperspell_client = Hyperspell(
    api_key=os.getenv("HYPERSPELL_API_KEY"), user_id="startup-reviver"
)

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

perplexity_client = Perplexity(api_key=os.getenv("PERPLEXITY_API_KEY"))


@tool
def get_company_details(company_name: str):
    """Get company details from the Hyperspell index"""
    try:
        search_result = hyperspell_client.memories.search(query=company_name)

        full_details = hyperspell_client.memories.get(
            resource_id=search_result.documents[0].resource_id,
            source=search_result.documents[0].source,
        )

        return full_details.model_dump_json()

    except Exception as e:
        return f"ERROR: {e}"


@tool
def web_search(query: str):
    """Breadth web search via Perplexity; returns a normalized list of {title,url,snippet}."""
    try:
        resp = perplexity_client.search(query=query)

        return resp.model_dump_json()

    except Exception as e:
        return f"ERROR: {e}"


@tool
def deep_research(query: str):
    """
    Perform a deep research task for the given query using the OpenAI client.
    Returns plain text.
    """
    try:
        r = openai_client.responses.create(
            model="gpt-4.1",
            input=[{"role": "user", "content": query}],
            # reasoning={"effort": "medium"}  # optional
        )
        if hasattr(r, "output_text") and r.output_text:
            return r.output_text
        # Fallbacks for alternate SDK shapes
        try:
            return r.output[0].content[0].text
        except Exception:
            pass
        try:
            return r.choices[0].message["content"]
        except Exception:
            pass
        return str(r)
    except Exception as e:
        return f"ERROR: {e}"


@tool
def save_result(result: str):
    """Save the result to a file"""
    with open("reports/report.md", "w", encoding="utf-8") as f:
        f.write(result)
