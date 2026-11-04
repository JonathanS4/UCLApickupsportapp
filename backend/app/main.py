from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime
from uuid import UUID, uuid4
from typing import Literal

app=FastAPI(title="UCLA Pickup Sports API")

app.add_middleware(CORSMiddleware,
                   allow_origins=["http://localhost:3000"],
                   allow_methods=['*'],
                   allow_headers=['*'],)

maxplayers={"basketball":10,"soccer":22}

class creategame(BaseModel):
    sports: Literal["basketball", "soccer"]
    location: str
    starttime: datetime
    maxplayers: int=Field(gt=1)
    skilllevel: Literal["beginner","intermediete","advanced","all"] = "all"

    @field_validator("sports","skilllevel",mode="before")
    @classmethod
    def nomralize(cls,value):
        if isinstance(value,str):
            return value.strip().lower()
        return value

    @model_validator(mode="after")
    def checkmaxplayers(self):
        limit=maxplayers[self.sports]
        if self.maxplayers>limit:
            raise ValueError(f"Too many players for {self.sport} game. Can have at most {limit} players")
        return self

class game(creategame):
    id: UUID
    players: list[str]=[]

class Location(BaseModel):
    id: str
    name: str
    sports: list[str]

LOCATIONS = [
    Location(id="wooden", name="John Wooden Center", sports=["basketball"]),
    Location(id="sunset-canyon", name="Sunset Canyon Recreation Center", sports=["basketball"]),
    Location(id="im-field", name="Intramural Field", sports=["soccer"]),
    Location(id="drake", name="Drake Stadium", sports=["soccer"]),
]

games:dict[UUID,game]={}

@app.get("/")

def root():
    return {"message": "Pickup sports backend is running"}

@app.get("/games",response_model=list[game])
def listgames():
    return list(games.values())

@app.post("/games",response_model=game,status_code=201)
def makegame(gamein: creategame):
    livegame=game(id=uuid4(),**gamein.model_dump())
    games[livegame.id]=livegame
    return livegame

@app.get("/games/{gameid}",response_model=game)
def getgame(gameid: UUID):
    if gameid not in games:
        raise HTTPException(status_code=404,detail="Game not found")
    return games[gameid]

@app.post("/games/{gameid}/join",response_model=game)
def joingame(gameid: UUID, playername: str):
    livegame=games.get(gameid)
    if livegame is None:
        raise HTTPException(status_code=404,detail="Game not found")
    if playername in livegame.players:
        raise HTTPException(status_code=400,detail="Already joined")
    if len(livegame.players)>=livegame.maxplayers:
        raise HTTPException(status_code=409,detail="Game is full")
    livegame.players.append(playername)
    return livegame

@app.delete("/games/{gameid}/join",response_model=game)
def leavegame(gameid: UUID, playername: str):
    livegame=games.get(gameid)
    if livegame is None:
        raise HTTPException(status_code=404,detail="Game not found")
    if playername not in livegame.players:
        raise HTTPException(status_code=400,detail="Player is not in this game")
    livegame.players.remove(playername)
    return livegame

@app.get("/locations",response_model=list[Location])
def listoflocations():
    return LOCATIONS

