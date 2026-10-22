# PRISM: Proactive Red-Blue Intelligent Security Model

PRISM is a master's level autonomous purple teaming framework that unifies offensive (Red) and defensive (Blue) AI agents under a central Coordinator. It automates the full VAPT process using Large Language Models (Llama 3.2) and industry-standard security tools.

## Key Features

1.  **Multi-Agent Orchestration**: Real-time collaboration between Red and Blue agents to find, exploit, and remediate vulnerabilities.
2.  **Phased VAPT Pipeline**: Aligned with PTES, covering Recon, Enumeration, Controlled Exploitation, and Post-Exploitation.
3.  **Plan Mode**: AI-generated strategic pentest plans for Web, Network, Mobile, and API targets.
4.  **Tool Status Panel**: Real-time monitoring of available security tools (Nmap, Metasploit, etc.).
5.  **Interactive Dashboard**: Visualization of results including the **Dynamic Threat Score (DTS)** and detection metrics.
6.  **Provider Agnostic**: Supports local models (Ollama/Llama 3.2) and cloud providers.

## Prerequisites

- **Ollama**: Install [Ollama](https://ollama.com/) and pull the Llama 3.2 model:
  ```bash
  ollama pull llama3.2
  ```
- **Python 3.10+**
- **Node.js 18+**
- **Docker**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and ensure it is running.
  Pull the Kali Linux image manually to avoid timeout issues:
  ```bash
  docker pull kalilinux/kali-rolling
  ```

## 🛠️ Troubleshooting Tool Status

If your tools show as "MISSING" in the Tool Status panel:
1.  **Check Docker**: Run `docker ps` to ensure the daemon is alive.
2.  **Pull Image**: Run `docker pull kalilinux/kali-rolling`.
3.  **Use Docker Setting**: Go to **Settings** in PRISM and ensure "Use Dockerized Tools" is toggled ON.
4.  **Refresh**: Click "REFRESH STATUS" in the Tool Status panel.

### Windows
Double-click `run.bat` or run:
```cmd
run.bat
```

### Linux / Kali Linux
Make the script executable and run:
```bash
chmod +x run.sh
./run.sh
```

## Usage Guide

1.  **Dashboard**: View the overall security posture and metrics from previous assessments.
2.  **Chat Mode**: Consult the specialized AI assistant for cybersecurity research and Q&A.
3.  **Plan Mode**: Select a target type (e.g., Web), enter a target URL/IP, and generate a comprehensive pentest strategy.
4.  **Agent Mode**: 
    - Enter a target IP (e.g., `192.168.91.135`).
    - Click **Start Purple Team**.
    - Watch as the Coordinator plans phases, the Red Agent executes tools (Nmap, Metasploit, etc.), and the Blue Agent analyzes logs for detections.
    - Provide feedback using the interface to influence agent learning.
5.  **Tool Status**: Check if your environment has the necessary tools installed or if they are accessible via Docker.

## Implementation Details

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js 14, TailwindCSS, Framer Motion, Recharts
- **Agents**: Custom ReAct-based multi-agent framework
- **Tools**: Local subprocess execution and Dockerized Kali Linux integration
