import asyncio
from datetime import datetime, timedelta, UTC
import bcrypt
from sqlalchemy import select, delete, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session
from app.models.user import UserDB
from app.models.transaction import TransactionDB
from app.models.fraud_alert import FraudAlertDB


async def clear_database(session: AsyncSession):
    """Clear existing data from all tables"""
    print("🧹 Clearing existing data...")
    
    # Delete in correct order (foreign key dependencies)
    await session.execute(delete(FraudAlertDB))
    await session.execute(delete(TransactionDB))
    await session.execute(delete(UserDB))
    
    await session.commit()
    print("✅ Database cleared")


async def seed_users(session: AsyncSession):
    """Seed test users with hashed passwords"""
    print("👤 Seeding users...")
    
    now = datetime.now()  # Naive datetime (no timezone)
    
    users = [
        UserDB(
            email="alice@example.com",
            username="alice",
            password_hash=bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            role="user",
            is_active=True,
            created_at=now,
            updated_at=now
        ),
        UserDB(
            email="bob@example.com",
            username="bob",
            password_hash=bcrypt.hashpw("securepass".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            role="user",
            is_active=True,
            created_at=now,
            updated_at=now
        ),
        UserDB(
            email="admin@example.com",
            username="admin",
            password_hash=bcrypt.hashpw("adminpass".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            role="admin",
            is_active=True,
            created_at=now,
            updated_at=now
        )
    ]
    
    session.add_all(users)
    await session.commit()
    
    # Refresh to get IDs
    for user in users:
        await session.refresh(user)
    
    print(f"✅ {len(users)} users seeded")
    return users


async def seed_transactions(session: AsyncSession, users):
    """Seed test transactions"""
    print("💳 Seeding transactions...")
    
    # Get current time without timezone info (naive datetime)
    now = datetime.now()
    
    transactions = []
    for i in range(1, 6):
        user = users[i % len(users)]
        transactions.append(
            TransactionDB(
                transaction_id=f"TXN00{i}",
                user_id=str(user.id),
                amount=round(50 + i * 100.75, 2),
                location=f"City-{i}",
                device=f"Device-{i}",
                timestamp=now - timedelta(days=i),
                is_fraud=(i % 2 == 0),  # Even transactions are fraud
                risk_score=round(0.2 * i, 2),
                created_at=now,
                updated_at=now
            )
        )
    
    session.add_all(transactions)
    await session.commit()
    
    # Refresh to get IDs
    for txn in transactions:
        await session.refresh(txn)
    
    print(f"✅ {len(transactions)} transactions seeded")
    return transactions


async def seed_fraud_alerts(session: AsyncSession, transactions):
    """Seed fraud alerts for fraudulent transactions"""
    print("🚨 Seeding fraud alerts...")
    
    now = datetime.now()  # Naive datetime
    
    alerts = []
    for txn in transactions:
        if txn.is_fraud:
            severity = "high" if txn.risk_score > 0.5 else "medium"
            alerts.append(
                FraudAlertDB(
                    transaction_id=txn.transaction_id,
                    reason="Suspicious transaction pattern detected",
                    severity=severity,
                    created_at=now,
                    updated_at=now
                )
            )
    
    session.add_all(alerts)
    await session.commit()
    
    print(f"✅ {len(alerts)} fraud alerts seeded")


async def main():
    """Main seeding function"""
    try:
        print("\n" + "="*50)
        print("🌱 DATABASE SEEDING STARTED")
        print("="*50 + "\n")
        
        async with async_session() as session:
            # Clear existing data first
            await clear_database(session)
            
            # Seed data
            users = await seed_users(session)
            transactions = await seed_transactions(session, users)
            await seed_fraud_alerts(session, transactions)
        
        print("\n" + "="*50)
        print("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("="*50 + "\n")
        
        print("📊 Summary:")
        print(f"   - Users: 3")
        print(f"   - Transactions: 5")
        print(f"   - Fraud Alerts: 2-3")
        print()
        
    except Exception as e:
        print("\n" + "="*50)
        print("❌ ERROR OCCURRED DURING SEEDING")
        print("="*50)
        print(f"\nError: {str(e)}\n")
        raise


if __name__ == "__main__":
    asyncio.run(main())