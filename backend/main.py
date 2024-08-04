from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict
import random
import string
import asyncio
from app.quiz import Quiz
from app.search import *
from pydantic import BaseModel

app = FastAPI()

rooms: Dict[str, "Room"] = {}

class Player:
    def __init__(self, username: str, profile_image: str):
        self.username = username
        self.profile_image = profile_image
        self.points = 0
        self.response_time = 0.0
        
    def to_dict(self):
        return {
            "username": self.username,
            "profile_image": self.profile_image,
            "points": self.points,
            "response_time": self.response_time
        }

class RoomObject(BaseModel):
    album: str
    artist: str
    
class CreateRoom(BaseModel):
    token: str
    quiz_type: str
    question_type: str
    room_object: RoomObject  
    
class Token(BaseModel):
    token: str
    query: str


class Room:
    def __init__(self, room_id, token, quiz_type, question_type, room_object):
        self.id = room_id
        self.token = token
        self.quiz_type = quiz_type
        self.question_type = question_type
        self.room_object = room_object
        self.players: List[Player] = []
        self.connections: List[WebSocket] = []
        self.quiz = None

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
    
    def start_quiz(self):
        self.quiz = Quiz(self.token, self.quiz_type, self.question_type, self.room_object)
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
        sorted_players = sorted(self.players, key=lambda p: p.points, reverse=True)
        return [player.to_dict() for player in sorted_players]

def generate_room_id(length=4):
    return ''.join(random.choices(string.digits, k=length))

import asyncio
from fastapi import WebSocket

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
        
        while True:
            data = await websocket.receive_json()
            
            if data.get("action") == "join":
                player = Player(username=data["username"], profile_image=data["profile_image"])
                room.add_player(player)
                await room.broadcast({"type": "players", "data": room.get_players_data()})
                
            elif data.get("action") == "start":
                room.start_quiz()
                await room.broadcast({"type": "start", "message": "Quiz started"})
                
                while room.quiz.questions:  # Continue as long as there are questions
                    question = room.get_next_question()
                    await room.broadcast({"type": "question", "data": question})
                    
                    player_responses = {}

                    # Set a 10-second timer
                    start_time = asyncio.get_event_loop().time()

                    while asyncio.get_event_loop().time() - start_time < 10:
                        try:
                            answer_data = await asyncio.wait_for(websocket.receive_json(), timeout=10.0)
                            if answer_data.get("action") == "answer":
                                username = answer_data["username"]
                                selected_option = answer_data["answer"]
                                is_correct = any(
                                    opt for opt in room.current_question["options"] 
                                    if opt["text"] == selected_option and opt["is_correct"]
                                )
                                player_responses[username] = is_correct
                        except asyncio.TimeoutError:
                            # Timeout after 10 seconds, break the loop
                            break

                    # Update points for all players who responded
                    for username, is_correct in player_responses.items():
                        room.update_player_points(username, is_correct)
                    
                    # Broadcast the updated leaderboard after the timeout
                    await room.broadcast({"type": "standings", "data": room.get_leaderboard()})
                    await asyncio.sleep(5)  # Show standings for 5 seconds
                
                await room.broadcast({"type": "final_leaderboard", "data": room.get_leaderboard()})
                break  # Exit the loop after the quiz is over
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        room.remove_connection(websocket)
        await room.broadcast({"type": "players", "data": room.get_players_data()})
        await websocket.close()




# @app.websocket("/ws/{room_id}")
# async def websocket_endpoint(websocket: WebSocket, room_id: str):
#     await websocket.accept()
#     try:
#         room = rooms.get(room_id)
#         if not room:
#             await websocket.send_json({"type": "error", "message": "Room does not exist"})
#             await websocket.close()
#             return

#         room.add_connection(websocket)
        
#         data = await websocket.receive_json()
#         if data.get("action") == "join":
#             player = Player(username=data["username"], profile_image=data["profile_image"])
#             room.add_player(player)
#             await room.broadcast({"type": "players", "data": room.get_players_data()})
        
#         while True:
            
#             data = await websocket.receive_json()
#             if data.get("action") == "start":
#                 room.start_quiz()
#                 await room.broadcast({"type": "start", "message": "Quiz started"})
#                 while True:
#                     question = room.get_next_question()
#                     if question:
#                         await room.broadcast({"type": "question", "data": question})
#                         await asyncio.sleep(10)  # Wait for 10 seconds to collect answers
#                         await room.broadcast({"type": "standings", "data": room.get_leaderboard()})
#                         await asyncio.sleep(5)  # Show standings for 5 seconds
#                     else:
#                         await room.broadcast({"type": "final_leaderboard", "data": room.get_leaderboard()})
#                         break
#                     if data.get("action") == "answer":
#                         username = data["username"]
#                         selected_option = data["answer"]
#                         is_correct = any(opt for opt in room.current_question["options"] if opt["text"] == selected_option and opt["is_correct"])
#                         print("hello")
#                         room.update_player_points(username, is_correct)
#                         await room.broadcast({"type": "update", "data": room.get_leaderboard()})    
#     except WebSocketDisconnect:
#         room.remove_connection(websocket)
#         await room.broadcast({"type": "players", "data": room.get_players_data()})
#         pass

@app.post("/create_room")
async def create_room(response: CreateRoom):
    token = response.token
    quiz_type = response.quiz_type
    question_type = response.question_type
    room_object = response.room_object
    
    room_id = generate_room_id()
    while room_id in rooms:
        room_id = generate_room_id()
        
    room = Room(room_id, token, quiz_type, question_type, room_object)
    rooms[room.id] = room
    return {"room_id": room.id}

@app.get("/room_exists/{room_id}")
async def room_exists(room_id: str):
    return {"exists": room_id in rooms}

@app.post("/search_artist")
async def search_artist(response: Token):
    return get_spotify_artist_id(response.token, response.query)

async def cleanup_rooms():
    while True:
        for room_id, room in list(rooms.items()):
            if not room.connections:
                print(f"Deleting room {room_id} due to inactivity.")
                del rooms[room_id]
        await asyncio.sleep(300)  # Check every 5 minutes

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_rooms())