import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db import Base, getdb

@pytest.fixture
def session_maker():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
        poolclass=StaticPool,)
    Base.metadata.create_all(bind=engine)
    yield sessionmaker(bind=engine)
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(session_maker):
    def test_getdb():
        db=session_maker()
        try:
            yield db
        finally:
            db.close()
    app.dependency_overrides[getdb]=test_getdb
    yield TestClient(app)
    app.dependency_overrides.clear()