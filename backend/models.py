from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, nullable=False)
    email = Column(String(128), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    reports = relationship("CitizenReport", back_populates="user")
    comments = relationship("Comment", back_populates="user")

class SearchHistory(Base):
    __tablename__ = "search_history"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    city = Column(String(128))
    state = Column(String(128))
    pollution_type = Column(String(32))
    index_value = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class CitizenReport(Base):
    __tablename__ = "citizen_reports"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    pollution_type = Column(String(32))
    city = Column(String(128))
    state = Column(String(128))
    description = Column(Text)
    photo_url = Column(Text, nullable=True)  # base64 stored here
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="reports")
    comments = relationship("Comment", back_populates="report")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey("citizen_reports.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    report = relationship("CitizenReport", back_populates="comments")
    user = relationship("User", back_populates="comments")