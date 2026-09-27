# METROVERIFY 360

## Overview

METROVERIFY 360 is a legal metrology verification application. A React client supports applicant, officer, and administrator workflows. An ASP.NET Core REST API provides authentication, application, instrument, inspection, certificate, reporting, notification, and dashboard features. The API persists data through Entity Framework Core using SQLite by default, with SQL Server available through configuration. An internal Python FastAPI service provides deterministic regulatory checks, calibrated ML risk scoring, and SHAP explanations for inspection measurements.

The ASP.NET API starts and manages the Python service on `127.0.0.1:8000`. The client sends API calls to `http://localhost:5051/api` by default. ML calls go through the ASP.NET `/api/ml` proxy.

## Features

- Role-aware applicant, officer, and admin screens
- JWT authentication and REST endpoints
- Instrument applications, assignments, inspections, certificates, audit logs, and notifications
- SQLite database auto-creation and demo-data seeding at API startup
- PDF report generation and static report serving under `/reports`
- ML input validation, regulatory rules, CatBoost prediction, calibrated risk, and SHAP explanation
- Mock-data fallback for supported client service calls when the API is unavailable

## Technology stack

- Client: React 18, TypeScript, Vite, React Router, Axios, Tailwind CSS, Lucide, QRCode
- Server: ASP.NET Core 8, C#, Entity Framework Core 8, SQLite and SQL Server providers, JWT, Swagger, QuestPDF, QRCoder
- ML: Python, FastAPI, Uvicorn, pandas, scikit-learn, CatBoost, SHAP, joblib, PyYAML
- Database: SQLite by default (`Data Source=MetroVerify360.db`); SQL Server can be selected in server configuration

## Folder map

```text
PROJECT_ROOT/
├── Client/                  React/Vite client, package files, and client .env
│   └── src/                 Components, pages, contexts, services, types
├── Server/
│   ├── MetroVerify360/      ASP.NET API, EF Core, reports, launch settings
│   └── ML/                  FastAPI service, model artifacts, configs, data, tests
├── Documents/
│   ├── design.md            Actual architecture and data flow
│   └── README.md            This guide
├── .git/                    Git history
├── .gitignore
└── start-sih.bat             Windows convenience launcher
```

## Prerequisites

Install Node.js/npm, .NET 8 SDK, and Python 3.10 or newer. To use the ML service, install the packages in `Server/ML/requirements.txt`. Existing trained model artifacts are in `Server/ML/models/`.

## Install and configure

Client dependencies:

```powershell
cd Client
npm install
```

ML dependencies (recommended in a virtual environment):

```powershell
cd Server/ML
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

The client has `Client/.env` with `VITE_API_BASE_URL=http://localhost:5051/api`. Vite reads this file from the client root. Set this variable to the API base URL if the API is hosted elsewhere.

ASP.NET configuration uses standard .NET configuration keys. Relevant keys:

| Key | Default / purpose |
|---|---|
| `DatabaseProvider` | `Sqlite`; use `SqlServer` to select SQL Server |
| `ConnectionStrings__SqliteConnection` | `Data Source=MetroVerify360.db` |
| `ConnectionStrings__DefaultConnection` | SQL Server connection string |
| `Jwt__Key` | Development fallback exists in `Program.cs`; set a secure key for deployment |
| `Jwt__Issuer` | `MetroVerify360` |
| `Jwt__Audience` | `MetroVerify360Client` |
| `MlEngine__WorkingDirectory` | ML project directory; launcher supplies `Server/ML` |
| `MlEngine__Port` | `8000` |

Server settings also load from `Server/MetroVerify360/appsettings*.json` when present. Those files are ignored by Git, so preserve local values.

## Run the client, server, and ML engine

Start the API (it automatically starts/stops ML):

```powershell
cd Server/MetroVerify360
$env:MlEngine__WorkingDirectory = (Resolve-Path ../ML).Path
dotnet run --urls http://localhost:5051
```

Start the client in a separate terminal:

```powershell
cd Client
npm run dev -- --host 0.0.0.0
```

Open `http://localhost:3000`. API Swagger is at `http://localhost:5051/swagger`. The ML service is internal at `http://127.0.0.1:8000`; health is `http://127.0.0.1:8000/health`. When run standalone for ML development, first stop the ASP.NET host to avoid its automatic process management, then:

```powershell
cd Server/ML
python -m uvicorn src.api.main:app --host 127.0.0.1 --port 8000 --reload
```

Run all three via the Windows helper from project root:

```powershell
.\start-sih.bat
```

## ML development commands

Run sample prediction:

```powershell
cd Server/ML
python scripts/predict_sample.py --input data/synthetic/sample_verification.json
```

Train/rebuild model artifacts (this overwrites generated model files):

```powershell
cd Server/ML
python scripts/train.py --rows 10000 --seed 42
```

Evaluate:

```powershell
cd Server/ML
python scripts/evaluate.py
```

## Database and API behavior

At startup the API calls `EnsureCreatedAsync()` and seeds demo data through `DbInitializer`. The SQLite file is created relative to the server process working directory unless the connection string specifies another path. API controller routes use the `/api` prefix. Swagger documents the current endpoints and bearer authentication.

## Troubleshooting

- **Client cannot reach API:** Check `Client/.env` and `VITE_API_BASE_URL`; confirm the API is listening on port 5051 and the browser origin is allowed by the API's CORS policy. Restart Vite after changing `.env`.
- **ML health returns unavailable:** Check Python and the `Server/ML` dependencies, model files, configured ML working directory, and whether port 8000 is free. Review ASP.NET logs for ML startup errors.
- **Port 8000 is occupied:** Stop the other process before starting ASP.NET; its ML manager attempts to clear a process listening on its configured port.
- **SQLite or SQL Server connection errors:** Check `DatabaseProvider` and the matching connection string. SQL Server requires a reachable instance.
- **Missing packages:** Run `npm install` from `Client/` or `python -m pip install -r requirements.txt` from `Server/ML/`.
- **Python import errors:** Run Uvicorn with the working directory set to `Server/ML`, as in the command above.
- **Generated certificates/reports:** Reports are served from `Server/MetroVerify360/Reports` under `/reports`; make sure that folder is writable by the API process.

## Existing project notes

- The application falls back to mock client data for selected service operations when the API is unreachable.
- ML is a decision-support component and combines rule evaluation with model output; the Python service can fall back to rules when model artifacts are unavailable.
- No migrations project is present in the inspected server tree; the current code initializes the schema with `EnsureCreatedAsync()`.
