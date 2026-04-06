from pymongo import MongoClient
try:
    from backend.config import MONGO_URI
except ModuleNotFoundError:
    from config import MONGO_URI

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client["DocMindCluster"]

    users_collection = db["users"]  
    companies_collection = db["companies"]
    documents_collection = db["documents"]
    otp_collection = db["otp_tokens"]
    chats_collection = db["chats"]
    chat_access_requests_collection = db["chat_access_requests"]
    chat_access_collection = db["chat_access"]
    
    # Create TTL index on otp_collection to auto-delete expired OTPs
    otp_collection.create_index([("expires_at", 1)], expireAfterSeconds=0)
    
    # Create unique index on chats to enforce one chat per admin
    chats_collection.create_index([("admin_id", 1)], unique=True)
    chats_collection.create_index([("company_id", 1)])
    documents_collection.create_index([("company_id", 1)])
    chats_collection.create_index([("chat_token", 1)], unique=True)
    chats_collection.create_index([("chat_access_code", 1)], unique=True, sparse=True)

    # Keep one active request record per chat/employee pair.
    chat_access_requests_collection.create_index(
        [("chat_id", 1), ("employee_id", 1)],
        unique=True,
    )
    chat_access_requests_collection.create_index([("admin_id", 1), ("status", 1)])

    # A granted employee can reuse chat access indefinitely.
    chat_access_collection.create_index([("chat_id", 1), ("employee_id", 1)], unique=True)
    chat_access_collection.create_index([("employee_id", 1)])

    print("MongoDB connection successful")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    exit(1)
