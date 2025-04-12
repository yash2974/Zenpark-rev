from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from datetime import datetime
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

# MySQL DB connection
def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="test",
        password="test",
        database="project_zenpark"
    )

@app.websocket("/ws/plates")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    last_id = 0  # Track new entries only

    while True:
        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM plates WHERE id > %s ORDER BY id ASC", (last_id,))
            rows = cursor.fetchall()

            for row in rows:
                row["timestamp"] = row["timestamp"].strftime('%Y-%m-%d %H:%M:%S')
                await websocket.send_json(row)
                last_id = row["id"]

            cursor.close()
            conn.close()

            await asyncio.sleep(2)  # Poll every 2 seconds

        except Exception as e:
            print(f"Error: {e}")
            await websocket.close()
            break
