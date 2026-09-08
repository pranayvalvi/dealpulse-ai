from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, List
import ollama
import json

app = FastAPI(title="DealPulse AI Backend")

# Configure CORS to allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class CRMData(BaseModel):
    budget: str
    authority: str
    need: str
    timeline: str
    interest_level: Literal["High", "Medium", "Low"]
    objections: List[str]
    next_steps: List[str]

class TranscriptInput(BaseModel):
    transcript: str

@app.post("/analyze", response_model=CRMData)
async def analyze_transcript(input_data: TranscriptInput):
    try:
        response = ollama.chat(
            model='qwen2.5:7b',
            messages=[
                {
                    'role': 'system',
                    'content': 'You are a helpful assistant that extracts CRM data from a sales transcript.'
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
        
        # Parse the JSON response
        crm_data = json.loads(response['message']['content'])
        return CRMData(**crm_data)
    
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to Ollama or process the transcript. Ensure Ollama is running.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
