from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.db import Base, engine, getdb
from app.models import gameRow, playerRow
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, model_validator, computed_field, ValidationError
from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import Literal
from zoneinfo import ZoneInfo

Base.metadata.create_all(bind=engine)

app=FastAPI(title="UCLA Pickup Sports API")

app.add_middleware(CORSMiddleware,
                   allow_origins=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000"],
                   allow_methods=['*'],
                   allow_headers=['*'],)

maxplayers={"basketball":10,"soccer":22}

pacific=ZoneInfo("America/Los_Angeles")

class creategame(BaseModel):
    sports: Literal["basketball", "soccer"]
    location: str
    starttime: datetime
    maxplayers: int=Field(gt=1)
    skilllevel: Literal["beginner","intermediate","advanced","all"] = "all"

    @field_validator("sports","skilllevel",mode="before")
    @classmethod
    def normalize(cls,value):
        if isinstance(value,str):
            return value.strip().lower()
        return value

    @model_validator(mode="after")
    def checkmaxplayers(self):
        limit=maxplayers[self.sports]
        if self.maxplayers>limit:
            raise ValueError(f"Too many players for {self.sports} game. Can have at most {limit} players")
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

class game(BaseModel):
    id: UUID
    sports: str
    location: str
    starttime: datetime
    maxplayers: int
    skilllevel: str
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

class updategame(BaseModel):
    location: str | None=None
    starttime:datetime | None=None
    maxplayers: int | None=None
    skilllevel: str | None=None


class Location(BaseModel):
    id: str
    name: str
    sports: list[str]


LOCATIONS = [
    Location(id="wooden", name="John Wooden Center", sports=["basketball"]),
    Location(id="drake", name="Drake Stadium", sports=["soccer"]),
    Location(id="sunset", name="Sunset Canyon Rec Center", sports=["soccer", "basketball"]),
    Location(id="hitch", name="Hitch Basketball Courts", sports=["basketball"]),
    Location(id="sycamore", name="Sycamore Park", sports=["soccer", "basketball"]),
]

def timeToPacific(value: datetime) -> datetime:
    if value.tzinfo is None:
        value=value.replace(tzinfo=timezone.utc)
    return value.astimezone(pacific)

def togame(row: gameRow) -> game:
    return game(id=row.id, sports=row.sports, location=row.location, 
                starttime=timeToPacific(row.starttime), maxplayers=row.maxplayers,
                skilllevel=row.skilllevel,players=[p.playername for p in row.players],)

def findgame(db: Session, gameid: UUID, lock: bool=False) -> gameRow:
    row=db.get(gameRow, gameid, with_for_update=lock)
    if row is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return row

@app.get("/")
def root():
    return {"message": "Pickup sports backend is running"}

@app.get("/games",response_model=list[game])
def listgames(sports: str | None=None, location: str | None=None, status: str | None=None, db: Session=Depends(getdb)):
    query=select(gameRow).order_by(gameRow.starttime)
    if sports:
        query=query.where(gameRow.sports==sports.strip().lower())
    if location:
        query=query.where(gameRow.location==location)
    results=[togame(row) for row in db.scalars(query)]
    if status:
        results=[i for i in results if i.status==status.strip().lower()]
    return results

@app.post("/games",response_model=game,status_code=201)
def makegame(gamein: creategame, db: Session=Depends(getdb)):
    row=gameRow(sports=gamein.sports, location=gamein.location,
        starttime=gamein.starttime.astimezone(timezone.utc), 
        maxplayers=gamein.maxplayers, skilllevel=gamein.skilllevel,)
    db.add(row)
    db.commit()
    return togame(row)
    

@app.get("/games/{gameid}",response_model=game)
def getgame(gameid: UUID, db: Session=Depends(getdb)):
    return togame(findgame(db, gameid))

@app.post("/games/{gameid}/join",response_model=game)
def joingame(gameid: UUID, playername: str, db: Session=Depends(getdb)):
    playername=playername.strip()
    if not playername:
        raise HTTPException(status_code=400, detail="Player name cannot be blank")
    row=findgame(db, gameid, lock=True)
    if timeToPacific(row.starttime)<=datetime.now(pacific):
        raise HTTPException(status_code=400, detail="Game already started")
    if playername in [p.playername for p in row.players]:
        raise HTTPException(status_code=400, detail="Already joined")
    if len(row.players)>=row.maxplayers:
        raise HTTPException(status_code=409, detail="Game is full")
    row.players.append(playerRow(playername=playername))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Already joined")
    return togame(row)

@app.delete("/games/{gameid}/join",response_model=game)
def leavegame(gameid: UUID, playername: str, db: Session=Depends(getdb)):
    row=findgame(db, gameid, lock=True)
    for p in row.players:
        if p.playername==playername.strip():
            row.players.remove(p)
            db.commit()
            return togame(row)
    raise HTTPException(status_code=400,detail="Player is not in this game")

@app.delete("/games/{gameid}",status_code=204)
def cancelgame(gameid: UUID, db: Session=Depends(getdb)):
    row=findgame(db, gameid)
    db.delete(row)
    db.commit()

@app.patch("/games/{gameid}",response_model=game)
def editgame(gameid: UUID, changes: updategame, db: Session=Depends(getdb)):
    row=findgame(db, gameid, lock=True)
    current=togame(row).model_dump(include={"sports","location","starttime","maxplayers","skilllevel"})
    current.update(changes.model_dump(exclude_unset=True))
    try:
        checked=creategame(**current)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=[err["msg"] for err in e.errors()])
    if checked.maxplayers<len(row.players):
        raise HTTPException(status_code=409, detail="Can't set max players below the number of players already joined")
    row.location=checked.location
    row.starttime=checked.starttime.astimezone(timezone.utc)
    row.maxplayers=checked.maxplayers
    row.skilllevel=checked.skilllevel
    db.commit()
    return togame(row)

@app.get("/locations",response_model=list[Location])
def listoflocations():
    return LOCATIONS

@app.get("/sports")
def sportsallowed():
    return maxplayers

@app.get("/players/{playername}/games", response_model=list[game])
def findplayer(playername: str, db: Session=Depends(getdb)):
    query=(select(gameRow)
           .join(playerRow)
           .where(playerRow.playername==playername.strip())
           .order_by(gameRow.starttime))
    return [togame(row) for row in db.scalars(query)]



