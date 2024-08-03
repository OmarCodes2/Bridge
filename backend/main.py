from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict
import random
import string

app = FastAPI()

rooms: Dict[str, "Room"] = {}

class Player:
    def __init__(self, username: str, profile_image: str):
        self.username = username
        self.profile_image = profile_image

class Room:
    def __init__(self, room_id):
        self.id = room_id
        self.players: List[Player] = []
        self.connections: List[WebSocket] = []

    def add_player(self, player: Player):
        self.players.append(player)

    def add_connection(self, websocket: WebSocket):
        self.connections.append(websocket)

    def remove_connection(self, websocket: WebSocket):
        self.connections.remove(websocket)

    def get_players_data(self):
        return [{"username": player.username, "profile_image": player.profile_image} for player in self.players]

    async def broadcast(self, message: dict):
        for connection in self.connections:
            await connection.send_json(message)

def generate_room_id(length=4):
    return ''.join(random.choices(string.digits, k=length))

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    try:
        room = rooms.get(room_id)
        if not room:
            await websocket.send_json({"type": "error", "message": "Room does not exist"})
            await websocket.close()
            return

        room.add_connection(websocket)
        
        data = await websocket.receive_json()
        if data.get("action") == "join":
            player = Player(username=data["username"], profile_image=data["profile_image"])
            room.add_player(player)
            await room.broadcast({"type": "players", "data": room.get_players_data()})
        
        while True:
            data = await websocket.receive_json()
            if data.get("action") == "join":
                player = Player(username=data["username"], profile_image=data["profile_image"])
                room.add_player(player)
                await room.broadcast({"type": "players", "data": room.get_players_data()})
    except WebSocketDisconnect:
        room.remove_connection(websocket)
        await room.broadcast({"type": "players", "data": room.get_players_data()})
        pass

@app.post("/create_room")
async def create_room():
    room_id = generate_room_id()
    while room_id in rooms:
        room_id = generate_room_id()
    room = Room(room_id)
    rooms[room.id] = room
    return {"room_id": room.id}

@app.get("/room_exists/{room_id}")
async def room_exists(room_id: str):
    return {"exists": room_id in rooms}
