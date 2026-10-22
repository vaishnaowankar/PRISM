#!/bin/bash
echo "Starting PRISM: Proactive Red-Blue Intelligent Security Model"
echo "-----------------------------------------------------------"

# Start Backend
(cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python3 app.py) &

# Start Frontend
(cd frontend && npm install && npm run dev) &

echo "PRISM is launching..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Make sure Ollama is running with llama3.2!"
wait
