
import uvicorn
from app.main import app
import sys
import os

if __name__ == "__main__":
    print(f"Python: {sys.executable}")
    print(f"Path: {sys.path}")
    try:
        import fastapi
        print(f"FastAPI: {fastapi.__version__}")
        import pydantic_settings
        print(f"Pydantic Settings: {pydantic_settings.__file__}")
    except Exception as e:
        print(f"Import Error: {e}")

    uvicorn.run(app, host="0.0.0.0", port=8000)
