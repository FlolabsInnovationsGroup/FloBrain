import cv2

cap = cv2.VideoCapture("./sample_video.mp4")  # Adjust name/path if needed

if not cap.isOpened():
    print("Error: Could not open sample_video.mp4")
else:
    print("Video opened! Showing first frame...")
    ret, frame = cap.read()
    if ret:
        cv2.imshow("Test Frame", frame)
        cv2.waitKey(0)
    cap.release()
    cv2.destroyAllWindows()