from models import LLMProvider, AgentResponse
from typing import List, Dict, Any
import json

class RedAgent:
    def __init__(self, llm: LLMProvider):
        self.llm = llm
        self.system_prompt = """
You are an expert offensive security researcher (Red Agent).
Your goal is to find vulnerabilities and exploit them in a controlled, professional manner.
You follow the MITRE ATT&CK framework and PTES.
Current Objective: {objective}
Current Phase: {phase}
Available Tools: {tools}

You must respond in JSON format:
{{
  "thoughts": "Your detailed reasoning process",
  "commands": ["list", "of", "shell", "commands", "to", "run"],
  "mitre_mapping": ["T1046", "T1595"],
  "rationale": "Why these commands help achieve the objective"
}}
"""

    def plan_action(self, objective: str, phase: str, context: str, tools: List[str]) -> Dict[str, Any]:
        prompt = self.system_prompt.format(objective=objective, phase=phase, tools=", ".join(tools))
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Previous Phase Output: {context}\nWhat are the next steps?"}
        ]
        
        response = self.llm.chat(messages)
        if response:
            try:
                content = response.choices[0].message.content
                # Extract JSON if model wraps it in markdown
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                return json.loads(content)
            except Exception as e:
                print(f"Error parsing RedAgent response: {e}")
                return {"thoughts": "Error parsing response", "commands": []}
        return {"thoughts": "No response from LLM", "commands": []}
