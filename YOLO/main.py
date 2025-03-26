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
    
    try:
        detected_plates = set()  # Use a set to prevent duplicates

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            results = model(frame)[0]

            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                plate_img = frame[y1:y2, x1:x2]

                gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
                number = pytesseract.image_to_string(
                    gray, config="--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
                ).strip()

                if number and len(number) == 8:
                    detected_plates.add(number)  # Add to set

                # Draw rectangle
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

            await websocket.send_json({"plates": list(detected_plates)})
            await asyncio.sleep(0.1)


    except Exception as e:
        print(f"Error: {e}")
    finally:
        cap.release()
        await websocket.close()
