import os

from pymongo import MongoClient

host = os.environ.get("MONGO_HOST", "localhost")
port = os.environ.get("MONGO_PORT", "27017")

client = MongoClient(f"mongodb://{host}:{port}/")
db = client["flobrain"]
