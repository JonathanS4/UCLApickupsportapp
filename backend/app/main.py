from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, model_validator, computed_field
from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import Literal
from zoneinfo import ZoneInfo

app=FastAPI(title="UCLA Pickup Sports API")

app.add_middleware(CORSMiddleware,
                   allow_origins=["http://localhost:3000"],
                   allow_methods=['*'],
                   allow_headers=['*'],)

maxplayers={"basketball":10,"soccer":22}

pacific=ZoneInfo("America/Los_Angeles")

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
    @field_validator("starttime", mode="after")
    @classmethod
    def normalizestarttime(cls, value):
        if value.tzinfo is None:
            value = value.replace(tzinfo=pacific)
        else:
            value = value.astimezone(pacific)
        if value.minute % 15 != 0 or value.second != 0 or value.microsecond != 0:
            raise ValueError("Start time must be on a 15-minute mark (:00, :15, :30, :45); no seconds allowed")
        return value

    @model_validator(mode="after")
    def check_starttime(self):
        if self.starttime<datetime.now(pacific):
            raise ValueError("Game start time must be in the future")
        return self

class game(creategame):
    id: UUID
    players: list[str]=[]
    @computed_field
    @property
    def spotsremaining(self)->int:
        remaining=self.maxplayers-len(self.players)
        return remaining

    @computed_field
    @property
    def status(self)->str:
        if self.spotsremaining==0:
                    return "full"
        elif self.spotsremaining<=3:
            return "almost full"
        
        else:
            return "open"


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
def listgames(sports: str | None=None, location: str | None=None, status: str | None=None):
    results=list(games.values())
    if sports:
        matches=[]
        for i in results:
            if i.sports==sports.strip().lower():
                matches.append(i)
        results=matches
    if location:
        matches=[]
        for i in results:
            if i.location==location:
                matches.append(i)
        results=matches
    if status:
            matches=[]
            for i in results:
                if i.status==status.strip().lower():
                    matches.append(i)
            results=matches
    results.sort(key=lambda i:i.starttime)
    return results

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

@app.delete("/games/{gameid}",status_code=204)
def cancelgame(gameid: UUID):
    if gameid not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    del games[gameid]

@app.get("/locations",response_model=list[Location])
def listoflocations():
    return LOCATIONS

@app.get("/sports")
def sportsallowed():
    return maxplayers

@app.get("/players/{playername}/games", response_model=list[game])
def findplayer(playername: str):
    matches=[]
    for i in games.values():
        if playername in i.players:
            matches.append(i)
    matches.sort(key=lambda i: i.starttime)
    return matches



