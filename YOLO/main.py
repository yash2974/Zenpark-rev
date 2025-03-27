import cv2
import torch
import pytesseract
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import asyncio

app = FastAPI()

# CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to Tesseract (update path accordingly)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load YOLO model
model = YOLO("best.pt")

# Video source (change "0" to video path or use webcam)
video_source = "video.mp4"

@app.get("/")
async def home():
    return HTMLResponse("<h2>YOLO License Plate Detection API</h2>")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    cap = cv2.VideoCapture(video_source)
    
    if not cap.isOpened():
        print("Error: Could not open video.")
        await websocket.close()
        return

    fps = int(cap.get(cv2.CAP_PROP_FPS))  # Get the FPS of the video
    frame_skip = fps  # Skip frames to process only 1 frame per second

    frame_count = 0
    last_plate = None

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            # Skip frames based on FPS
            if frame_count % frame_skip != 0:
                continue

            results = model(frame)[0]

            plate_detected = False

            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                plate_img = frame[y1:y2, x1:x2]

                if plate_img.size == 0:  # Ensure the image is valid
                    continue

                gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)

                # OCR for plate extraction
                number = pytesseract.image_to_string(
                    gray, config="--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
                ).strip()

                if number and len(number) == 8 and number != last_plate:
                    last_plate = number
                    plate_detected = True

                    # Draw rectangle around the plate
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

                    # Send only one plate at a time
                    await websocket.send_json({"plate": number})
                    print(f"Detected: {number}")
                    break

            if not plate_detected:
                print("No plates detected in this frame")

            await asyncio.sleep(0.1)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        cap.release()
        await websocket.close()
