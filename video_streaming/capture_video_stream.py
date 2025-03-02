//This is the program to run on the local host that will act as the server
// to capture the stream from the esp32 via the ip address

import cv2

stream_url = "http://<ESP32-IP>/stream"  # Replace with your ESP32 IP address

cap = cv2.VideoCapture(stream_url)

if not cap.isOpened():
    print("Error: Cannot open video stream")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow("ESP32 Stream", frame)

    if cv2.waitKey(1) == 27:  # Exit on ESC key
        break

cap.release()
cv2.destroyAllWindows()
