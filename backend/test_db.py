import sys
import os

# Add root directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.base import Base
from backend.models.user import User
from backend.models.product import Product
from backend.models.business_profile import BusinessProfile
from backend.models.conversation import Conversation
from backend.models.subscription import Subscription
from backend.models.activity import Activity
from backend.crud.crud_user import crud_user
from backend.crud.crud_product import crud_product
from backend.crud.crud_business_profile import crud_business_profile
from backend.crud.crud_conversation import crud_conversation
from backend.crud.crud_subscription import crud_subscription
from backend.crud.crud_activity import crud_activity
from backend.schemas.user import UserCreate
from backend.schemas.product import ProductCreate

def run_suite():
    print("==================================================")
    print("KRIVIO AI Production Data & User Isolation Tests")
    print("==================================================")

    # Use an isolated test database engine (SQLite memory engine for pure validation)
    engine = create_engine("sqlite:///:memory:", echo=False)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # 1. Initialize Tables
    print("\n1. Initializing schema across all production models...")
    Base.metadata.create_all(bind=engine)
    print("[SUCCESS] Tables created: users, business_profiles, products, conversations, subscriptions, activities, product_images")

    db = TestingSessionLocal()
    try:
        # 2. Create User A (Madhubani Artisan)
        print("\n2. Testing USER A Creation & Data Flow...")
        user_a = crud_user.create(db, obj_in=UserCreate(
            name="Radha Devi",
            email="radha@mithilakrafts.in",
            supabase_user_id="sb_user_a_radha",
            role="artisan"
        ))
        print(f"[SUCCESS] User A Created: ID={user_a.id}, SupabaseID={user_a.supabase_user_id}, Name={user_a.full_name}")

        # Business Profile for User A
        bp_a = crud_business_profile.upsert_for_user(db, user_id=user_a.id, obj_in={
            "businessName": "Mithila Heritage Crafts",
            "businessCategory": "Handicrafts & Art",
            "state": "Bihar",
            "district": "Madhubani",
            "phoneNumber": "+91 98765 00001"
        })
        print(f"[SUCCESS] Business Profile A Created: {bp_a.business_name} (user_id={bp_a.user_id})")

        # Product for User A
        prod_a = crud_product.create_for_user(db, user_id=user_a.id, obj_in=ProductCreate(
            title="Handmade Madhubani Peacock Canvas",
            category="Handicrafts & Art",
            price=1850.0,
            stock=5,
            isMarketplaceReady=True
        ))
        print(f"[SUCCESS] Product A Created: {prod_a.title} (ID={prod_a.id}, user_id={prod_a.user_id})")

        # 3. Create User B (Terracotta Potter)
        print("\n3. Testing USER B Creation & Data Flow...")
        user_b = crud_user.create(db, obj_in=UserCreate(
            name="Ramesh Kumar",
            email="ramesh@mittikala.in",
            supabase_user_id="sb_user_b_ramesh",
            role="artisan"
        ))
        print(f"[SUCCESS] User B Created: ID={user_b.id}, SupabaseID={user_b.supabase_user_id}, Name={user_b.full_name}")

        # Business Profile for User B
        bp_b = crud_business_profile.upsert_for_user(db, user_id=user_b.id, obj_in={
            "businessName": "Mitti Kala Pottery",
            "businessCategory": "Pottery & Clay Art",
            "state": "Uttar Pradesh",
            "district": "Gorakhpur",
            "phoneNumber": "+91 98765 00002"
        })
        print(f"[SUCCESS] Business Profile B Created: {bp_b.business_name} (user_id={bp_b.user_id})")

        # Product for User B
        prod_b = crud_product.create_for_user(db, user_id=user_b.id, obj_in=ProductCreate(
            title="Traditional Terracotta Water Matka",
            category="Pottery & Clay Art",
            price=450.0,
            stock=12,
            isMarketplaceReady=True
        ))
        print(f"[SUCCESS] Product B Created: {prod_b.title} (ID={prod_b.id}, user_id={prod_b.user_id})")

        # 4. TEST STRICT DATA ISOLATION
        print("\n4. Verifying Strict Multi-Tenant Data Isolation...")
        products_user_a = crud_product.get_by_user_id(db, user_id=user_a.id)
        products_user_b = crud_product.get_by_user_id(db, user_id=user_b.id)

        # Check User A only gets Product A
        assert len(products_user_a) == 1, f"Expected 1 product for User A, got {len(products_user_a)}"
        assert products_user_a[0].id == prod_a.id, "User A retrieved wrong product"
        assert products_user_a[0].user_id == user_a.id, "User A product user_id mismatch"
        print(f"[SUCCESS] User A sees ONLY Product A: '{products_user_a[0].title}'")

        # Check User B only gets Product B
        assert len(products_user_b) == 1, f"Expected 1 product for User B, got {len(products_user_b)}"
        assert products_user_b[0].id == prod_b.id, "User B retrieved wrong product"
        assert products_user_b[0].user_id == user_b.id, "User B product user_id mismatch"
        print(f"[SUCCESS] User B sees ONLY Product B: '{products_user_b[0].title}'")

        # Check Cross-Tenant Profile Isolation
        prof_a = crud_business_profile.get_by_user_id(db, user_id=user_a.id)
        prof_b = crud_business_profile.get_by_user_id(db, user_id=user_b.id)
        assert prof_a.business_name == "Mithila Heritage Crafts"
        assert prof_b.business_name == "Mitti Kala Pottery"
        assert prof_a.user_id == user_a.id
        assert prof_b.user_id == user_b.id
        print("[SUCCESS] Business Profiles are completely isolated per user.")

        # 5. Test Real Conversation Persistence
        print("\n5. Verifying AI Conversation Persistence...")
        conv_a = crud_conversation.append_message_for_user(
            db,
            user_id=user_a.id,
            user_msg="What is my recommended price for Madhubani canvas?",
            ai_reply="Based on your material costs and labor hours, Rs. 1850 is a fair retail price on ONDC.",
            language="English"
        )
        assert len(conv_a.messages) == 2
        print(f"[SUCCESS] Conversation persisted for User A with {len(conv_a.messages)} messages.")

        # Verify User B cannot see User A conversations
        convs_b = crud_conversation.get_by_user_id(db, user_id=user_b.id)
        assert len(convs_b) == 0
        print("[SUCCESS] User B conversation list is empty (strict conversation isolation).")

        # 6. Test Subscription Management
        print("\n6. Verifying Subscription Management...")
        sub_a = crud_subscription.get_or_create_for_user(db, user_id=user_a.id)
        assert sub_a.plan == "free"
        crud_subscription.upgrade_to_pro(db, user_id=user_a.id, payment_id="pay_test_123")
        upgraded_sub = crud_subscription.get_by_user_id(db, user_id=user_a.id)
        assert upgraded_sub.plan == "pro"
        print(f"[SUCCESS] User A subscription upgraded to '{upgraded_sub.plan}'.")

        # 7. Test Activity Logging
        print("\n7. Verifying Activity Logging...")
        crud_activity.log_activity(db, user_id=user_a.id, title="Test Event", description="Test event description")
        activities_a = crud_activity.get_by_user_id(db, user_id=user_a.id)
        activities_b = crud_activity.get_by_user_id(db, user_id=user_b.id)
        assert len(activities_a) == 1
        assert len(activities_b) == 0
        print(f"[SUCCESS] Activity log verified (User A has 1 activity, User B has 0 activities).")

        print("\n==================================================")
        print("ALL KRIVIO AI PRODUCTION DATABASE & MULTI-TENANT SUITE TESTS PASSED!")
        print("==================================================")
        return True
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    run_suite()
