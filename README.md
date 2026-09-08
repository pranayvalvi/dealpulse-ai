# 🚀 DealPulse AI

DealPulse AI is a real-time sales call intelligence platform built for a hackathon. It uses local AI to analyze sales transcripts in real-time, automatically extracting BANT criteria, objections, and next steps to streamline the sales process.

## ✨ Features

- **🎙️ Real-Time Transcription Support:** Built-in hooks to capture browser microphone input for live sales calls.
- **🧠 Local AI Processing:** Uses **Llama 3.2** via Ollama for entirely local, private, and secure data extraction.
- **📊 BANT Extraction:** Automatically categorizes call data into Budget, Authority, Need, and Timeline.
- **🗄️ Deal History Database:** Automatically saves analyzed calls to a local SQLite database for easy retrieval via a sidebar.
- **📧 AI Email Drafter:** Uses generative AI to write highly persuasive, personalized follow-up emails addressing the specific objections and next steps discussed on the call.
- **🎨 Glassmorphism UI:** A sleek, modern, dark-mode dashboard built with React, Tailwind CSS, and Framer Motion.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Python, FastAPI, Pydantic, SQLite
- **AI Model:** Llama 3.2 (via Ollama SDK)

## 🚀 Getting Started

### Prerequisites
1. Install [Node.js](https://nodejs.org/)
2. Install [Python 3.10+](https://www.python.org/)
3. Install [Ollama](https://ollama.ai/)

### 1. Start the Local AI Model
Before running the app, ensure your local Llama 3.2 model is running:
```bash
ollama run llama3.2
```

### 2. Run the Backend (FastAPI)
Open a terminal in the root directory:
```bash
# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn backend.main:app --reload
```
*The backend will run on `http://localhost:8000`.*

### 3. Run the Frontend (React/Vite)
Open a new terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

## 📸 Usage

1. Open `http://localhost:5173` in your browser.
2. Click **Record Call** to start capturing live audio, or switch to the manual input mode to paste a call transcript.
3. Click **Analyze Transcript** to extract the data.
4. View the organized Deal Intelligence dashboard.
5. Click **Generate Follow-Up Email** to have the AI write a customized email for the prospect.
6. Access past deals using the History sidebar toggle.

---
*Built for a 6-hour hackathon.*
