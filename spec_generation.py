from dotenv import load_dotenv
from langchain.agents import create_agent

from prompts import SPEC_GENERATION_PROMPT

load_dotenv()

# Use the prompt directly from prompts.py as a string
agent = create_agent(
    model="openai:gpt-4o-mini",
    tools=[],
    system_prompt=SPEC_GENERATION_PROMPT,  # Pass the string directly, not a ChatPromptTemplate
)

report_path = "reports/fetchr-research-report.md"

result = agent.invoke({"input": f"Generate a report as per the report {report_path}"})

print(result)

with open("spec_output.md", "w", encoding="utf-8") as f:
    f.write(result["messages"][0].content)
