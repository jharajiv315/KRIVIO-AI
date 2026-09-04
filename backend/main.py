from fastapi import FastAPI
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

app = FastAPI(
    title="KRIVIO AI Backend API",
    description="FastAPI + PostgreSQL Database Layer for KRIVIO AI Rural Business Accelerator",
    version="2.0.0"
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database tables on application startup
@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    db_connected = verify_db_connection()
    return {
        "app": "KRIVIO AI FastAPI Service",
        "status": "online",
        "version": "2.0.0",
        "postgresql_connected": db_connected,
        "database_name": "krivio_db"
    }

@app.get("/health")
def health_check():
    db_status = verify_db_connection()
    return {
        "status": "healthy" if db_status else "degraded",
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
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
