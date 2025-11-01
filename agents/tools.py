import os

from openai import OpenAI
from perplexity import Perplexity

# Tools
perplexity_client = Perplexity(api_key=os.getenv("PERPLEXITY_API_KEY"))
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_company_details(company_name: str):
    """Get the details of the company from the database."""
    return {}


def web_search(query: str, max_results: int = 5):
    """Breadth web search via Perplexity; returns a normalized list of {title,url,snippet}."""
    try:
        resp = perplexity_client.search(query=query, max_results=max_results)
        # Normalize
        if isinstance(resp, dict) and "results" in resp:
            out = []
            for r in resp.get("results", [])[:max_results]:
                out.append(
                    {
                        "title": r.get("title"),
                        "url": r.get("url"),
                        "snippet": r.get("snippet") or r.get("text") or "",
                    }
                )
            return out
        # If the SDK returns a list already, coerce elements to dicts with safe keys
        if isinstance(resp, list):
            norm = []
            for item in resp[:max_results]:
                if isinstance(item, dict):
                    norm.append(
                        {
                            "title": item.get("title"),
                            "url": item.get("url"),
                            "snippet": item.get("snippet") or item.get("text") or "",
                        }
                    )
                else:
                    norm.append({"title": None, "url": None, "snippet": str(item)})
            return norm
        return [{"title": None, "url": None, "snippet": str(resp)}]
    except Exception as e:
        return [{"title": None, "url": None, "snippet": f"ERROR: {e}"}]


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
