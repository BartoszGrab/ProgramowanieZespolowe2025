# Book Recommendation Microservice (content-based recommendations [vector search])

## Setup

```bash
docker run -d -p 6333:6333 qdrant/qdrant
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/recommend` | POST | Get recommendations |
| `/index` | POST | Add books |
| `/health` | GET | Health check |
| `/stats` | GET | DB stats |
| `/reset` | POST | Reset with sample data |

Docs: http://localhost:8000/docs
