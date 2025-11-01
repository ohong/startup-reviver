import os

from dotenv import load_dotenv
from hyperspell import Hyperspell
from openai import OpenAI
from perplexity import Perplexity

load_dotenv()

hyperspell_client = Hyperspell(
    api_key=os.getenv("HYPERSPELL_API_KEY"), user_id="startup-reviver"
)

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

perplexity_client = Perplexity(api_key=os.getenv("PERPLEXITY_API_KEY"))
