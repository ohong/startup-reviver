import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from spec_generation import agent as spec_agent

from deep_research import agent

app = FastAPI(title="Startup Reviver Deep Research API")

class DeepResearchRequest(BaseModel):
    company: str

class GenerateCodingSpecsRequest(BaseModel):
    company: str
    
class CreatePrototypeRequest(BaseModel):
    company: str

@app.post("/deep_research")
async def run_deep_research(request: DeepResearchRequest):
    try:
        # deep_research.agent expects an input, adapt as per actual API
        asyncio.run(agent.ainvoke({"messages": [{"role": "user", "content": "Conduct extesive research on the following company: " + request.company}]}))
        return {"result": "Research in progress. Please check your email for the report in 30 minutes."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-coding-specs")
async def generate_coding_specification(request: GenerateCodingSpecsRequest):
    try:
        asyncio.run(
            spec_agent.ainvoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": "use the report at reports/fetchr-research-report.md to generate a coding specification."
                }
            ]
        }
    )
            )
        return {"result": "Coding specification in progress. Please check your email for the specification in 30 minutes."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-prototype")
async def create_prototype(request: CreatePrototypeRequest):
    try:
        # TODO: invoke coding agent from here
        return {"result": "Prototype in progress. Please check your email for the prototype in 30 minutes."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))