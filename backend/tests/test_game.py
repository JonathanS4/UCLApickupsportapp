from datetime import datetime, timedelta, timezone
from uuid import uuid4
from zoneinfo import ZoneInfo

from app.models import gameRow, playerRow

pacific = ZoneInfo("America/Los_Angeles")

def tomorrow_at_6pm():
    t = datetime.now(pacific) + timedelta(days=1)
    t = t.replace(hour=18, minute=0, second=0, microsecond=0)
    return t.isoformat()


def make_game(client, **changes):
    body = {
        "sports": "basketball",
        "location": "wooden",
        "starttime": tomorrow_at_6pm(),
        "maxplayers": 10,
        "host": "jonathan",
    }
    body.update(changes)
    return client.post("/games", json=body)


def join(client, gameid, name):
    return client.post(f"/games/{gameid}/join", params={"playername": name})


def leave(client, gameid, name):
    return client.delete(f"/games/{gameid}/join", params={"playername": name})


def test_create_game_works(client):
    r = make_game(client)
    assert r.status_code == 201
    data = r.json()
    assert data["host"] == "jonathan"
    assert data["players"] == ["jonathan"]
    assert data["spotsremaining"] == 9
    assert data["status"] == "open"


def test_location_is_cleaned_up(client):
    r = make_game(client, sports="soccer", location="  Drake ", maxplayers=22)
    assert r.status_code == 201
    assert r.json()["location"] == "drake"


def test_unknown_location_rejected(client):
    r = make_game(client, location="asdf")
    assert r.status_code == 422


def test_wrong_sport_for_location_rejected(client):
    r = make_game(client, sports="soccer", location="wooden")
    assert r.status_code == 422


def test_start_time_must_be_on_15_minute_mark(client):
    t = datetime.now(pacific) + timedelta(days=1)
    t = t.replace(hour=18, minute=7, second=0, microsecond=0)
    r = make_game(client, starttime=t.isoformat())
    assert r.status_code == 422


def test_start_time_must_be_in_future(client):
    t = datetime.now(pacific) - timedelta(days=1)
    t = t.replace(hour=18, minute=0, second=0, microsecond=0)
    r = make_game(client, starttime=t.isoformat())
    assert r.status_code == 422


def test_too_many_players_rejected(client):
    r = make_game(client, maxplayers=11)  # basketball max is 10
    assert r.status_code == 422


def test_host_required(client):
    r = make_game(client, host="")
    assert r.status_code == 422


def test_join_game(client):
    gameid = make_game(client).json()["id"]
    r = join(client, gameid, "alan")
    assert r.status_code == 200
    assert sorted(r.json()["players"]) == ["alan", "jonathan"]


def test_cant_join_twice(client):
    gameid = make_game(client).json()["id"]
    join(client, gameid, "alan")
    r = join(client, gameid, "alan")
    assert r.status_code == 400


def test_blank_name_rejected(client):
    gameid = make_game(client).json()["id"]
    r = join(client, gameid, "   ")
    assert r.status_code == 400


def test_full_game_rejects_join(client):
    gameid = make_game(client, maxplayers=2).json()["id"]  # host takes 1 spot
    join(client, gameid, "alan")
    r = join(client, gameid, "bob")
    assert r.status_code == 409


def test_leave_game(client):
    gameid = make_game(client).json()["id"]
    join(client, gameid, "alan")
    r = leave(client, gameid, "alan")
    assert r.status_code == 200
    assert r.json()["players"] == ["jonathan"]


def test_cant_leave_if_not_in_game(client):
    gameid = make_game(client).json()["id"]
    r = leave(client, gameid, "bob")
    assert r.status_code == 400


def test_host_cant_leave(client):
    gameid = make_game(client).json()["id"]
    r = leave(client, gameid, "jonathan")
    assert r.status_code == 400


def test_only_host_can_cancel(client):
    gameid = make_game(client).json()["id"]
    r = client.delete(f"/games/{gameid}", params={"playername": "alan"})
    assert r.status_code == 403


def test_host_can_cancel(client):
    gameid = make_game(client).json()["id"]
    r = client.delete(f"/games/{gameid}", params={"playername": "jonathan"})
    assert r.status_code == 204
    assert client.get(f"/games/{gameid}").status_code == 404


def test_only_host_can_edit(client):
    gameid = make_game(client).json()["id"]
    r = client.patch(f"/games/{gameid}", params={"playername": "alan"}, json={"maxplayers": 8})
    assert r.status_code == 403


def test_host_can_edit(client):
    gameid = make_game(client).json()["id"]
    r = client.patch(f"/games/{gameid}", params={"playername": "jonathan"}, json={"maxplayers": 8})
    assert r.status_code == 200
    assert r.json()["maxplayers"] == 8


def test_cant_lower_max_below_current_players(client):
    gameid = make_game(client, maxplayers=3).json()["id"]
    join(client, gameid, "alan")
    join(client, gameid, "bob")  # now 3 players
    r = client.patch(f"/games/{gameid}", params={"playername": "jonathan"}, json={"maxplayers": 2})
    assert r.status_code == 409


def test_edit_runs_same_checks_as_create(client):
    gameid = make_game(client).json()["id"]
    r = client.patch(f"/games/{gameid}", params={"playername": "jonathan"}, json={"location": "drake"})
    assert r.status_code == 422  # Drake has no basketball


def test_filter_by_location_any_casing(client):
    make_game(client)
    r = client.get("/games", params={"location": " Wooden "})
    assert len(r.json()) == 1


def test_filter_by_sport(client):
    make_game(client)
    make_game(client, sports="soccer", location="drake", maxplayers=22)
    r = client.get("/games", params={"sports": "soccer"})
    games = r.json()
    assert len(games) == 1
    assert games[0]["sports"] == "soccer"


def test_past_games_hidden_unless_asked(client, session_maker):
    # The API won't let us create a past game, so put one straight into the database
    db = session_maker()
    old = gameRow(
        id=uuid4(), sports="basketball", location="wooden",
        starttime=datetime.now(timezone.utc) - timedelta(days=1),
        maxplayers=10, skilllevel="all", host="jonathan",
    )
    old.players.append(playerRow(playername="jonathan"))
    db.add(old)
    db.commit()
    db.close()

    assert client.get("/games").json() == []
    assert len(client.get("/games", params={"include_past": True}).json()) == 1


def test_cant_join_game_that_started(client, session_maker):
    db = session_maker()
    old = gameRow(
        id=uuid4(), sports="basketball", location="wooden",
        starttime=datetime.now(timezone.utc) - timedelta(hours=1),
        maxplayers=10, skilllevel="all", host="jonathan",
    )
    db.add(old)
    db.commit()
    gameid = str(old.id)
    db.close()

    r = join(client, gameid, "alan")
    assert r.status_code == 400


def test_missing_game_is_404(client):
    r = client.get(f"/games/{uuid4()}")
    assert r.status_code == 404


def test_player_games_list(client):
    gameid = make_game(client).json()["id"]
    join(client, gameid, "alan")
    make_game(client, host="bob")
    r = client.get("/players/alan/games")
    assert len(r.json()) == 1