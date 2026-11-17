# UCLA Pickup Sports App — Backend

FastAPI backend for organizing pickup basketball and soccer games at UCLA.

## Setup

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
fastapi dev app/main.py
```

Interactive docs: http://127.0.0.1:8000/docs

## Endpoints

| Method | Path | What it does |
|--------|------|--------------|
| GET | `/games` | List games (filters: `sports`, `location`, `status`) |
| POST | `/games` | Create a game |
| GET | `/games/{gameid}` | Get one game |
| PATCH | `/games/{gameid}` | Edit a game |
| DELETE | `/games/{gameid}` | Cancel a game |
| POST | `/games/{gameid}/join?playername=...` | Join a game |
| DELETE | `/games/{gameid}/join?playername=...` | Leave a game |
| GET | `/players/{playername}/games` | Games a player has joined |
| GET | `/locations` | Valid locations and their sports |
| GET | `/sports` | Sports and their max player limits |

## Rules

- `sports`: `"basketball"` or `"soccer"` (any casing, stored lowercase)
- `location`: must be a location **id** from `GET /locations`, and that location must support the sport (see table below). Any casing; extra spaces are trimmed.
- `maxplayers`: min 2; basketball max 10, soccer max 22. Can't be lowered below the number of players already joined.
- `skilllevel`: `"beginner"`, `"intermediate"`, `"advanced"`, or `"all"` (default `"all"`)
- `starttime`: must be in the future and on a 15-minute mark (:00/:15/:30/:45). Times without a time zone are treated as Pacific.
- Query param for players is `playername` (no underscore). Names can't be blank.
- You can't join a game that has already started.

### Locations

| id | Name | Sports |
|----|------|--------|
| `wooden` | John Wooden Center | basketball |
| `drake` | Drake Stadium | soccer |
| `sunset` | Sunset Canyon Rec Center | basketball, soccer |
| `hitch` | Hitch Basketball Courts | basketball |
| `sycamore` | Sycamore Park | basketball, soccer |

## Response extras

Every game includes `id`, `players`, `spotsremaining`, and `status` (`"open"`, `"almost full"` when 3 or fewer spots remain, `"full"`).

## Errors

- **404**: game not found
- **400**: already joined, not in game, blank player name, or game already started
- **409**: game is full, or max players set below current player count
- **422**: invalid input (message in `detail`)

## Data

Games and players are stored in a database via SQLAlchemy (see `app/db.py`), so they persist across server restarts.