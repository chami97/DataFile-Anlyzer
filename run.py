import subprocess
import os
import signal
import sys
import time

def run_servers():
    backend_dir = os.path.join(os.getcwd(), "backend")
    
    # Start Backend (FastAPI)
    print("🚀 Starting Backend (FastAPI)...")
    backend_process = subprocess.Popen(
        ["cmd", "/c", "uvicorn", "main:app", "--reload", "--port", "8001"],
        cwd=backend_dir,
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
    )
    
    # Start Frontend (Vite)
    print("🎨 Starting Frontend (Vite)...")
    frontend_process = subprocess.Popen(
        ["cmd", "/c", "npm", "run", "dev"],
        cwd=os.getcwd(),
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
    )
    
    print("\n✅ Both servers are starting...")
    print("➜ Frontend: http://localhost:5173")
    print("➜ Backend:  http://localhost:8000/docs")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    run_servers()
