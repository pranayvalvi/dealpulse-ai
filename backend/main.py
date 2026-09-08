from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, List, Optional
import ollama
import json
import sqlite3
import datetime
import os

app = FastAPI(title="DealPulse AI Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = os.path.join(os.path.dirname(__file__), "deals.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            transcript TEXT,
            budget TEXT,
            authority TEXT,
            need TEXT,
            timeline TEXT,
            interest_level TEXT,
            objections TEXT,
            next_steps TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class CRMData(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    date: Optional[str] = None
    transcript: Optional[str] = None
    budget: str
    authority: str
    need: str
    timeline: str
    interest_level: Literal["High", "Medium", "Low"]
    objections: List[str]
    next_steps: List[str]

class TranscriptInput(BaseModel):
    transcript: str

class EmailRequest(BaseModel):
    transcript: str
    crm_data: CRMData

@app.get("/deals", response_model=List[CRMData])
async def get_deals():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM deals ORDER BY id DESC')
    rows = cursor.fetchall()
    conn.close()
    
    deals = []
    for row in rows:
        deals.append(CRMData(
            id=row['id'],
            title=row['title'],
            date=row['date'],
            transcript=row['transcript'],
            budget=row['budget'],
            authority=row['authority'],
            need=row['need'],
            timeline=row['timeline'],
            interest_level=row['interest_level'],
            objections=json.loads(row['objections']),
            next_steps=json.loads(row['next_steps'])
        ))
    return deals

@app.post("/analyze", response_model=CRMData)
async def analyze_transcript(input_data: TranscriptInput):
    try:
        response = ollama.chat(
            model='qwen2.5:7b',
            messages=[
                {
                    'role': 'system',
                    'content': 'You are a helpful assistant that extracts CRM data from a sales transcript. Always return valid JSON matching the schema.'
                },
                {
                    'role': 'user',
                    'content': input_data.transcript
                }
            ],
            format=CRMData.model_json_schema(),
            options={
                'temperature': 0
            }
        )
        
        crm_data_dict = json.loads(response['message']['content'])
        
        # Determine title
        title = f"Call on {datetime.datetime.now().strftime('%b %d, %H:%M')}"
        
        # Save to DB
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO deals (title, transcript, budget, authority, need, timeline, interest_level, objections, next_steps)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            title,
            input_data.transcript,
            crm_data_dict.get('budget', ''),
            crm_data_dict.get('authority', ''),
            crm_data_dict.get('need', ''),
            crm_data_dict.get('timeline', ''),
            crm_data_dict.get('interest_level', 'Medium'),
            json.dumps(crm_data_dict.get('objections', [])),
            json.dumps(crm_data_dict.get('next_steps', []))
        ))
        conn.commit()
        deal_id = cursor.lastrowid
        conn.close()
        
        crm_data_dict['id'] = deal_id
        crm_data_dict['title'] = title
        crm_data_dict['transcript'] = input_data.transcript
        
        return CRMData(**crm_data_dict)
    
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to Ollama or process the transcript.")

@app.post("/draft_email")
async def draft_email(req: EmailRequest):
    try:
        prompt = f"""
Write a professional, persuasive follow-up email to the prospect based on this sales call transcript.
Address their specific objections and outline the exact next steps we agreed upon.
Keep it concise, engaging, and friendly.

Call Transcript:
{req.transcript}

Extracted CRM Context:
Objections: {', '.join(req.crm_data.objections)}
Next Steps: {', '.join(req.crm_data.next_steps)}

Return ONLY the email text. Do not include any meta-commentary or prefix.
"""
        response = ollama.chat(
            model='llama3.2',
            messages=[
                {
                    'role': 'system',
                    'content': 'You are a top-performing sales executive writing follow-up emails. You output only the email content.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            options={
                'temperature': 0.7
            }
        )
        
        return {"email": response['message']['content'].strip()}
        
    except Exception as e:
        print(f"Error generating email: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate email.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
