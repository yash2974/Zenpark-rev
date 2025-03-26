import cv2
import os
import torch
import pytesseract
from ultralytics import YOLO

# Path to Tesseract (change it according to your system)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load the YOLO model
model = YOLO("best.pt")

# Video source (0 for webcam or path to video file)
video_path = "video.mp4"
cap = cv2.VideoCapture(video_path)

# Create output folder for frames
output_folder = "output_frames"
os.makedirs(output_folder, exist_ok=True)

frame_count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    frame_path = os.path.join(output_folder, f"frame_{frame_count}.jpg")

    # Save the frame as image
    cv2.imwrite(frame_path, frame)

    # Run YOLO inference
    results = model(frame)[0]
    numberPlates=[]
    for box in results.boxes:
        
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        plate_img = frame[y1:y2, x1:x2]

        # OCR to extract the license plate number
        gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
        number = pytesseract.image_to_string(gray, config="--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789").strip()

        # Draw rectangle and show the plate number
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        
        # print(f"Frame {frame_count}: {number}")
        if number not in numberPlates and len(number)==8:
            numberPlates.append(number)
            print(numberPlates)
        else:
            print("Duplicate Number Plate Detected")
            # cv2.putText(frame, number, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

    # Display the frame with bounding box and number
    cv2.imshow("License Plate Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
