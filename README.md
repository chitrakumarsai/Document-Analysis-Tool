# koch-3pp
patent-analyzer/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI app entrypoint
│   │   ├── routes.py             # API endpoints
│   │   ├── analyzer.py           # Analysis logic (OpenAI + DataFrame)
│   │   ├── config.py             # Env + Azure config loading
│   │   └── utils.py              # Any helper functions (e.g. Excel parsing)
│   ├── requirements.txt
│   └── Dockerfile                # Backend Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── PatentForm.tsx    # Upload, column config, prompt fields
│   │   ├── pages/
│   │   │   └── index.tsx         # Main app page
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile                # Frontend Dockerfile
├── nginx/
│   └── default.conf              # Optional: nginx reverse proxy config
├── .env                          # Shared env vars
├── docker-compose.yml            # Multi-service container orchestration
└── README.md
