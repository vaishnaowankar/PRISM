import subprocess
import shutil
import docker
import os
from typing import List, Dict, Any, Optional

class ToolExecutor:
    def __init__(self, use_docker: bool = True):
        self.use_docker = use_docker
        try:
            self.docker_client = docker.from_env()
        except:
            self.docker_client = None
            self.use_docker = False
            print("Docker not available, falling back to local execution.")

    def check_tool_status(self) -> Dict[str, bool]:
        tools = ["nmap", "msfconsole", "sqlmap", "gobuster", "nikto", "john", "hydra", "nuclei"]
        status = {}
        
        # Check if Docker is actually functional and has the image
        docker_ready = False
        if self.use_docker and self.docker_client:
            try:
                # Try to list images to check connectivity
                images = self.docker_client.images.list(name="kalilinux/kali-rolling")
                docker_ready = len(images) > 0
                if not docker_ready:
                    # Try to pull if not present (this might take a while, but good for first run)
                    print("Kali image not found, attempting to pull...")
                    # self.docker_client.images.pull("kalilinux/kali-rolling") # Optional: auto-pull
            except:
                docker_ready = False

        for tool in tools:
            # Check local
            is_local = shutil.which(tool) is not None
            
            # If docker is ready, we assume all tools are available in the container
            if docker_ready or is_local:
                status[tool] = True
            else:
                status[tool] = False
        return status

    def execute(self, command: str, timeout: int = 300) -> Dict[str, Any]:
        """
        Executes a command locally or in Docker.
        """
        # Basic Safety Check
        blocked_keywords = ["rm -rf", "mkfs", "dd if=/dev/zero", ":(){ :|:& };:"]
        if any(kw in command for kw in blocked_keywords):
            return {"output": "Error: Command blocked for safety.", "exit_code": -1}

        try:
            if self.use_docker:
                # Example: Run in a kali container
                # Note: This requires a pre-built or pulled kali image
                container = self.docker_client.containers.run(
                    "kalilinux/kali-rolling",
                    command=f"bash -c '{command}'",
                    detach=False,
                    remove=True,
                    timeout=timeout
                )
                return {"output": container.decode("utf-8"), "exit_code": 0}
            else:
                result = subprocess.run(
                    command,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=timeout
                )
                return {
                    "output": result.stdout + result.stderr,
                    "exit_code": result.returncode
                }
        except subprocess.TimeoutExpired:
            return {"output": "Error: Command timed out.", "exit_code": 124}
        except Exception as e:
            return {"output": f"Error: {str(e)}", "exit_code": 1}

executor = ToolExecutor()
