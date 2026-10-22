from models import LLMProvider, AgentResponse
from typing import List, Dict, Any, Optional
import json

class CoordinatorAgent:
    def __init__(self, llm: LLMProvider):
        self.llm = llm
        self.phases = ["Reconnaissance", "Enumeration", "Controlled Exploitation", "Post-Exploitation", "Blue Team Review"]
        self.current_phase_index = 0
        self.history = []

    def get_current_phase(self) -> str:
        return self.phases[self.current_phase_index]

    def plan_engagement(self, objective: str) -> Dict[str, Any]:
        """
        Generates a high-level plan for the entire engagement.
        """
        system_prompt = "You are a Cyber Security Engagement Coordinator. Plan a full VAPT engagement."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Target Objective: {objective}\nPhases: {self.phases}\nGenerate a high-level strategy for each phase."}
        ]
        
        response = self.llm.chat(messages)
        if response:
            return {"objective": objective, "plan": response.choices[0].message.content}
        return {"objective": objective, "plan": "Failed to generate plan."}

    def evaluate_loop(self, red_action: Dict[str, Any], blue_detection: Dict[str, Any]) -> str:
        """
        Decides the next step in the feedback loop.
        """
        # Logic from Algorithm 1: if Detected -> Mutate, if Missed -> Train
        # For simplicity, we compare red commands with blue detections
        is_detected = any(action in str(blue_detection.get("detections", [])) for action in red_action.get("commands", []))
        
        if is_detected:
            return "MUTATE"
        else:
            return "TRAIN"

    def next_phase(self):
        if self.current_phase_index < len(self.phases) - 1:
            self.current_phase_index += 1
            return True
        return False
