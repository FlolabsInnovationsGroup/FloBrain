//This is the program to run on the local host that will act as the server
// to capture the stream from the esp32 via the ip address

import cv2
import requests
import base64
import json

# Replace with your ESP32-CAM video stream URL
ESP32_STREAM_URL = "http://YOUR_ESP32_IP:PORT/stream"

# OpenAI API credentials
OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"
CHATGPT_VISION_URL = "https://api.openai.com/v1/chat/completions"

# Function to send image to OpenAI Vision API
def send_frame_to_chatgpt(frame, question):
    _, buffer = cv2.imencode(".jpg", frame)
    encoded_image = base64.b64encode(buffer).decode("utf-8")

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-4-vision-preview",  # GPT-4 with vision capabilities
        "messages": [
            {"role": "system", "content": "You are an AI assistant analyzing a live video feed."},
            {"role": "user", "content": [
                {"type": "text", "text": question},  # User's question
                {"type": "image_url", "image_url": f"data:image/jpeg;base64,{encoded_image}"}
            ]}
        ],
        "max_tokens": 300  # Adjust based on how detailed you want the response
    }

    response = requests.post(CHATGPT_VISION_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.status_code}, {response.text}"

# Function to receive and display the video stream
def receive_video_stream():
    cap = cv2.VideoCapture(ESP32_STREAM_URL)

    if not cap.isOpened():
        print("Error: Could not open video stream.")
        return

    print("Press 'q' to quit. Press 's' to ask a question about the current frame.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame.")
            break

        cv2.imshow("ESP32-CAM Live Feed", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):  # Quit
            break
        elif key == ord('s'):  # Ask question
            question = input("Enter your question about the current frame: ")
            response = send_frame_to_chatgpt(frame, question)
            print("\nAI Response:", response)

    cap.release()
    cv2.destroyAllWindows()

# Run the video feed receiver
receive_video_stream()
