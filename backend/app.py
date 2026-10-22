from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import asyncio
import datetime

from models import LLMProvider
from agents.red_agent import RedAgent
from agents.blue_agent import BlueAgent
from agents.coordinator import CoordinatorAgent
from tools.executor import executor

app = FastAPI(title="PRISM API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared State (In a real app, use a DB or Redis)
class GlobalState:
    def __init__(self):
        self.llm = LLMProvider("Ollama", "http://localhost:11434/v1")
        self.red = RedAgent(self.llm)
        self.blue = BlueAgent(self.llm)
        self.coordinator = CoordinatorAgent(self.llm)
        self.current_session = None
        self.stats = {
            "dts": 0,
            "detection_rate": 0,
            "mttd": "0s",
            "vulnerabilities": {
                "Critical": 0,
                "High": 0,
                "Medium": 0,
                "Low": 0
            },
            "mutation_attempts": 0,
            "mutation_successes": 0,
            "history": [],
            "total_ttps": 0,
            "detected_ttps": 0,
            "total_detection_time_sec": 0,
            "total_alerts": 0,
            "false_alerts": 0,
            "in_mutation_loop": False
        }

state = GlobalState()

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

class StartAgentRequest(BaseModel):
    target: str
    objective: str

class SettingsUpdate(BaseModel):
    base_url: str
    api_key: str
    model: str
    use_docker: bool

@app.post("/settings/update")
async def update_settings(request: SettingsUpdate):
    state.llm.update_config(request.base_url, request.api_key, request.model)
    from tools.executor import executor
    executor.use_docker = request.use_docker
    return {"status": "success", "message": "Settings updated globally"}

@app.get("/tools/status")
async def get_tools_status():
    return executor.check_tool_status()

@app.post("/chat")
async def chat(request: ChatRequest):
    messages = [{"role": "system", "content": "You are a cybersecurity expert assistant."}]
    messages.extend(request.history)
    messages.append({"role": "user", "content": request.message})
    
    async def stream_response():
        response = state.llm.chat(messages, stream=True)
        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    return StreamingResponse(stream_response(), media_type="text/plain")

@app.post("/plan/generate")
async def generate_plan(request: StartAgentRequest):
    plan = state.coordinator.plan_engagement(request.objective)
    return plan

@app.post("/agent/start")
async def start_agent_session(request: StartAgentRequest):
    state.current_session = {
        "target": request.target,
        "objective": request.objective,
        "phase": state.coordinator.get_current_phase(),
        "history": []
    }
    return state.current_session

@app.post("/agent/step")
async def agent_step():
    if not state.current_session:
        raise HTTPException(status_code=400, detail="No active session")

    current_phase = state.coordinator.get_current_phase()
    objective = state.current_session["objective"]
    
    # 1. Red Agent Plans Action
    red_plan = state.red.plan_action(objective, current_phase, "", ["nmap", "msfconsole", "sqlmap"])
    
    # 2. Execute Commands
    results = []
    for cmd in red_plan.get("commands", []):
        res = executor.execute(cmd)
        results.append({"command": cmd, "output": res["output"]})
    
    # 3. Blue Agent Analyzes
    logs = "\n".join([r["output"] for r in results])
    blue_analysis = state.blue.analyze_activity(current_phase, logs, red_plan.get("commands", []))
    
    # 4. Coordinator Evaluates Feedback Loop
    loop_decision = state.coordinator.evaluate_loop(red_plan, blue_analysis)
    
    step_result = {
        "phase": current_phase,
        "red": red_plan,
        "results": results,
        "blue": blue_analysis,
        "loop_decision": loop_decision
    }
    
    # 5. Progress Session
    state.current_session["history"].append(step_result)
    if loop_decision != "MUTATE":
        state.coordinator.next_phase()
        state.current_session["phase"] = state.coordinator.get_current_phase()

    # 6. Update Stats based on Thesis Formulas
    state.stats["total_ttps"] += 1
    impact = 10
    probability = 1.0

    if loop_decision == "MUTATE":
        # Detected (D = 1)
        state.stats["detected_ttps"] += 1
        state.stats["total_alerts"] += 1
        # Simulate false positive
        if state.stats["total_alerts"] % 10 == 0:
            state.stats["false_alerts"] += 1
        
        import random
        state.stats["total_detection_time_sec"] += random.uniform(1.5, 4.5)
        
        state.stats["mutation_attempts"] += 1
        state.stats["in_mutation_loop"] = True
        state.stats["vulnerabilities"]["Low"] += 1
    else:
        # Missed (D = 0)
        # DTS += I * P * (1 - 0)
        state.stats["dts"] += (impact * probability)
        
        if state.stats["in_mutation_loop"]:
            state.stats["mutation_successes"] += 1
            state.stats["in_mutation_loop"] = False
        
        state.stats["vulnerabilities"]["High"] += 1

    state.stats["detection_rate"] = (state.stats["detected_ttps"] / state.stats["total_ttps"]) * 100
    
    import datetime
    state.stats["history"].append({
        "time": datetime.datetime.now().strftime("%H:%M"),
        "dts": state.stats["dts"],
        "detection": state.stats["detection_rate"]
    })

    return step_result

@app.get("/dashboard/stats")
async def get_stats():
    # Calculate mutation success rate
    attempts = state.stats["mutation_attempts"]
    successes = state.stats["mutation_successes"]
    msr = (successes / attempts * 100) if attempts > 0 else 0
    
    # Calculate MTTD
    det_ttps = state.stats["detected_ttps"]
    tot_time = state.stats["total_detection_time_sec"]
    mttd_val = (tot_time / det_ttps) if det_ttps > 0 else 0
    
    # Calculate FPR
    t_alerts = state.stats["total_alerts"]
    f_alerts = state.stats["false_alerts"]
    fpr = (f_alerts / t_alerts * 100) if t_alerts > 0 else 0

    return {
        "dts": round(state.stats["dts"], 2),
        "detection_rate": round(state.stats["detection_rate"], 1),
        "mutation_success_rate": round(msr, 1),
        "mttd": f"{round(mttd_val, 2)}s",
        "fpr": round(fpr, 1),
        "total_ttps": state.stats["total_ttps"],
        "vulnerabilities": [
            {"name": k, "count": v} for k, v in state.stats["vulnerabilities"].items()
        ],
        "history": state.stats["history"][-10:] # Last 10 points
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
