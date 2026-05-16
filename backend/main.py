# import os, math, random, httpx
# from datetime import datetime, timedelta
# from typing import Optional, List

# from fastapi import FastAPI, HTTPException, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
# from sqlalchemy import select, desc

# from dotenv import load_dotenv

# from models import Base, User, SearchHistory, CitizenReport, Comment

# load_dotenv()

# DATABASE_URL = os.environ["DATABASE_URL"]
# OWM_KEY = os.environ["OWM_API_KEY"]
# OWM_BASE = "https://api.openweathermap.org"

# app = FastAPI(title="PollutionWatch API")
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# engine = create_async_engine(DATABASE_URL, echo=False)
# SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
# import bcrypt

# def hash_password(password: str) -> str:
#     return bcrypt.hashpw(password[:72].encode(), bcrypt.gensalt()).decode()

# def verify_password(password: str, hashed: str) -> bool:
#     return bcrypt.checkpw(password[:72].encode(), hashed.encode())

# @app.on_event("startup")
# async def startup():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)

# async def get_db():
#     async with SessionLocal() as session:
#         yield session

# # ── OWM Helpers ────────────────────────────────────────────────────────────────

# async def owm_geo(city: str):
#     async with httpx.AsyncClient(timeout=10) as c:
#         r = await c.get(f"{OWM_BASE}/geo/1.0/direct", params={"q": f"{city},IN", "limit": 1, "appid": OWM_KEY})
#         data = r.json()
#         if not data:
#             raise HTTPException(404, f"City not found: {city}")
#         return data[0]["lat"], data[0]["lon"]

# async def owm_weather(lat: float, lon: float):
#     async with httpx.AsyncClient(timeout=10) as c:
#         r = await c.get(f"{OWM_BASE}/data/2.5/weather", params={"lat": lat, "lon": lon, "appid": OWM_KEY, "units": "metric"})
#         return r.json()

# async def owm_air(lat: float, lon: float):
#     async with httpx.AsyncClient(timeout=10) as c:
#         r = await c.get(f"{OWM_BASE}/data/2.5/air_pollution", params={"lat": lat, "lon": lon, "appid": OWM_KEY})
#         return r.json()

# async def owm_air_history(lat: float, lon: float, days: int = 7):
#     start = int((datetime.utcnow() - timedelta(days=days)).timestamp())
#     end = int(datetime.utcnow().timestamp())
#     async with httpx.AsyncClient(timeout=10) as c:
#         r = await c.get(f"{OWM_BASE}/data/2.5/air_pollution/history", params={"lat": lat, "lon": lon, "start": start, "end": end, "appid": OWM_KEY})
#         return r.json()

# # def owm_aqi_to_us(owm_aqi: int) -> int:
# #     # OWM AQI 1-5 → approximate US AQI
# #     mapping = {1: 25, 2: 75, 3: 125, 4: 175, 5: 275}
# #     return mapping.get(owm_aqi, 100)




# # REPLACE WITH THIS:
# def calc_us_aqi(pm25: float, pm10: float, o3: float, no2: float, so2: float, co: float) -> int:
#     def linear(aqi_hi, aqi_lo, conc_hi, conc_lo, c):
#         return round(((aqi_hi - aqi_lo) / (conc_hi - conc_lo)) * (c - conc_lo) + aqi_lo)

#     def aqi_pm25(c):
#         c = round(c, 1)
#         if c <= 0:    return 0
#         elif c <= 12.0:   return linear(50, 0, 12.0, 0.0, c)
#         elif c <= 35.4:   return linear(100, 51, 35.4, 12.1, c)
#         elif c <= 55.4:   return linear(150, 101, 55.4, 35.5, c)
#         elif c <= 150.4:  return linear(200, 151, 150.4, 55.5, c)
#         elif c <= 250.4:  return linear(300, 201, 250.4, 150.5, c)
#         elif c <= 350.4:  return linear(400, 301, 350.4, 250.5, c)
#         else:             return linear(500, 401, 500.4, 350.5, c)

#     def aqi_pm10(c):
#         c = int(c)
#         if c <= 0:  return 0
#         elif c <= 54:   return linear(50, 0, 54, 0, c)
#         elif c <= 154:  return linear(100, 51, 154, 55, c)
#         elif c <= 254:  return linear(150, 101, 254, 155, c)
#         elif c <= 354:  return linear(200, 151, 354, 255, c)
#         elif c <= 424:  return linear(300, 201, 424, 355, c)
#         elif c <= 504:  return linear(400, 301, 504, 425, c)
#         else:           return linear(500, 401, 604, 505, c)

#     def aqi_o3(c):
#         c = c / 1.96
#         c = round(c, 3)
#         if c <= 0:   return 0
#         elif c <= 54:    return linear(50, 0, 54, 0, c)
#         elif c <= 70:    return linear(100, 51, 70, 55, c)
#         elif c <= 85:    return linear(150, 101, 85, 71, c)
#         elif c <= 105:   return linear(200, 151, 105, 86, c)
#         elif c <= 200:   return linear(300, 201, 200, 106, c)
#         else:            return 300

#     def aqi_no2(c):
#         c = c / 1.88
#         c = round(c, 3)
#         if c <= 0:   return 0
#         elif c <= 53:    return linear(50, 0, 53, 0, c)
#         elif c <= 100:   return linear(100, 51, 100, 54, c)
#         elif c <= 360:   return linear(150, 101, 360, 101, c)
#         elif c <= 649:   return linear(200, 151, 649, 361, c)
#         elif c <= 1249:  return linear(300, 201, 1249, 650, c)
#         elif c <= 1649:  return linear(400, 301, 1649, 1250, c)
#         else:            return linear(500, 401, 2049, 1650, c)

#     def aqi_co(c):
#         c = c / 1145
#         c = round(c, 1)
#         if c <= 0:   return 0
#         elif c <= 4.4:   return linear(50, 0, 4.4, 0, c)
#         elif c <= 9.4:   return linear(100, 51, 9.4, 4.5, c)
#         elif c <= 12.4:  return linear(150, 101, 12.4, 9.5, c)
#         elif c <= 15.4:  return linear(200, 151, 15.4, 12.5, c)
#         elif c <= 30.4:  return linear(300, 201, 30.4, 15.5, c)
#         elif c <= 40.4:  return linear(400, 301, 40.4, 30.5, c)
#         else:            return linear(500, 401, 50.4, 40.5, c)

#     aqis = [aqi_pm25(pm25), aqi_pm10(pm10), aqi_o3(o3), aqi_no2(no2), aqi_co(co)]
#     return max(aqis)

# # ── Air Endpoints ──────────────────────────────────────────────────────────────

# @app.get("/api/air/search")
# async def air_search(city: str, state: str, db: AsyncSession = Depends(get_db)):
#     lat, lon = await owm_geo(city)
#     weather = await owm_weather(lat, lon)
#     air = await owm_air(lat, lon)

#     comp = air["list"][0]["components"]
#     owm_aqi = air["list"][0]["main"]["aqi"]
#     us_aqi = owm_aqi_to_us(owm_aqi)

#     result = {
#         "city": city, "state": state, "lat": lat, "lon": lon,
#         "aqi": us_aqi,
#         "temp": round(weather["main"]["temp"], 1),
#         "humidity": weather["main"]["humidity"],
#         "wind": round(weather["wind"]["speed"], 1),
#         "description": weather["weather"][0]["description"].title(),
#         "pm25": round(comp.get("pm2_5", 0), 2),
#         "pm10": round(comp.get("pm10", 0), 2),
#         "co": round(comp.get("co", 0), 2),
#         "no2": round(comp.get("no2", 0), 2),
#         "o3": round(comp.get("o3", 0), 2),
#         "so2": round(comp.get("so2", 0), 2),
#         "nh3": round(comp.get("nh3", 0), 2),
#     }

#     # Save to search history
#     db.add(SearchHistory(city=city, state=state, pollution_type="air", index_value=us_aqi))
#     await db.commit()
#     return result

# @app.get("/api/air/history")
# async def air_history(city: str, days: int = 7):
#     lat, lon = await owm_geo(city)
#     hist = await owm_air_history(lat, lon, days)
    
#     # Aggregate by day
#     daily = {}
#     for item in hist.get("list", []):
#         date = datetime.fromtimestamp(item["dt"]).strftime("%b %d")
        
#         comp = item.get("components", {})
#     aqi_val = calc_us_aqi(
#     pm25=comp.get("pm2_5", 0),
#     pm10=comp.get("pm10", 0),
#     o3=comp.get("o3", 0),
#     no2=comp.get("no2", 0),
#     so2=comp.get("so2", 0),
#     co=comp.get("co", 0)
# )
        
#     if date not in daily:
#             daily[date] = []
#     daily[date].append(aqi_val)
    
#     result = [{"date": d, "aqi": round(sum(v)/len(v))} for d, v in daily.items()]
#     return result[-7:]

# @app.get("/api/air/heatmap")
# async def air_heatmap(city: str):
#     lat, lon = await owm_geo(city)
#     air = await owm_air(lat, lon)
#     center_aqi = owm_aqi_to_us(air["list"][0]["main"]["aqi"])
    
#     # Generate surrounding points with slight variation
#     offsets = [
#         (0.08, 0.08), (-0.08, 0.08), (0.08, -0.08), (-0.08, -0.08),
#         (0.15, 0), (-0.15, 0), (0, 0.15), (0, -0.15),
#         (0.05, 0.12), (-0.12, 0.05)
#     ]
#     points = [{"lat": lat, "lon": lon, "aqi": center_aqi, "name": city}]
#     for i, (dlat, dlon) in enumerate(offsets):
#         variation = random.randint(-30, 40)
#         aqi = max(10, min(300, center_aqi + variation))
#         points.append({"lat": lat + dlat, "lon": lon + dlon, "aqi": aqi, "name": f"Zone {i+1}"})
    
#     return {"center": {"lat": lat, "lon": lon}, "points": points}

# @app.get("/api/air/top5")
# async def air_top5(state: str):
#     STATE_CITIES = {
#         "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad"],
#         "Delhi": ["New Delhi","Central Delhi","North Delhi","South Delhi","East Delhi"],
#         "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Meerut"],
#         "West Bengal": ["Kolkata","Howrah","Durgapur","Asansol","Siliguri"],
#         "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem"],
#         "Karnataka": ["Bangalore","Mysore","Hubli","Mangalore","Belgaum"],
#         "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar"],
#         "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer"],
#         "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain"],
#         "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia"],
#     }
#     cities = STATE_CITIES.get(state, ["City A","City B","City C","City D","City E"])
    
#     results = []
#     for city in cities[:5]:
#         try:
#             lat, lon = await owm_geo(city)
#             air = await owm_air(lat, lon)
#             aqi = owm_aqi_to_us(air["list"][0]["main"]["aqi"])
#             results.append({"city": city, "state": state, "aqi": aqi, "lat": lat, "lon": lon})
#         except:
#             results.append({"city": city, "state": state, "aqi": random.randint(80, 200)})
    
#     results.sort(key=lambda x: x["aqi"], reverse=True)
#     return results

# # ── Water Endpoints ────────────────────────────────────────────────────────────

# def simulate_wqi(humidity: float, rainfall: float, temp: float, city: str) -> dict:
#     seed = sum(ord(c) for c in city)
#     random.seed(seed)
#     base = 40 + (humidity * 0.3) + (max(0, 30 - temp) * 0.5)
#     base = min(95, max(20, base + random.randint(-10, 10)))
#     wqi = round(base)
#     return {
#         "wqi": wqi,
#         "bacteria": round(max(0, (100 - wqi) * 0.8 + random.uniform(0, 20)), 1),
#         "nitrates": round(max(0, (100 - wqi) * 0.3 + random.uniform(0, 10)), 1),
#         "heavy_metals": round(max(0, (100 - wqi) * 0.06 + random.uniform(0, 2)), 2),
#         "turbidity": round(max(0, (100 - wqi) * 0.6 + random.uniform(0, 15)), 1),
#         "bod": round(max(0, (100 - wqi) * 0.2 + random.uniform(0, 5)), 1),
#         "trend": [
#             {"date": (datetime.utcnow() - timedelta(days=6-i)).strftime("%b %d"),
#              "wqi": max(20, min(95, wqi + random.randint(-8, 8)))}
#             for i in range(7)
#         ]
#     }

# @app.get("/api/water/search")
# async def water_search(city: str, state: str):
#     lat, lon = await owm_geo(city)
#     weather = await owm_weather(lat, lon)
#     humidity = weather["main"]["humidity"]
#     temp = weather["main"]["temp"]
#     rainfall = weather.get("rain", {}).get("1h", 0) * 24
#     wqi_data = simulate_wqi(humidity, rainfall, temp, city)
#     return {
#         "city": city, "state": state,
#         "humidity": humidity, "temp": round(temp, 1), "rainfall": round(rainfall, 1),
#         **wqi_data,
#         "note": "Water Quality Index is estimated from meteorological data. Not a substitute for lab testing."
#     }

# @app.get("/api/water/top5")
# async def water_top5(state: str):
#     water_bodies = [
#         {"name": "Ganga River", "type": "River"},
#         {"name": "Local Lake", "type": "Lake"},
#         {"name": "Industrial Canal", "type": "Canal"},
#         {"name": "Municipal Reservoir", "type": "Reservoir"},
#         {"name": "Urban Pond", "type": "Pond"},
#     ]
#     random.seed(sum(ord(c) for c in state))
#     for wb in water_bodies:
#         wb["wqi"] = random.randint(20, 65)
#         wb["state"] = state
#     water_bodies.sort(key=lambda x: x["wqi"])
#     return water_bodies

# # ── Soil Endpoints ─────────────────────────────────────────────────────────────

# def simulate_shi(city: str, state: str) -> dict:
#     seed = sum(ord(c) for c in city + state)
#     random.seed(seed)
    
#     industrial_states = ["Maharashtra", "Gujarat", "Tamil Nadu", "West Bengal", "Jharkhand"]
#     agri_states = ["Punjab", "Haryana", "Uttar Pradesh", "Bihar", "Andhra Pradesh"]
    
#     if state in industrial_states:
#         base_shi = random.randint(30, 60)
#         industrial_risk = random.randint(40, 80)
#         agri_type = "Mixed"
#     elif state in agri_states:
#         base_shi = random.randint(45, 75)
#         industrial_risk = random.randint(10, 30)
#         agri_type = "Agricultural"
#     else:
#         base_shi = random.randint(55, 85)
#         industrial_risk = random.randint(5, 25)
#         agri_type = "Forest/Mixed"
    
#     shi = base_shi
#     return {
#         "shi": shi,
#         "agri_type": agri_type,
#         "industrial_risk": industrial_risk,
#         "organic_matter": round(random.uniform(0.5, 4.5), 1),
#         "pesticides": max(0, 100 - shi + random.randint(-10, 20)),
#         "heavy_metals": max(0, industrial_risk // 2 + random.randint(0, 15)),
#         "plastic_waste": random.randint(10, 60),
#         "acidification": random.randint(10, 70),
#         "erosion_risk": random.randint(15, 75),
#         "trend": [
#             {"date": (datetime.utcnow() - timedelta(days=30*(5-i))).strftime("%b"),
#              "shi": max(20, min(95, shi + random.randint(-5, 5)))}
#             for i in range(6)
#         ],
#         "note": "Soil Health Index is estimated from agricultural and industrial patterns. Not a substitute for lab testing."
#     }

# @app.get("/api/soil/search")
# async def soil_search(city: str, state: str):
#     data = simulate_shi(city, state)
#     return {"city": city, "state": state, **data}

# @app.get("/api/soil/top5")
# async def soil_top5(state: str):
#     districts = ["District A","District B","District C","District D","District E"]
#     reasons = ["Heavy industrial activity","Excessive pesticide use","Mining operations","Urban waste dumping","Chemical runoff"]
#     random.seed(sum(ord(c) for c in state))
#     result = []
#     for i, d in enumerate(districts):
#         result.append({
#             "district": d, "state": state,
#             "shi": random.randint(20, 55),
#             "reason": reasons[i]
#         })
#     result.sort(key=lambda x: x["shi"])
#     return result

# # ── Alerts ─────────────────────────────────────────────────────────────────────

# @app.get("/api/alerts")
# async def get_alerts():
#     cities = ["Mumbai","Delhi","Chennai","Kolkata","Bangalore"]
#     alerts = []
#     for city in cities:
#         try:
#             lat, lon = await owm_geo(city)
#             weather = await owm_weather(lat, lon)
#             air = await owm_air(lat, lon)
#             aqi = owm_aqi_to_us(air["list"][0]["main"]["aqi"])
#             alerts.append({
#                 "city": city,
#                 "temp": round(weather["main"]["temp"], 1),
#                 "humidity": weather["main"]["humidity"],
#                 "wind": round(weather["wind"]["speed"], 1),
#                 "description": weather["weather"][0]["description"].title(),
#                 "aqi": aqi
#             })
#         except Exception as e:
#             alerts.append({"city": city, "temp": "N/A", "humidity": "N/A", "wind": "N/A", "description": "Data unavailable", "aqi": "N/A"})
#     return alerts

# # ── Auth ───────────────────────────────────────────────────────────────────────

# class SignupBody(BaseModel):
#     username: str
#     email: str
#     password: str

# class LoginBody(BaseModel):
#     email: str
#     password: str

# @app.post("/api/auth/signup")
# async def signup(body: SignupBody, db: AsyncSession = Depends(get_db)):
#     try:
#         existing = await db.execute(select(User).where(User.email == body.email))
#         if existing.scalar():
#             raise HTTPException(400, detail="Email already registered")

#         existing_user = await db.execute(select(User).where(User.username == body.username))
#         if existing_user.scalar():
#             raise HTTPException(400, detail="Username already taken")

#         user = User(
#             username=body.username,
#             email=body.email,
#             password_hash=hash_password(body.password)
#         )
#         db.add(user)
#         await db.commit()
#         await db.refresh(user)
#         return {"id": user.id, "username": user.username, "email": user.email}

#     except HTTPException:
#         raise
#     except Exception as e:
#         await db.rollback()
#         raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")



# @app.post("/api/auth/login")
# async def login(body: LoginBody, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(User).where(User.email == body.email))
#     user = result.scalar()
#     if not user or not verify_password(body.password, user.password_hash):
#         raise HTTPException(401, "Invalid credentials")
#     return {"id": user.id, "username": user.username, "email": user.email}

# # ── Reports ────────────────────────────────────────────────────────────────────

# class ReportBody(BaseModel):
#     pollution_type: str
#     city: str
#     state: str
#     description: str
#     photo_base64: Optional[str] = None
#     user_id: Optional[int] = None

# class CommentBody(BaseModel):
#     report_id: int
#     text: str
#     user_id: Optional[int] = None

# @app.post("/api/reports/citizen")
# async def create_report(body: ReportBody, db: AsyncSession = Depends(get_db)):
#     report = CitizenReport(
#         user_id=body.user_id,
#         pollution_type=body.pollution_type,
#         city=body.city,
#         state=body.state,
#         description=body.description,
#         photo_url=body.photo_base64
#     )
#     db.add(report)
#     await db.commit()
#     await db.refresh(report)
#     return {"id": report.id, "message": "Report submitted successfully"}

# @app.get("/api/reports/citizen")
# async def get_reports(pollution_type: Optional[str] = None, db: AsyncSession = Depends(get_db)):
#     q = select(CitizenReport)
#     if pollution_type:
#         q = q.where(CitizenReport.pollution_type == pollution_type)
#     q = q.order_by(desc(CitizenReport.created_at)).limit(20)
#     result = await db.execute(q)
#     reports = result.scalars().all()
#     return [
#         {
#             "id": r.id, "city": r.city, "state": r.state,
#             "description": r.description, "photo_url": r.photo_url,
#             "created_at": r.created_at.isoformat(), "pollution_type": r.pollution_type
#         }
#         for r in reports
#     ]

# @app.post("/api/reports/comment")
# async def post_comment(body: CommentBody, db: AsyncSession = Depends(get_db)):
#     comment = Comment(report_id=body.report_id, user_id=body.user_id, text=body.text)
#     db.add(comment)
#     await db.commit()
#     return {"message": "Comment posted"}

# @app.get("/api/reports/comments")
# async def get_comments(report_id: int, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(
#         select(Comment).where(Comment.report_id == report_id).order_by(Comment.created_at)
#     )
#     comments = result.scalars().all()
#     return [{"id": c.id, "text": c.text, "created_at": c.created_at.isoformat()} for c in comments]











import os, math, random, httpx
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, desc
from dotenv import load_dotenv
from models import Base, User, SearchHistory, CitizenReport, Comment

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
OWM_KEY = os.environ["OWM_API_KEY"]
OWM_BASE = "https://api.openweathermap.org"

app = FastAPI(title="PollutionWatch API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://stalwart-bunny-884ada.netlify.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password[:72].encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password[:72].encode(), hashed.encode())

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with SessionLocal() as session:
        yield session

# ── OWM Helpers ────────────────────────────────────────────────────────────────

async def owm_geo(city: str):
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{OWM_BASE}/geo/1.0/direct", params={"q": f"{city},IN", "limit": 1, "appid": OWM_KEY})
        data = r.json()
        if not data:
            raise HTTPException(404, f"City not found: {city}")
        return data[0]["lat"], data[0]["lon"]

async def owm_weather(lat: float, lon: float):
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{OWM_BASE}/data/2.5/weather", params={"lat": lat, "lon": lon, "appid": OWM_KEY, "units": "metric"})
        return r.json()

async def owm_air(lat: float, lon: float):
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{OWM_BASE}/data/2.5/air_pollution", params={"lat": lat, "lon": lon, "appid": OWM_KEY})
        return r.json()

async def owm_air_history(lat: float, lon: float, days: int = 7):
    start = int((datetime.utcnow() - timedelta(days=days)).timestamp())
    end = int(datetime.utcnow().timestamp())
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{OWM_BASE}/data/2.5/air_pollution/history", params={"lat": lat, "lon": lon, "start": start, "end": end, "appid": OWM_KEY})
        return r.json()

def calc_us_aqi(pm25: float, pm10: float, o3: float, no2: float, so2: float, co: float) -> int:
    def linear(aqi_hi, aqi_lo, conc_hi, conc_lo, c):
        return round(((aqi_hi - aqi_lo) / (conc_hi - conc_lo)) * (c - conc_lo) + aqi_lo)

    def aqi_pm25(c):
        c = round(c, 1)
        if c <= 0:        return 0
        elif c <= 12.0:   return linear(50, 0, 12.0, 0.0, c)
        elif c <= 35.4:   return linear(100, 51, 35.4, 12.1, c)
        elif c <= 55.4:   return linear(150, 101, 55.4, 35.5, c)
        elif c <= 150.4:  return linear(200, 151, 150.4, 55.5, c)
        elif c <= 250.4:  return linear(300, 201, 250.4, 150.5, c)
        elif c <= 350.4:  return linear(400, 301, 350.4, 250.5, c)
        else:             return linear(500, 401, 500.4, 350.5, c)

    def aqi_pm10(c):
        c = int(c)
        if c <= 0:      return 0
        elif c <= 54:   return linear(50, 0, 54, 0, c)
        elif c <= 154:  return linear(100, 51, 154, 55, c)
        elif c <= 254:  return linear(150, 101, 254, 155, c)
        elif c <= 354:  return linear(200, 151, 354, 255, c)
        elif c <= 424:  return linear(300, 201, 424, 355, c)
        elif c <= 504:  return linear(400, 301, 504, 425, c)
        else:           return linear(500, 401, 604, 505, c)

    def aqi_o3(c):
        c = c / 1.96
        c = round(c, 3)
        if c <= 0:       return 0
        elif c <= 54:    return linear(50, 0, 54, 0, c)
        elif c <= 70:    return linear(100, 51, 70, 55, c)
        elif c <= 85:    return linear(150, 101, 85, 71, c)
        elif c <= 105:   return linear(200, 151, 105, 86, c)
        elif c <= 200:   return linear(300, 201, 200, 106, c)
        else:            return 300

    def aqi_no2(c):
        c = c / 1.88
        c = round(c, 3)
        if c <= 0:       return 0
        elif c <= 53:    return linear(50, 0, 53, 0, c)
        elif c <= 100:   return linear(100, 51, 100, 54, c)
        elif c <= 360:   return linear(150, 101, 360, 101, c)
        elif c <= 649:   return linear(200, 151, 649, 361, c)
        elif c <= 1249:  return linear(300, 201, 1249, 650, c)
        elif c <= 1649:  return linear(400, 301, 1649, 1250, c)
        else:            return linear(500, 401, 2049, 1650, c)

    def aqi_co(c):
        c = c / 1145
        c = round(c, 1)
        if c <= 0:       return 0
        elif c <= 4.4:   return linear(50, 0, 4.4, 0, c)
        elif c <= 9.4:   return linear(100, 51, 9.4, 4.5, c)
        elif c <= 12.4:  return linear(150, 101, 12.4, 9.5, c)
        elif c <= 15.4:  return linear(200, 151, 15.4, 12.5, c)
        elif c <= 30.4:  return linear(300, 201, 30.4, 15.5, c)
        elif c <= 40.4:  return linear(400, 301, 40.4, 30.5, c)
        else:            return linear(500, 401, 50.4, 40.5, c)

    aqis = [aqi_pm25(pm25), aqi_pm10(pm10), aqi_o3(o3), aqi_no2(no2), aqi_co(co)]
    return max(aqis)

# ── Air Endpoints ──────────────────────────────────────────────────────────────

@app.get("/api/air/search")
async def air_search(city: str, state: str, db: AsyncSession = Depends(get_db)):
    lat, lon = await owm_geo(city)
    weather = await owm_weather(lat, lon)
    air = await owm_air(lat, lon)

    comp = air["list"][0]["components"]
    us_aqi = calc_us_aqi(
        pm25=comp.get("pm2_5", 0),
        pm10=comp.get("pm10", 0),
        o3=comp.get("o3", 0),
        no2=comp.get("no2", 0),
        so2=comp.get("so2", 0),
        co=comp.get("co", 0)
    )

    result = {
        "city": city, "state": state, "lat": lat, "lon": lon,
        "aqi": us_aqi,
        "temp": round(weather["main"]["temp"], 1),
        "humidity": weather["main"]["humidity"],
        "wind": round(weather["wind"]["speed"], 1),
        "description": weather["weather"][0]["description"].title(),
        "pm25": round(comp.get("pm2_5", 0), 2),
        "pm10": round(comp.get("pm10", 0), 2),
        "co": round(comp.get("co", 0), 2),
        "no2": round(comp.get("no2", 0), 2),
        "o3": round(comp.get("o3", 0), 2),
        "so2": round(comp.get("so2", 0), 2),
        "nh3": round(comp.get("nh3", 0), 2),
    }

    db.add(SearchHistory(city=city, state=state, pollution_type="air", index_value=us_aqi))
    await db.commit()
    return result

@app.get("/api/air/history")
async def air_history(city: str, days: int = 7):
    lat, lon = await owm_geo(city)
    hist = await owm_air_history(lat, lon, days)

    daily = {}
    for item in hist.get("list", []):
        date = datetime.fromtimestamp(item["dt"]).strftime("%b %d")
        comp = item.get("components", {})
        aqi_val = calc_us_aqi(
            pm25=comp.get("pm2_5", 0),
            pm10=comp.get("pm10", 0),
            o3=comp.get("o3", 0),
            no2=comp.get("no2", 0),
            so2=comp.get("so2", 0),
            co=comp.get("co", 0)
        )
        if date not in daily:
            daily[date] = []
        daily[date].append(aqi_val)

    result = [{"date": d, "aqi": round(sum(v)/len(v))} for d, v in daily.items()]
    return result[-7:]

@app.get("/api/air/heatmap")
async def air_heatmap(city: str):
    lat, lon = await owm_geo(city)
    air = await owm_air(lat, lon)
    comp = air["list"][0]["components"]
    center_aqi = calc_us_aqi(
        pm25=comp.get("pm2_5", 0),
        pm10=comp.get("pm10", 0),
        o3=comp.get("o3", 0),
        no2=comp.get("no2", 0),
        so2=comp.get("so2", 0),
        co=comp.get("co", 0)
    )

    offsets = [
        (0.08, 0.08), (-0.08, 0.08), (0.08, -0.08), (-0.08, -0.08),
        (0.15, 0), (-0.15, 0), (0, 0.15), (0, -0.15),
        (0.05, 0.12), (-0.12, 0.05)
    ]
    points = [{"lat": lat, "lon": lon, "aqi": center_aqi, "name": city}]
    for i, (dlat, dlon) in enumerate(offsets):
        variation = random.randint(-30, 40)
        aqi = max(10, min(300, center_aqi + variation))
        points.append({"lat": lat + dlat, "lon": lon + dlon, "aqi": aqi, "name": f"Zone {i+1}"})

    return {"center": {"lat": lat, "lon": lon}, "points": points}

@app.get("/api/air/top5")
async def air_top5(state: str):
    STATE_CITIES = {
        "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad"],
        "Delhi": ["New Delhi","Central Delhi","North Delhi","South Delhi","East Delhi"],
        "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Meerut"],
        "West Bengal": ["Kolkata","Howrah","Durgapur","Asansol","Siliguri"],
        "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem"],
        "Karnataka": ["Bangalore","Mysore","Hubli","Mangalore","Belgaum"],
        "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar"],
        "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer"],
        "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain"],
        "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia"],
    }
    cities = STATE_CITIES.get(state, ["City A","City B","City C","City D","City E"])

    results = []
    for city in cities[:5]:
        try:
            lat, lon = await owm_geo(city)
            air = await owm_air(lat, lon)
            comp = air["list"][0]["components"]
            aqi = calc_us_aqi(
                pm25=comp.get("pm2_5", 0),
                pm10=comp.get("pm10", 0),
                o3=comp.get("o3", 0),
                no2=comp.get("no2", 0),
                so2=comp.get("so2", 0),
                co=comp.get("co", 0)
            )
            results.append({"city": city, "state": state, "aqi": aqi, "lat": lat, "lon": lon})
        except:
            results.append({"city": city, "state": state, "aqi": random.randint(80, 200)})

    results.sort(key=lambda x: x["aqi"], reverse=True)
    return results

# ── Water Endpoints ────────────────────────────────────────────────────────────

def simulate_wqi(humidity: float, rainfall: float, temp: float, city: str) -> dict:
    seed = sum(ord(c) for c in city)
    random.seed(seed)
    base = 40 + (humidity * 0.3) + (max(0, 30 - temp) * 0.5)
    base = min(95, max(20, base + random.randint(-10, 10)))
    wqi = round(base)
    return {
        "wqi": wqi,
        "bacteria": round(max(0, (100 - wqi) * 0.8 + random.uniform(0, 20)), 1),
        "nitrates": round(max(0, (100 - wqi) * 0.3 + random.uniform(0, 10)), 1),
        "heavy_metals": round(max(0, (100 - wqi) * 0.06 + random.uniform(0, 2)), 2),
        "turbidity": round(max(0, (100 - wqi) * 0.6 + random.uniform(0, 15)), 1),
        "bod": round(max(0, (100 - wqi) * 0.2 + random.uniform(0, 5)), 1),
        "trend": [
            {"date": (datetime.utcnow() - timedelta(days=6-i)).strftime("%b %d"),
             "wqi": max(20, min(95, wqi + random.randint(-8, 8)))}
            for i in range(7)
        ]
    }

@app.get("/api/water/search")
async def water_search(city: str, state: str):
    lat, lon = await owm_geo(city)
    weather = await owm_weather(lat, lon)
    humidity = weather["main"]["humidity"]
    temp = weather["main"]["temp"]
    rainfall = weather.get("rain", {}).get("1h", 0) * 24
    wqi_data = simulate_wqi(humidity, rainfall, temp, city)
    return {
        "city": city, "state": state,
        "humidity": humidity, "temp": round(temp, 1), "rainfall": round(rainfall, 1),
        **wqi_data,
        "note": "Water Quality Index is estimated from meteorological data. Not a substitute for lab testing."
    }

@app.get("/api/water/top5")
async def water_top5(state: str):
    water_bodies = [
        {"name": "Ganga River", "type": "River"},
        {"name": "Local Lake", "type": "Lake"},
        {"name": "Industrial Canal", "type": "Canal"},
        {"name": "Municipal Reservoir", "type": "Reservoir"},
        {"name": "Urban Pond", "type": "Pond"},
    ]
    random.seed(sum(ord(c) for c in state))
    for wb in water_bodies:
        wb["wqi"] = random.randint(20, 65)
        wb["state"] = state
    water_bodies.sort(key=lambda x: x["wqi"])
    return water_bodies

# ── Soil Endpoints ─────────────────────────────────────────────────────────────

def simulate_shi(city: str, state: str) -> dict:
    seed = sum(ord(c) for c in city + state)
    random.seed(seed)

    industrial_states = ["Maharashtra", "Gujarat", "Tamil Nadu", "West Bengal", "Jharkhand"]
    agri_states = ["Punjab", "Haryana", "Uttar Pradesh", "Bihar", "Andhra Pradesh"]

    if state in industrial_states:
        base_shi = random.randint(30, 60)
        industrial_risk = random.randint(40, 80)
        agri_type = "Mixed"
    elif state in agri_states:
        base_shi = random.randint(45, 75)
        industrial_risk = random.randint(10, 30)
        agri_type = "Agricultural"
    else:
        base_shi = random.randint(55, 85)
        industrial_risk = random.randint(5, 25)
        agri_type = "Forest/Mixed"

    shi = base_shi
    return {
        "shi": shi,
        "agri_type": agri_type,
        "industrial_risk": industrial_risk,
        "organic_matter": round(random.uniform(0.5, 4.5), 1),
        "pesticides": max(0, 100 - shi + random.randint(-10, 20)),
        "heavy_metals": max(0, industrial_risk // 2 + random.randint(0, 15)),
        "plastic_waste": random.randint(10, 60),
        "acidification": random.randint(10, 70),
        "erosion_risk": random.randint(15, 75),
        "trend": [
            {"date": (datetime.utcnow() - timedelta(days=30*(5-i))).strftime("%b"),
             "shi": max(20, min(95, shi + random.randint(-5, 5)))}
            for i in range(6)
        ],
        "note": "Soil Health Index is estimated from agricultural and industrial patterns. Not a substitute for lab testing."
    }

@app.get("/api/soil/search")
async def soil_search(city: str, state: str):
    data = simulate_shi(city, state)
    return {"city": city, "state": state, **data}

@app.get("/api/soil/top5")
async def soil_top5(state: str):
    districts = ["District A","District B","District C","District D","District E"]
    reasons = ["Heavy industrial activity","Excessive pesticide use","Mining operations","Urban waste dumping","Chemical runoff"]
    random.seed(sum(ord(c) for c in state))
    result = []
    for i, d in enumerate(districts):
        result.append({
            "district": d, "state": state,
            "shi": random.randint(20, 55),
            "reason": reasons[i]
        })
    result.sort(key=lambda x: x["shi"])
    return result

# ── Alerts ─────────────────────────────────────────────────────────────────────

@app.get("/api/alerts")
async def get_alerts():
    cities = ["Mumbai","Delhi","Chennai","Kolkata","Bangalore"]
    alerts = []
    for city in cities:
        try:
            lat, lon = await owm_geo(city)
            weather = await owm_weather(lat, lon)
            air = await owm_air(lat, lon)
            comp = air["list"][0]["components"]
            aqi = calc_us_aqi(
                pm25=comp.get("pm2_5", 0),
                pm10=comp.get("pm10", 0),
                o3=comp.get("o3", 0),
                no2=comp.get("no2", 0),
                so2=comp.get("so2", 0),
                co=comp.get("co", 0)
            )
            alerts.append({
                "city": city,
                "temp": round(weather["main"]["temp"], 1),
                "humidity": weather["main"]["humidity"],
                "wind": round(weather["wind"]["speed"], 1),
                "description": weather["weather"][0]["description"].title(),
                "aqi": aqi
            })
        except Exception as e:
            alerts.append({"city": city, "temp": "N/A", "humidity": "N/A", "wind": "N/A", "description": "Data unavailable", "aqi": "N/A"})
    return alerts

# ── Auth ───────────────────────────────────────────────────────────────────────

class SignupBody(BaseModel):
    username: str
    email: str
    password: str

class LoginBody(BaseModel):
    email: str
    password: str

@app.post("/api/auth/signup")
async def signup(body: SignupBody, db: AsyncSession = Depends(get_db)):
    try:
        existing = await db.execute(select(User).where(User.email == body.email))
        if existing.scalar():
            raise HTTPException(400, detail="Email already registered")
        existing_user = await db.execute(select(User).where(User.username == body.username))
        if existing_user.scalar():
            raise HTTPException(400, detail="Username already taken")
        user = User(
            username=body.username,
            email=body.email,
            password_hash=hash_password(body.password)
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return {"id": user.id, "username": user.username, "email": user.email}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/auth/login")
async def login(body: LoginBody, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return {"id": user.id, "username": user.username, "email": user.email}

# ── Reports ────────────────────────────────────────────────────────────────────

class ReportBody(BaseModel):
    pollution_type: str
    city: str
    state: str
    description: str
    photo_base64: Optional[str] = None
    user_id: Optional[int] = None

class CommentBody(BaseModel):
    report_id: int
    text: str
    user_id: Optional[int] = None

@app.post("/api/reports/citizen")
async def create_report(body: ReportBody, db: AsyncSession = Depends(get_db)):
    report = CitizenReport(
        user_id=body.user_id,
        pollution_type=body.pollution_type,
        city=body.city,
        state=body.state,
        description=body.description,
        photo_url=body.photo_base64
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return {"id": report.id, "message": "Report submitted successfully"}

@app.get("/api/reports/citizen")
async def get_reports(pollution_type: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    q = select(CitizenReport)
    if pollution_type:
        q = q.where(CitizenReport.pollution_type == pollution_type)
    q = q.order_by(desc(CitizenReport.created_at)).limit(20)
    result = await db.execute(q)
    reports = result.scalars().all()
    return [
        {
            "id": r.id, "city": r.city, "state": r.state,
            "description": r.description, "photo_url": r.photo_url,
            "created_at": r.created_at.isoformat(), "pollution_type": r.pollution_type
        }
        for r in reports
    ]

@app.post("/api/reports/comment")
async def post_comment(body: CommentBody, db: AsyncSession = Depends(get_db)):
    comment = Comment(report_id=body.report_id, user_id=body.user_id, text=body.text)
    db.add(comment)
    await db.commit()
    return {"message": "Comment posted"}

@app.get("/api/reports/comments")
async def get_comments(report_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comment).where(Comment.report_id == report_id).order_by(Comment.created_at)
    )
    comments = result.scalars().all()
    return [{"id": c.id, "text": c.text, "created_at": c.created_at.isoformat()} for c in comments]

