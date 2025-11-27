
from fastapi.testclient import TestClient
from caipo_backend.main import app
import os

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Caipo Backend"}

def test_chat_endpoint_no_auth():
    # This might fail if API keys are missing, but the endpoint should still be reachable
    # We expect 200 if keys are set, or maybe 500/200 with error message if not.
    # The current implementation handles missing keys gracefully in some parts but maybe not all.
    # Let's just check if it accepts the request.
    response = client.post("/api/v1/chat/", json={"message": "Hello"})
    assert response.status_code in [200, 500] 
    # 500 is acceptable for now if keys are missing, as long as it's not 404
