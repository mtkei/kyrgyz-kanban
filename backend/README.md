# Kanban Board Backend API

FastAPI backend for the Kanban Board application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI) will be available at `http://localhost:8000/docs`

## Database

The application uses SQLite by default. The database file `kanban.db` will be created automatically on first run.

To use PostgreSQL instead, update `database.py`:
```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login
- `GET /api/me` - Get current user info

### Boards
- `GET /api/boards` - Get all boards for current user
- `GET /api/boards/{board_id}` - Get a specific board with lists and cards
- `POST /api/boards` - Create a new board
- `PUT /api/boards/{board_id}` - Update a board
- `DELETE /api/boards/{board_id}` - Delete a board

### Lists
- `POST /api/boards/{board_id}/lists` - Create a new list
- `PUT /api/lists/{list_id}` - Update a list
- `DELETE /api/lists/{list_id}` - Delete a list

### Cards
- `POST /api/lists/{list_id}/cards` - Create a new card
- `PUT /api/cards/{card_id}` - Update a card
- `DELETE /api/cards/{card_id}` - Delete a card
- `PUT /api/cards/{card_id}/move` - Move a card to a different list/position

## Authentication

All endpoints except `/api/register` and `/api/login` require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

