import os
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

class LLMProvider:
    def __init__(self, name: str, base_url: str, api_key: str = "ollama", model: str = "llama3.2"):
        self.name = name
        self.base_url = base_url
        self.api_key = api_key
        self.model = model
        self._initialize_client()

    def update_config(self, base_url: str, api_key: str, model: str):
        self.base_url = base_url
        self.api_key = api_key
        self.model = model
        self._initialize_client()

    def _initialize_client(self):
        self.is_anthropic = "claude" in self.model.lower()
        if self.is_anthropic:
            self.client = Anthropic(api_key=self.api_key or os.getenv("ANTHROPIC_API_KEY", ""))
        else:
            key = self.api_key or os.getenv("OPENAI_API_KEY", "ollama")
            url = self.base_url if self.base_url else None
            self.client = OpenAI(base_url=url, api_key=key)

    def chat(self, messages: List[Dict[str, str]], stream: bool = False):
        try:
            if self.is_anthropic:
                system_msg = next((m["content"] for m in messages if m["role"] == "system"), "")
                user_msgs = [m for m in messages if m["role"] != "system"]
                
                response = self.client.messages.create(
                    model=self.model,
                    system=system_msg,
                    messages=user_msgs,
                    max_tokens=4096,
                    stream=stream
                )
                
                if stream:
                    def stream_generator():
                        class Delta:
                            def __init__(self, content):
                                self.content = content
                        class Choice:
                            def __init__(self, delta):
                                self.delta = delta
                        class Chunk:
                            def __init__(self, choice):
                                self.choices = [choice]
                                
                        for event in response:
                            if event.type == "content_block_delta":
                                yield Chunk(Choice(Delta(event.delta.text)))
                    return stream_generator()
                else:
                    class Message:
                        def __init__(self, content):
                            self.content = content
                    class Choice:
                        def __init__(self, message):
                            self.message = message
                    class Response:
                        def __init__(self, choice):
                            self.choices = [choice]
                    return Response(Choice(Message(response.content[0].text)))
            else:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    stream=stream
                )
                return response
        except Exception as e:
            print(f"Error calling {self.name}: {e}")
            return None

class AgentResponse:
    def __init__(self, role: str, content: str, thoughts: Optional[str] = None, commands: Optional[List[str]] = None):
        self.role = role
        self.content = content
        self.thoughts = thoughts
        self.commands = commands or []

    def to_dict(self):
        return {
            "role": self.role,
            "content": self.content,
            "thoughts": self.thoughts,
            "commands": self.commands
        }
