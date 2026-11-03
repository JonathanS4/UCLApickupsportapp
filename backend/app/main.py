from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID, uuid4

app=FastAPI(title="UCLA Pickup Sports API")

app.add_middleware(CORSMiddleware,
                   allow_origins=["http://localhost:3000"],
                   allow_methods=['*'],
                   allow_headers=['*'],)

class creategame(BaseModel):
    sports: str
    location: str
    starttime: datetime
    maxplayers: int=Field(gt=1,le=30)
    skilllevel: str="all"

class game(creategame):
    id: UUID
    players: list[str]=[]

games:dict[UUID,game]={}

@app.get("/")

def root():
    return {"message": "Pickup sports backend is running"}

@app.get("/games",response_model=list[game])
def listgames():
    return list(games.values())

@app.post("/games",response_model=game,status_code=201)
def create_game(game_in: creategame):
    livegame=game(id=uuid4(),**game_in.model_dump())
    games[livegame.id]=livegame
    return livegame

@app.get("/games/{game_id}",response_model=game)
def get_game(game_id: UUID):
    if game_id not in games:
        raise HTTPException(status_code=404,detail="Game not found")
    return games[game_id]

@app.post("/games/{game_id}/join",response_model=game)
def join_game(game_id: UUID, player_name: str):
    livegame=games.get(game_id)
    if livegame is None:
        raise HTTPException(status_code=404,detail="Game not found")
    if player_name in livegame.players:
        raise HTTPException(status_code=400,detail="Already joined")
    if len(livegame.players)>=livegame.maxplayers:
        raise HTTPException(status_code=409,detail="Game is full")
    livegame.players.append(player_name)
    return livegame

