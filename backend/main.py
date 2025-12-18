from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from .database import engine, Base
from .routers import auth, boards, lists, cards

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kanban Board API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(boards.router, prefix="/api/boards", tags=["boards"])
app.include_router(lists.router, prefix="/api/lists", tags=["lists"])
app.include_router(cards.router, prefix="/api/cards", tags=["cards"])


@app.get("/")
def read_root():
    return {"message": "Kanban Board API"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
