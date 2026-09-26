import os
import time
import uuid
import logging
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from backend.connection import init_db, verify_db_connection
from backend.routes import (
    auth_router,
    user_router,
    business_profile_router,
    product_router,
    conversation_router,
    scheme_router,
    subscription_router,
    dashboard_router,
    storefront_router,
    images_router,
    marketplace_router,
    voice_router,
    whatsapp_router,
)

logger = logging.getLogger("krivio.api")

app = FastAPI(
    title="KRIVIO AI Backend API",
    description="FastAPI + PostgreSQL Database Layer for KRIVIO AI Rural Business Accelerator",
    version="2.0.0"
)

# CORS Middleware setup - dynamically include additional origins if configured
base_origins = [
    "https://krivio-ai.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
extra_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
frontend_url = os.getenv("FRONTEND_URL", "").strip()
if frontend_url and frontend_url not in base_origins:
    base_origins.append(frontend_url)
ALLOWED_ORIGINS = list(set(base_origins + extra_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https:\/\/[a-z0-9-]+\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production Structured Request Logging & Correlation ID Middleware
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    req_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    start_time = time.time()

    response: Response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)

    response.headers["x-request-id"] = req_id
    logger.info(
        f"REQ_ID={req_id} METHOD={request.method} PATH={request.url.path} "
        f"STATUS={response.status_code} DURATION_MS={duration_ms}ms"
    )
    return response

# Initialize Database tables on application startup
@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "app": "KRIVIO AI FastAPI Service",
        "status": "online",
        "version": "2.0.0",
        "runtime": "python-fastapi",
        "environment": os.getenv("ENVIRONMENT", "production")
    }

# 1. Process Liveness Health Check (Fast, zero heavy dependencies)
@app.get("/health")
def health_check():
    """
    Process Liveness Probe: Confirms the FastAPI process is responsive.
    Does not fail if the database connection pool is cold or initializing.
    """
    return {
        "status": "healthy",
        "process": "alive",
        "service": "krivio-fastapi-backend",
        "version": "2.0.0"
    }

# 2. Database Readiness Health Check (Deep probe)
@app.get("/health/db")
def health_check_db():
    """
    Database Readiness Probe: Executes a SELECT 1 ping against PostgreSQL.
    """
    db_status = verify_db_connection()
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected"
    }

@app.get("/diagnostic/db")
@app.get("/api/db-test")
def diagnostic_db_test():
    """
    Diagnostic endpoint that executes a SELECT 1 query against PostgreSQL
    and verifies that database connection is operational.
    """
    try:
        from sqlalchemy import text
        from backend.database import engine
        import os

        db_url = os.getenv("DATABASE_URL", "")
        masked_url = db_url.split("@")[-1] if "@" in db_url else "configured"

        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()

        return {
            "status": "success",
            "message": "PostgreSQL test query executed successfully",
            "query_result": result,
            "database_connected": True,
            "connection_info": {
                "endpoint": masked_url,
                "env_var_present": bool(db_url)
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"PostgreSQL query execution failed: {str(e)}",
            "query_result": None,
            "database_connected": False
        }

# Register all API Routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(business_profile_router)
app.include_router(product_router)
app.include_router(conversation_router)
app.include_router(scheme_router)
app.include_router(subscription_router)
app.include_router(dashboard_router)
app.include_router(storefront_router)
app.include_router(images_router)
app.include_router(marketplace_router)
app.include_router(voice_router)
app.include_router(whatsapp_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)

