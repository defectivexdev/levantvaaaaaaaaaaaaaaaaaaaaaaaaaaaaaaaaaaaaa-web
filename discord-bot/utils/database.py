from pymongo import MongoClient
from typing import Optional
import config

client: Optional[MongoClient] = None
db = None

def connect_database():
    """Connect to MongoDB database"""
    global client, db
    
    if client is not None:
        print('Using existing database connection')
        return db
    
    try:
        client = MongoClient(config.MONGODB_URI)
        db = client.get_default_database()
        print('Connected to MongoDB')
        return db
    except Exception as e:
        print(f'MongoDB connection error: {e}')
        raise e

def get_database():
    """Get database instance"""
    if db is None:
        return connect_database()
    return db
