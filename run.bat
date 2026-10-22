@echo off
echo Starting PRISM: Proactive Red-Blue Intelligent Security Model
echo -----------------------------------------------------------

:: Start Backend
start cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python app.py"

:: Start Frontend
start cmd /k "cd frontend && npm install && npm run dev"

echo PRISM is launching...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Make sure Ollama is running with llama3.2!
pause
