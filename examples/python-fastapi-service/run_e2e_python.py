import os
import sys
import time
import subprocess
import httpx

def wait_for_server(url: str, timeout: int = 15):
    """Polls a URL until it responds with a 2xx, 3xx, or 4xx status."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            res = httpx.get(url, timeout=1.0)
            return True
        except httpx.RequestError:
            time.sleep(0.5)
    return False

def main():
    # Since we are inside examples/python-fastapi-service/, we need to go up 2 levels
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    auth_server_dir = os.path.join(base_dir, "server")
    example_app_dir = os.path.join(base_dir, "examples", "python-fastapi-service")
    
    print("🚀 Starting E2E Pipeline Verification...")
    
    print("==> Initializing Test Database...")
    env = os.environ.copy()
    env["ENVIRONMENT"] = "e2e"
    os.environ["ENVIRONMENT"] = "e2e"
    
    # We must explicitly use uv run python on the Auth Server since its dependencies are in its own pyproject.toml
    # This prevents the Dummy Microservice from needing to blindly install `sqlalchemy` or `pydantic-settings` into its own E2E env.
    init_db_cmd = [
        "uv", "run", "python", "-c",
        "from app.database.session import engine, Base; import app.database.models; "
        "Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"
    ]
    subprocess.run(init_db_cmd, cwd=auth_server_dir, env=env, check=True)
    
    # 1. Start Auth Server
    # Note: Because the Auth Server defines its own virtual environment and dependencies, 
    # we use `uv run uvicorn` inside its directory so it loads securely.
    print("==> Booting Auth Server on port 8000...")
    auth_proc = subprocess.Popen(
        ["uv", "run", "uvicorn", "server:app", "--port", "8000"],
        cwd=auth_server_dir,
        env=env
    )
    
    # 2. Start Example App
    # Since we are already running via `uv run` in THIS directory, `sys.executable` targets the right env
    print("==> Booting Example Target Service on port 8001...")
    example_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "server:app", "--port", "8001"],
        cwd=example_app_dir,
        env=env
    )
    
    try:
        print("==> Waiting for Auth Server to be ready...")
        if not wait_for_server("http://127.0.0.1:8000/docs"):
            raise RuntimeError("Auth Server failed to boot.")
            
        print("==> Waiting for Example Service to be ready...")
        if not wait_for_server("http://127.0.0.1:8001/docs"):
            raise RuntimeError("Example Service failed to boot.")

        client = httpx.Client(base_url="http://127.0.0.1:8000")
        
        print("==> Attempting to register test user...")
        client.post("/api/v1/register/", json={
            "email": "e2e_user@example.com",
            "password": "E2e_Secure_Password1!"
        })
        
        print("==> Attempting Login to acquire Tokens...")
        login_res = client.post("/api/v1/login/", json={
            "email": "e2e_user@example.com",
            "password": "E2e_Secure_Password1!"
        })
        
        if login_res.status_code != 200:
            raise RuntimeError(f"Login Failed: {login_res.text}")
            
        tokens = login_res.json()
        access_token = tokens["access_token"]
        print(f"==> ✅ Successfully received Access Token.")
        
        print("==> Attempting to fetch secure data off Example Service...")
        target_client = httpx.Client(base_url="http://127.0.0.1:8001")
        
        secure_res = target_client.get("/api/data", headers={
            "Authorization": f"Bearer {access_token}"
        })
        
        if secure_res.status_code == 200:
            print("==> 🎉 E2E SUCCESS: Microservice successfully verified the Auth Server JWT statelessly!")
            print(f"    Payload: {secure_res.json()}")
        else:
            print(f"==> ❌ E2E FAILURE: Microservice rejected the token. Context: {secure_res.text}")
            sys.exit(1)
            
    finally:
        print("==> Tearing down background servers...")
        auth_proc.terminate()
        example_proc.terminate()
        try:
            auth_proc.wait(timeout=3)
            example_proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            auth_proc.kill()
            example_proc.kill()
            
        # Cleanup
        db_path = os.path.join(auth_server_dir, "e2e_test.db")
        if os.path.exists(db_path):
            os.remove(db_path)
            
        print("==> E2E Pipeline complete.")

if __name__ == "__main__":
    main()
