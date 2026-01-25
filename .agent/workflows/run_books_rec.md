
---
description: How to run the books-rec application locally
---

# How to Run `books-rec` Locally

This workflow outlines the steps to set up and run the Book Recommendation Microservice on your local machine.

## Prerequisites

- [Docker](https://www.docker.com/) installed and running.
- Python 3.12+ installed.

## Steps

### 1. Start Qdrant Database

The application requires a running Qdrant instance for vector storage.

```bash
docker run -d -p 6333:6333 qdrant/qdrant
```

### 2. Set Up Python Environment

Navigate to the `books-rec` directory and set up a virtual environment.

```bash
cd /home/maks/repos/ProgramowanieZespolowe2025/books-rec
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the Application

You can run the application using the helper script (recommended) or `uvicorn` directly.

**Option A (Recommended):**
```bash
python run_app.py
```

**Option B (Standard):**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at [http://localhost:8000](http://localhost:8000).
The interactive documentation is at [http://localhost:8000/docs](http://localhost:8000/docs).

### 4. Verify Functionality

To run the test suite and verify everything is working:

```bash
python test_recommendations.py
```
