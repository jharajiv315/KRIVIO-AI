from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.connection import init_db, verify_db_connection
from backend.routes import (
    auth_router,
    user_router,
    product_router,
    conversation_router,
    scheme_router,
    subscription_router
)

app = FastAPI(
    title="KRIVIO AI Backend API",
    description="FastAPI + PostgreSQL Database Layer for KRIVIO AI Rural Business Accelerator",
    version="1.0.0"
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
    and verifies that database environment variables and connection parameters are correctly loaded.
    """
    try:
        from sqlalchemy import text
        from backend.database import engine
        import os

        db_url = os.getenv("DATABASE_URL", "")
        # Mask password in connection string for security
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

@app.get("/diagnostic/crud")
@app.get("/api/crud-test")
def diagnostic_crud_test():
    """
    Diagnostic endpoint that executes a full CRUD (Create, Read, Update, Delete) sequence
    for a sample user using the SQLAlchemy User ORM model to verify mapping and functionality.
    """
    import uuid
    from backend.database import SessionLocal
    from backend.models.user import User

    db = SessionLocal()
    unique_email = f"crud_test_{uuid.uuid4().hex[:8]}@krivio.test"
    test_user_id = None

    try:
        # 1. CREATE
        new_user = User(
            full_name="Diagnostic CRUD Tester",
            email=unique_email,
            password_hash="hashed_test_password_123",
            role="artisan",
            location="Madhubani, Bihar",
            business_name="Test Artisan Enterprise",
            phone="9999900000"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        test_user_id = new_user.id

        create_result = {
            "success": True,
            "user_id": test_user_id,
            "email": new_user.email,
            "full_name": new_user.full_name
        }

        # 2. READ
        read_user = db.query(User).filter(User.id == test_user_id).first()
        read_result = {
            "success": read_user is not None,
            "retrieved_id": read_user.id if read_user else None,
            "retrieved_email": read_user.email if read_user else None
        }

        # 3. UPDATE
        if read_user:
            read_user.business_name = "Updated Test Enterprise"
            db.commit()
            db.refresh(read_user)
            update_result = {
                "success": read_user.business_name == "Updated Test Enterprise",
                "updated_business_name": read_user.business_name
            }
        else:
            update_result = {"success": False, "error": "User not found for update"}

        # 4. DELETE
        if read_user:
            db.delete(read_user)
            db.commit()
            deleted_check = db.query(User).filter(User.id == test_user_id).first()
            delete_result = {
                "success": deleted_check is None,
                "verified_deleted": deleted_check is None
            }
        else:
            delete_result = {"success": False, "error": "User not found for deletion"}

        return {
            "status": "success",
            "message": "Full CRUD sequence executed successfully on PostgreSQL User model",
            "crud_sequence": {
                "1_create": create_result,
                "2_read": read_result,
                "3_update": update_result,
                "4_delete": delete_result
            },
            "orm_models_registered": [
                "User",
                "BusinessProfile",
                "Product",
                "Conversation",
                "Subscription",
                "GovernmentScheme"
            ]
        }
    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "message": f"CRUD sequence failed: {str(e)}"
        }
    finally:
        db.close()

# Register API Routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(product_router)
app.include_router(conversation_router)
app.include_router(scheme_router)
app.include_router(subscription_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
