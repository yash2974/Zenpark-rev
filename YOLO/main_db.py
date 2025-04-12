from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import os
from dotenv import load_dotenv
import asyncio
from typing import Set
from datetime import datetime

load_dotenv()

# DB setup
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

# App setup
app = FastAPI()
clients: Set[WebSocket] = set()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def home():
    return HTMLResponse("<h2>License Plate Detection WebSocket API</h2>")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    
    try:
        # Send existing plates to new client immediately on connection
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT plate, confidence, timestamp FROM plates ORDER BY timestamp ASC")
        plates = cursor.fetchall()
        
        # Send initial data message with all plates
        for plate in plates:
            if isinstance(plate['timestamp'], datetime):
                plate['timestamp'] = plate['timestamp'].isoformat()
            await websocket.send_json({
                "type": "plate_data",
                "data": plate
            })
        
        # Send initialization complete message
        await websocket.send_json({
            "type": "initialization_complete",
            "count": len(plates)
        })
        
        cursor.close()
        conn.close()
        
        # Keep connection alive and handle client messages
        while True:
            # Wait for client messages (could be used for filtering, etc.)
            data = await websocket.receive_json()
            
            # Example: Handle client requests like refresh
            if data.get("action") == "refresh":
                conn = get_db_connection()
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT plate, confidence, timestamp FROM plates ORDER BY timestamp ASC")
                refresh_plates = cursor.fetchall()
                
                await websocket.send_json({
                    "type": "refresh_start",
                    "count": len(refresh_plates)
                })
                
                for plate in refresh_plates:
                    if isinstance(plate['timestamp'], datetime):
                        plate['timestamp'] = plate['timestamp'].isoformat()
                    await websocket.send_json({
                        "type": "plate_data",
                        "data": plate
                    })
                
                await websocket.send_json({
                    "type": "refresh_complete"
                })
                
                cursor.close()
                conn.close()
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        clients.remove(websocket)
        print(f"Client removed. Active connections: {len(clients)}")

async def db_polling_loop():
    """Poll database for new plates and broadcast to all connected clients"""
    last_checked_id = 0
    
    while True:
        try:
            if clients:  # Only poll if there are connected clients
                conn = get_db_connection()
                cursor = conn.cursor(dictionary=True)
                
                # Get the latest record ID first time
                if last_checked_id == 0:
                    cursor.execute("SELECT MAX(id) as max_id FROM plates")
                    result = cursor.fetchone()
                    if result and result['max_id']:
                        last_checked_id = result['max_id']
                
                # Check for new plates
                # Check for new plates
                cursor.execute(
                    "SELECT plate, confidence, timestamp FROM plates WHERE id > %s ORDER BY timestamp ASC", 
                    (last_checked_id,)
                )
                new_plates = cursor.fetchall()
                
                # Update last checked ID
                if new_plates:
                    cursor.execute("SELECT MAX(id) as max_id FROM plates")
                    result = cursor.fetchone()
                    if result and result['max_id']:
                        last_checked_id = result['max_id']
                
                # Broadcast new plates to all clients
                for plate in new_plates:
                    if isinstance(plate['timestamp'], datetime):
                        plate['timestamp'] = plate['timestamp'].isoformat()
                    
                    clients_copy = clients.copy()
                    for client in clients_copy:
                        try:
                            await client.send_json({
                                "type": "new_plate",
                                "data": plate
                            })
                            print(f"🔄 Sent update for plate {plate['plate']} to client")
                        except Exception:
                            clients.discard(client)
                
                cursor.close()
                conn.close()
                
        except mysql.connector.Error as err:
            print(f"❌ MySQL Error in polling loop: {err}")
        except Exception as e:
            print(f"❌ Error in polling loop: {e}")
            
        await asyncio.sleep(1)  # Poll every second

@app.on_event("startup")
async def startup_event():
    # Ensure plates table exists
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if table exists and has timestamp column
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS plates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plate VARCHAR(20) NOT NULL,
                confidence FLOAT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
    except mysql.connector.Error as err:
        print(f"❌ MySQL Error during startup: {err}")
    finally:
        cursor.close()
        conn.close()
    
    # Start DB polling task
    asyncio.create_task(db_polling_loop())
    print("🚀 WebSocket API started - Ready to serve React Native app")