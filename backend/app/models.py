import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base

class gameRow(Base):
    __tablename__="games"

    id: Mapped[uuid.UUID]=mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    sports: Mapped[str]=mapped_column(String(20), index=True)
    location: Mapped[str]=mapped_column(String(100), index=True)
    starttime: Mapped[datetime]=mapped_column(DateTime(timezone=True), index=True)
    maxplayers: Mapped[int]=mapped_column(Integer)
    skilllevel: Mapped[str]=mapped_column(String(20), default="all")

    players: Mapped[list["playerRow"]]=relationship(back_populates="game", cascade="all, delete-orphan", order_by="playerRow.id")

class playerRow(Base):
    __tablename__ = "game_participants"
    __table_args__=(UniqueConstraint("game_id", "playername"),)

    id: Mapped[int]=mapped_column(Integer, primary_key=True, autoincrement=True)
    game_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("games.id", ondelete="CASCADE"), index=True)
    playername: Mapped[str]=mapped_column(String(50))
    joined_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    game: Mapped[gameRow]=relationship(back_populates="players")