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
| GET | `/games` | List upcoming games (filters: `sports`, `location`, `status`, `include_past`) |
| POST | `/games` | Create a game (creator becomes host) |
| GET | `/games/{gameid}` | Get one game |
| PATCH | `/games/{gameid}?playername=...` | Edit a game (host only) |
| DELETE | `/games/{gameid}?playername=...` | Cancel a game (host only) |
| POST | `/games/{gameid}/join?playername=...` | Join a game |
| DELETE | `/games/{gameid}/join?playername=...` | Leave a game |
| GET | `/players/{playername}/games` | Games a player has joined |
| GET | `/locations` | Valid locations and their sports |
| GET | `/sports` | Sports and their max player limits |

## Rules

- `host`: required when creating a game. The host is automatically added as a player and is the only one who can edit or cancel the game.
- `sports`: `"basketball"` or `"soccer"` (any casing, stored lowercase)
- `location`: must be a location **id** from `GET /locations`, and that location must support