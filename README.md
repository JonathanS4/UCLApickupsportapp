# UCLApickupsportapp

# Pickupsports APP Backend Running

##Setup
```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
fastapi dev app/main.py
```
Interactive docs: http://127.0.0.1:8000/docs


## Rules
- `sports`: "basketball" or "soccer" (any casing, stored lowercase)
- `maxplayers`: min 2; basketball max 10, soccer max 22
- `skilllevel`: "beginner", "intermediate", "advanced", or "all"
- `starttime`: must be in the future and on a 15-minute mark (:00/:15/:30/:45). Times without a time zone are treated as Pacific.
- Query param for players is `playername` (no underscore)

## Response extras
Every game includes `id`, `players`, `spotsremaining`, and `status` ("open", "almost full", "full").

## Errors
- 404: game not found
- 400: already joined / not in game
- 409: game is full
- 422: invalid input (message in `detail`)

## Note
Data is stored in memory for now. Restarting the server wipes all games.