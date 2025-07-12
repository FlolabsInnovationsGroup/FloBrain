# echo.py
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route("/transcribe", methods=["POST"])
def transcribe():
    return jsonify(text="dummy transcription from shell")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
