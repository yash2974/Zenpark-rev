from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import easyocr
import cv2
import asyncio
import mysql.connector
import os
from dotenv import load_dotenv
import re
from datetime import datetime

load_dotenv()

# DB setup
db = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)
cursor = db.cursor()

# App setup - this is what Uvicorn needs
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("best-epoch100.pt")
reader = easyocr.Reader(['en'])
video_source = "carLicence4.mp4"
last_plate = None

@app.get("/")
async def home():
    return HTMLResponse("<h2>YOLO License Plate Detection API</h2><p>This API is running and detecting license plates.</p>")

@app.get("/status")
async def status():
    try:
        cursor.execute("SELECT COUNT(*) as plate_count FROM plates")
        result = cursor.fetchone()
        plate_count = result[0] if result else 0
        
        return {
            "status": "running",
            "plates_detected": plate_count,
            "video_source": video_source
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

async def plate_detection_loop():
    global last_plate
    cap = cv2.VideoCapture(video_source)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_skip = fps
    frame_count = 0
    confidence_threshold = 0.7

    print("🔍 License Plate Detection API Started")
    print("💾 Saving detections to database")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("🔄 Video ended. Rewinding to start...")
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            frame_count = 0
            continue

        frame_count += 1
        if frame_count % frame_skip != 0:
            continue

        results = model(frame)[0]
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            plate_img = frame[y1:y2, x1:x2]
            if plate_img.size == 0:
                continue
            plate_rgb = cv2.cvtColor(plate_img, cv2.COLOR_BGR2RGB)
            ocr_results = reader.readtext(plate_rgb)

            for _, text, conf in ocr_results:
                if conf >= confidence_threshold:
                    cleaned_text = re.sub(r'[^0-9A-Z]', '', text.strip().upper())
                    if cleaned_text and len(cleaned_text) >= 6 and cleaned_text != last_plate:
                        last_plate = cleaned_text
                        timestamp = datetime.now()

                        # Save to DB
                        try:
                            # Check if the plate is in approved_vehichles
                            cursor.execute("SELECT 1 FROM approved_vehicles WHERE vehicle_number = %s LIMIT 1", (cleaned_text,))

                            approved = cursor.fetchone() is not None

                            # Save to plates table with 'approved' flag
                            cursor.execute(
                                "INSERT INTO plates (plate, confidence, timestamp, approved) VALUES (%s, %s, %s, %s)", 
                                (cleaned_text, float(conf), timestamp, approved)
                            )

                            db.commit()
                            print(f"✅ [Saved to DB] {cleaned_text} at {timestamp.isoformat()}")
                        except mysql.connector.Error as err:
                            print(f"❌ MySQL Error: {err}")
                            # Reconnect if connection was lost
                            if err.errno == 2006:  # MySQL server has gone away
                                db.reconnect()
                        break
        await asyncio.sleep(0.1)

@app.on_event("startup")
async def startup_event():
    # Ensure plates table exists
    try:
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            plate VARCHAR(20) NOT NULL,
            confidence FLOAT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            approved BOOLEAN DEFAULT FALSE
        )
    """)
        db.commit()
        
        # Start the detection loop
        asyncio.create_task(plate_detection_loop())
        print("🚀 License Plate Detection API started")
    except Exception as e:
        print(f"❌ Error during startup: {e}")