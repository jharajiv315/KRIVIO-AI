import sys
import os

# Add root directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import SessionLocal, engine
from backend.connection import init_db, verify_db_connection
from backend.crud.crud_user import crud_user
from backend.schemas.user import UserCreate, UserUpdate

def run_db_tests():
    print("==================================================")
    print("KRIVIO AI PostgreSQL Database Verification Suite")
    print("==================================================")

    # 1. Initialize Tables
    print("\n1. Initializing database schema...")
    init_db()

    # 2. Check Connection
    print("\n2. Verifying connection to PostgreSQL...")
    connected = verify_db_connection()
    if not connected:
        print("❌ Could not connect to PostgreSQL database.")
        print("Tip: Ensure your PostgreSQL service is running and DATABASE_URL in .env is correct.")
        print("Example DATABASE_URL=postgresql://postgres:postgres@localhost:5432/krivio_db")
        return False
    print("✅ Successfully connected to PostgreSQL!")

    db = SessionLocal()
    try:
        # 3. Create Sample User
        print("\n3. Creating sample user...")
        test_email = "test_artisan@krivio.ai"
        
        # Clean up existing test user if present
        existing = crud_user.get_by_email(db, test_email)
        if existing:
            crud_user.remove(db, existing.id)

        user_in = UserCreate(
            name="Radha Devi",
            email=test_email,
            password="securepassword123",
            phone="+919876543210",
            role="artisan"
        )
        created_user = crud_user.create(db, obj_in=user_in)
        print(f"✅ User Created: ID={created_user.id}, Name={created_user.name}, Email={created_user.email}")

        # 4. Fetch Sample User
        print("\n4. Fetching user by ID...")
        fetched_user = crud_user.get_by_id(db, created_user.id)
        assert fetched_user is not None, "Failed to fetch created user"
        print(f"✅ User Fetched: ID={fetched_user.id}, Role={fetched_user.role}")

        # 5. Update Sample User
        print("\n5. Updating user profile...")
        update_in = UserUpdate(
            name="Radha Devi (Master Weaver)",
            phone="+919123456789"
        )
        updated_user = crud_user.update(db, db_obj=fetched_user, obj_in=update_in)
        print(f"✅ User Updated: Name={updated_user.name}, Phone={updated_user.phone}")

        # 6. Delete Sample User
        print("\n6. Deleting sample user...")
        deleted_user = crud_user.remove(db, user_id=updated_user.id)
        check_deleted = crud_user.get_by_id(db, updated_user.id)
        assert check_deleted is None, "User deletion verification failed"
        print(f"✅ User Deleted Successfully: ID={deleted_user.id}")

        print("\n==================================================")
        print("🎉 ALL POSTGRESQL CRUD TESTS PASSED SUCCESSFULLY!")
        print("==================================================")
        return True
    except Exception as e:
        print(f"❌ Error during database test execution: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    run_db_tests()
