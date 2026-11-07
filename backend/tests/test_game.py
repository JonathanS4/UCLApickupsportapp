from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def make_game(sports="basketball", maxplayers=2):
    return {
        "sports": sports,
        "location": "John Wooden Center",
        "starttime": "2027-01-15T18:00:00",
        "maxplayers": maxplayers,
    }

def create(**kwargs):
    res = client.post("/games", json=make_game(**kwargs))
    assert res.status_code == 201
    return res.json()["id"]

def join(gameid, name):
    return client.post(f"/games/{gameid}/join", params={"playername": name})

# ---- Creating games ----
def testCreateValidGame():
    res = client.post("/games", json=make_game(maxplayers=10))
    assert res.status_code == 201
    assert res.json()["status"] == "open"

def testUppercaseSportIsNormalized():
    res = client.post("/games", json=make_game(sports="BASKETBALL"))
    assert res.json()["sports"] == "basketball"

def testInvalidSport():
    assert client.post("/games", json=make_game(sports="pizza")).status_code == 422

def testBasketballMaxPlayers():
    assert client.post("/games", json=make_game(maxplayers=11)).status_code == 422

def testPastGameRejected():
    body = make_game()
    body["starttime"] = "2025-01-01T18:00:00"
    assert client.post("/games", json=body).status_code == 422

def testTimeNotMultipleOf15Minutes():
    body = make_game()
    body["starttime"] = "2027-01-15T18:13:00"
    assert client.post("/games", json=body).status_code == 422

def testGameFillsUp():
    gameid = create(maxplayers=2)
    assert join(gameid, "a").status_code == 200
    assert join(gameid, "b").json()["status"] == "full"
    assert join(gameid, "c").status_code == 409

def testCannotJoinTwice():
    gameid = create()
    join(gameid, "a")
    assert join(gameid, "a").status_code == 400

def testLeaveFreesSpot():
    gameid = create(maxplayers=2)
    join(gameid, "a")
    join(gameid, "b")
    res = client.delete(f"/games/{gameid}/join", params={"playername": "b"})
    assert res.status_code == 200
    assert join(gameid, "c").status_code == 200

def testCancelGame():
    gameid = create()
    assert client.delete(f"/games/{gameid}").status_code == 204
    assert client.get(f"/games/{gameid}").status_code == 404