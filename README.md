# ProgramowanieZespolowe2025

## Wprowadzenie
To jest projekt **C# (.NET 8) + React (Vite + TypeScript)** służący do recenzowania książek.  
Ten plik README zawiera wszystkie kroki, które każdy członek zespołu musi wykonać po pobraniu repozytorium.

---

## 1. Sklonowanie repozytorium

```bash
git clone git@github.com:BartoszGrab/ProgramowanieZespolowe2025.git
cd ProgramowanieZespolowe2025
```

---

## 2. Backend (.NET 8)

### a) Sprawdź wersję .NET
```bash
dotnet --version
```
- Projekt wymaga **.NET 8.0**.  
- Jeśli nie masz zainstalowanego SDK → pobierz 
```bash
sudo apt install -y dotnet-sdk-8.0 
```

### b) Przywróć paczki NuGet
```bash
cd backend
dotnet restore
```

### c) Uruchomienie backendu
```bash
dotnet run
```
- API powinno działać np. na `https://localhost:7200`.

### d) API Rekomendacji Książek

Backend udostępnia endpoint do rekomendacji książek (wymaga uruchomionego books-rec):

```bash
# Start Qdrant (vector database)
sudo docker run -d -p 6333:6333 --name qdrant qdrant/qdrant

# Start books-rec microservice
cd ../books-rec
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/pip install pydantic-settings
.venv/bin/python -m uvicorn app.main:app --port 8000
```

**Endpoints:**

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/recommendations/health` | GET | Sprawdź status serwisu |
| `/api/recommendations` | POST | Pobierz rekomendacje książek |

**Przykład użycia:**
```bash
curl -X POST https://localhost:7200/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "preferredLanguage": "pl",
    "history": [
      {"title": "Wiedźmin", "author": "Andrzej Sapkowski", "genre": "Fantasy", "rating": 5}
    ]
  }'
```

### e) Generator Użytkowników
Projekt zawiera narzędzie CLI do generowania losowych użytkowników w celach testowych (z avatarami i przypisanymi książkami).

**Lokalizacja:** `backend/UserGenerator`

**Użycie:**
1. Przejdź do katalogu backendu:
   ```bash
   cd backend
   ```
2. Uruchom generator (tworzy N profili):
   ```bash
   dotnet run --project UserGenerator -- generate 10
   ```
3. Wyczyść wygenerowanych użytkowników:
   ```bash
   dotnet run --project UserGenerator -- clean
   ```

**Uwaga:** Narzędzie korzysta z plików tekstowych w `backend/UserGenerator/dictionaries` do generowania nazw.

---

## 3. Frontend (React + Vite)

### a) Instalacja paczek npm
```bash
cd ../frontend
npm install
```

### b) Uruchomienie dev servera
```bash
npm run dev
```
- Strona będzie dostępna np. pod `http://localhost:5173`.

---

## 4. Pliki środowiskowe

- Jeśli w repo jest `.env.example` → skopiuj go do `.env` i dostosuj ustawienia (URL backendu, klucze API itp.).
```bash
cp .env.example .env
```

---

## 5. Konfiguracja Git i SSH

- Sprawdź połączenie SSH z GitHub:
```bash
ssh -T git@github.com
```

- Skonfiguruj Git globalnie (jeśli jeszcze nie zrobione):
```bash
git config --global user.name "Twoje Imię"
git config --global user.email "twoj_email@example.com"
```

---

## 7. Praca z branchami

- Przed rozpoczęciem pracy:
```bash
git fetch --all
git checkout dev   # lub inny branch, na którym pracujesz
git pull
```

- Twórz swoje branche od `dev` lub `main` zgodnie z ustalonym workflow.

---

## 8. Gitignore i pliki lokalne

- Nie commituj lokalnych plików tymczasowych:
  - `bin/` i `obj/` w backendzie
  - `node_modules/` i `dist/` w frontendzie
  - `.env` oraz `.nuget.dgspec.json`