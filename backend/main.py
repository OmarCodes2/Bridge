from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict
import random
import string
import asyncio
from app.quiz import Quiz

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
    
    def start_quiz(self, quiz_type, identifier):
        self.quiz = Quiz(quiz_type, identifier)
        self.quiz.create_song_bank()
        self.quiz.generate_questions()

    def get_next_question(self):
        self.current_question = self.quiz.get_next_question()
        self.start_time = asyncio.get_event_loop().time()
        return self.current_question

    def update_player_points(self, username, is_correct):
        for player in self.players:
            if player.username == username:
                response_time = asyncio.get_event_loop().time() - self.start_time
                player.response_time = response_time
                if is_correct:
                    # Calculate points based on response time
                    player.points += max(1000 - int(response_time * 100), 0)  # Example point system

    def get_leaderboard(self):
        return sorted(self.players, key=lambda p: p.points, reverse=True)

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
                while True:
                    question = room.get_next_question()
                    if question:
                        await room.broadcast({"type": "question", "data": question})
                        await asyncio.sleep(10)  # Wait for 10 seconds to collect answers
                        await room.broadcast({"type": "standings", "data": room.get_leaderboard()})
                        await asyncio.sleep(5)  # Show standings for 5 seconds
                    else:
                        await room.broadcast({"type": "final_leaderboard", "data": room.get_leaderboard()})
                        break
            if data.get("answer"):
                username = data["username"]
                selected_option = data["answer"]
                is_correct = any(opt for opt in room.current_question["options"] if opt["text"] == selected_option and opt["is_correct"])
                room.update_player_points(username, is_correct)
                await room.broadcast({"type": "update", "data": room.get_leaderboard()})    
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
