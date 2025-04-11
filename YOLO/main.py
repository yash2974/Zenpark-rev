import cv2
import torch
import easyocr
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

# Load YOLO model
model = YOLO("best-epoch100.pt")

# Load EasyOCR reader
reader = easyocr.Reader(['en'])

# Video source
video_source = "Timeline 1.mp4"

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

    fps = int(cap.get(cv2.CAP_PROP_FPS))  
    frame_skip = fps * 8  # Run YOLO every 8 seconds

    frame_count = 0
    last_plate = None

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            if frame_count % frame_skip != 0:
                continue

            results = model(frame)[0]

            plate_detected = False

            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                plate_img = frame[y1:y2, x1:x2]

                if plate_img.size == 0:
                    continue
                
                


                # Convert plate to RGB for EasyOCR
                plate_rgb = cv2.cvtColor(plate_img, cv2.COLOR_BGR2RGB)

                # OCR using EasyOCR
                ocr_results = reader.readtext(plate_rgb)

                for bbox, text, conf in ocr_results:
                    number = text.strip().upper()

                    if number and len(number) >= 6 and number != last_plate:
                        last_plate = number
                        plate_detected = True

                        await websocket.send_json({"plate": number})
                        print(f"Detected: {number}")
                        break

                if plate_detected:
                    break

            if not plate_detected:
                print("No plates detected in this frame")

            await asyncio.sleep(0.1)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        cap.release()
        await websocket.close()
