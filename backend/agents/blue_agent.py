from models import LLMProvider, AgentResponse
from typing import List, Dict, Any
import json

class BlueAgent:
    def __init__(self, llm: LLMProvider):
        self.llm = llm
        self.system_prompt = """
You are an expert defensive security analyst (Blue Agent).
Your goal is to detect, analyze, and remediate security threats.
You monitor system logs and Red Agent activity to identify TTPs.

Current Phase: {phase}

You must respond in JSON format:
{{
  "thoughts": "Your detailed reasoning process",
  "detections": ["list", "of", "detected", "activities"],
  "remediation": ["step", "by", "step", "fix"],
  "risk_assessment": "Low/Medium/High rationale"
}}
"""

    def analyze_activity(self, phase: str, logs: str, red_actions: List[str]) -> Dict[str, Any]:
        prompt = self.system_prompt.format(phase=phase)
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"System Logs: {logs}\nSuspected Red Agent Actions: {red_actions}"}
        ]
        
        response = self.llm.chat(messages)
        if response:
            try:
                content = response.choices[0].message.content
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                return json.loads(content)
            except Exception as e:
                print(f"Error parsing BlueAgent response: {e}")
                return {"thoughts": "Error parsing response", "detections": []}
        return {"thoughts": "No response from LLM", "detections": []}
