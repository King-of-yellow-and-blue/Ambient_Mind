from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from dotenv import load_dotenv
import os

load_dotenv()

import routes.auth
import routes.user
import routes.checkin
import routes.voice
import routes.risk
import routes.clinician
import routes.llm

app = FastAPI(title="AmbientMind Backend")

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(routes.auth.router)
app.include_router(routes.user.router)
app.include_router(routes.checkin.router)
app.include_router(routes.voice.router)
app.include_router(routes.risk.router)
app.include_router(routes.clinician.router)
app.include_router(routes.llm.router)

@app.get("/")
def read_root():
    return {"message": "AmbientMind API is running."}
