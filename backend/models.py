from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    boards = relationship("Board", back_populates="user", cascade="all, delete-orphan")

class Board(Base):
    __tablename__ = "boards"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="boards")
    lists = relationship("List", back_populates="board", cascade="all, delete-orphan", order_by="List.position")

class List(Base):
    __tablename__ = "lists"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    board_id = Column(String, ForeignKey("boards.id"), nullable=False)
    position = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    board = relationship("Board", back_populates="lists")
    cards = relationship("Card", back_populates="list", cascade="all, delete-orphan", order_by="Card.position")

class Card(Base):
    __tablename__ = "cards"
    
    id = Column(String, primary_key=True)
    content = Column(String, nullable=False)
    list_id = Column(String, ForeignKey("lists.id"), nullable=False)
    position = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    list = relationship("List", back_populates="cards")

