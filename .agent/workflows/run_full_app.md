
---
description: How to run the full application (Backend, Frontend, and Microservices)
---

# How to Run the Full Application

This workflow outlines the steps to run the entire system, which consists of 3 parts:
1.  **Database & Python Service** (Qdrant + `books-rec`)
2.  **Main Backend** (.NET API)
3.  **Frontend** (React App)

You will need **3 separate terminal windows**.

## Prerequisites
- Docker
- Python 3.12+
- .NET 8 SDK
- Node.js & npm

## Step 1: Database & Recommendation Service (Terminal 1)

This starts the vector database and the Python microservice for book recommendations.

```bash
# 1. Start Qdrant Database
docker run -d -p 6333:6333 qdrant/qdrant

# 2. Start Python Service
cd /home/maks/repos/ProgramowanieZespolowe2025/books-rec
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run_app.py
```
*Wait until you see "Uvicorn running on http://0.0.0.0:8000"*

## Step 2: Main .NET Backend (Terminal 2)

This starts the main API that handles users, reviews, and communicates with the recommendation service.

```bash
cd /home/maks/repos/ProgramowanieZespolowe2025/backend
dotnet restore
dotnet run
```
*Wait until you see "Now listening on: https://localhost:7200"*

## Step 3: Frontend Client (Terminal 3)

This starts the user interface.

```bash
cd /home/maks/repos/ProgramowanieZespolowe2025/frontend
npm install
npm run dev
```
*The app will be available at http://localhost:5173*

## Verification
Open your browser to **[http://localhost:5173](http://localhost:5173)**. You should be able to log in and see book recommendations.
