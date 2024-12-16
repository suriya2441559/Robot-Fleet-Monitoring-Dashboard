### Backend Code (FastAPI)
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import random
import datetime

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

robots = [
    {
        "robot_id": f"robot_{i}",
        "name": f"Robot_{i}",
        "type": random.choice(["Exploration", "Delivery", "Surveillance"]),
        "online": random.choice([True, False]),
        "battery": random.randint(5, 100),
        "cpu": random.randint(10, 90),
        "ram": random.randint(100, 8000),
        "disk_space": random.randint(20, 500),
        "temperature": round(random.uniform(30, 90), 1),
        "last_updated": datetime.datetime.now().isoformat(),
        "location": (round(random.uniform(-90, 90), 6), round(random.uniform(-180, 180), 6)),
    }
    for i in range(10)
]

@app.get("/robots")
async def get_robots():
    return robots

@app.get("/robot/{robot_id}")
async def get_robot(robot_id: str):
    for robot in robots:
        if robot["robot_id"] == robot_id:
            return robot
    return {"error": "Robot not found"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        for robot in robots:
            robot["battery"] = max(0, robot["battery"] - random.randint(0, 5))
            robot["cpu"] = random.randint(10, 90)
            robot["ram"] = random.randint(100, 8000)
            robot["disk_space"] = max(0, robot["disk_space"] - random.randint(0, 10))
            robot["temperature"] = round(random.uniform(30, 90), 1)
            robot["online"] = random.choice([True, False])
            robot["last_updated"] = datetime.datetime.now().isoformat()
            robot["location"] = (
                round(robot["location"][0] + random.uniform(-0.01, 0.01), 6),
                round(robot["location"][1] + random.uniform(-0.01, 0.01), 6),
            )
        await websocket.send_json(robots)
        await asyncio.sleep(5)
