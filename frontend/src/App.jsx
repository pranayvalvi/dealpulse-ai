import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Square, FileText, Loader2, Mail, 
  DollarSign, UserCheck, Target, Calendar, 
  Activity, ShieldAlert, ListTodo, ChevronRight,
  History, Clock, CheckCircle2, X
} from 'lucide-react';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import CRMCard from './CRMCard';

function App() {
  const { transcript, setTranscript, isRecording, startRecording, stopRecording } = useSpeechRecognition();
  
  const [showManualInput, setShowManualInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [crmData, setCrmData] = useState(null);
  
  // New State for features
  const [pastDeals, setPastDeals] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);
  const [draftedEmail, setDraftedEmail] = useState(null);

  // Initial dummy data
  const dummyData = {
    budget: "$10,000",
    authority: "Manager (John)",
    need: "Software solution",
    timeline: "Next Tuesday",
    interest_level: "High",
    objections: ["Price is too high", "Implementation time"],
    next_steps: ["Send revised contract for $8,000", "Schedule follow-up call"]
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('http://localhost:8000/deals');
      if (response.ok) {
        const data = await response.json();
        setPastDeals(data);
      }
    } catch (err) {
      console.error("Failed to fetch deals:", err);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    if (transcript.trim()) {
      analyzeTranscript(transcript);
    }
  };

  const handleManualSubmit = () => {
    if (transcript.trim()) {
      analyzeTranscript(transcript);
    }
  };

  const analyzeTranscript = async (textToAnalyze) => {
    setIsLoading(true);
    setError(null);
    setDraftedEmail(null);
    
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: textToAnalyze }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setCrmData(data);
      setTranscript(data.transcript); // Ensure transcript shows saved text
      fetchDeals(); // Refresh history
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to connect to backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeal = (deal) => {
    setCrmData(deal);
    setTranscript(deal.transcript);
    setShowManualInput(true); // Switch to manual input to view transcript
    setDraftedEmail(null);
    setIsSidebarOpen(false);
  };

  const handleDraftEmail = async () => {
    if (!crmData) return;
    setIsDraftingEmail(true);
    setDraftedEmail(null);
    
    try {
      const response = await fetch('http://localhost:8000/draft_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: transcript || crmData.transcript || "", 
          crm_data: crmData 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDraftedEmail(data.email);
      } else {
        throw new Error("Failed to generate email");
      }
    } catch (err) {
      console.error("Drafting error:", err);
      alert("Failed to generate email.");
    } finally {
      setIsDraftingEmail(false);
    }
  };

  const startNewCall = () => {
    setCrmData(null);
    setTranscript("");
    setDraftedEmail(null);
    setShowManualInput(false);
  };

  const displayData = crmData || dummyData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30 flex">
      
      {/* Sidebar for Past Deals */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-slate-800 border-r border-slate-700 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h2 className="font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Past Deals
                </h2>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {pastDeals.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No past deals yet.</p>
                ) : (
                  pastDeals.map(deal => (
                    <button 
                      key={deal.id}
                      onClick={() => loadDeal(deal)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${crmData?.id === deal.id ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600'}`}
                    >
                      <div className="font-medium text-sm truncate">{deal.title || `Deal #${deal.id}`}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(deal.date).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12 space-y-8">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                title="Toggle Past Deals"
              >
                <History className="w-5 h-5 text-slate-300" />
              </button>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Deal<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Pulse</span> AI
                </h1>
              </div>
            </div>
            
            {crmData && (
              <button 
                onClick={startNewCall}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
              >
                + New Call
              </button>
            )}
          </header>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-rose-900/20 border border-rose-500/50 text-rose-200 px-6 py-4 rounded-xl flex items-center gap-3 max-w-3xl mx-auto"
            >
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Input Panel */}
            <div className="xl:col-span-4 flex flex-col gap-5 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md">
              
              <div className="flex gap-3">
                {isRecording ? (
                  <button 
                    onClick={handleStopRecording}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-rose-500/20 animate-pulse border border-rose-400/50"
                  >
                    <Square className="w-5 h-5 fill-current" /> Stop Recording
                  </button>
                ) : (
                  <button 
                    onClick={startRecording}
                    disabled={!!crmData}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-indigo-600/20 border border-indigo-500/50"
                  >
                    <Mic className="w-5 h-5" /> Record Call
                  </button>
                )}
                
                <button 
                  onClick={() => setShowManualInput(!showManualInput)}
                  className={`p-3.5 rounded-2xl transition-all border ${showManualInput ? 'bg-slate-700 border-slate-500' : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'}`}
                  title="Toggle Text Input"
                >
                  <FileText className="w-5 h-5 text-slate-300" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {showManualInput ? (
                  <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                    <textarea 
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Paste call transcript here..."
                      className="w-full h-80 bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none shadow-inner"
                    />
                    {!crmData && (
                      <button 
                        onClick={handleManualSubmit}
                        disabled={isLoading || !transcript.trim()}
                        className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:hover:bg-slate-700 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        Analyze Transcript <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-80 bg-slate-900/50 border border-slate-700 rounded-2xl p-5 overflow-y-auto shadow-inner relative">
                    {transcript ? (
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{transcript}</p>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-3">
                        <Mic className="w-8 h-8 opacity-20" />
                        <span className="italic text-sm text-center px-4">Click "Record Call" or switch to manual input to begin analyzing</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: CRM Insights */}
            <div className="xl:col-span-8 bg-slate-800/20 p-6 sm:p-8 rounded-3xl border border-slate-700/30 backdrop-blur-sm min-h-[600px] flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-indigo-400 space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                    <Loader2 className="w-16 h-16 animate-spin relative z-10" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-semibold text-slate-200">Extracting Insights</p>
                    <p className="text-slate-400">Llama 3.2 is analyzing the conversation...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700/50 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        {crmData?.title || "Deal Intelligence"}
                        {!crmData && <span className="text-sm font-normal text-slate-500 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">Preview Data</span>}
                      </h2>
                      <p className="text-slate-400 text-sm mt-1">Structured BANT metrics & action items</p>
                    </div>
                    {crmData && (
                      <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Saved to Deals
                      </span>
                    )}
                  </div>
                  
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                       <CRMCard title="Budget" value={displayData.budget} icon={DollarSign} />
                       <CRMCard title="Authority" value={displayData.authority} icon={UserCheck} />
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                       <CRMCard title="Need" value={displayData.need} icon={Target} />
                       <CRMCard title="Timeline" value={displayData.timeline} icon={Calendar} />
                    </div>
                    
                    <div className="md:col-span-2 lg:col-span-4">
                      <CRMCard title="Interest Level" value={displayData.interest_level} type="interest" icon={Activity} />
                    </div>

                    <div className="md:col-span-1 lg:col-span-2">
                      <CRMCard title="Objections" value={displayData.objections} type="tags" icon={ShieldAlert} />
                    </div>
                    
                    <div className="md:col-span-1 lg:col-span-2">
                      <CRMCard title="Next Steps" value={displayData.next_steps} type="list" icon={ListTodo} />
                    </div>
                  </motion.div>

                  <div className="pt-6 border-t border-slate-700/50 mt-auto">
                    {draftedEmail ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
                          <h3 className="font-semibold text-indigo-300 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> AI Generated Draft
                          </h3>
                          <button onClick={() => setDraftedEmail(null)} className="text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea 
                          className="w-full h-48 bg-transparent text-slate-200 border-none focus:ring-0 resize-none"
                          defaultValue={draftedEmail}
                        />
                        <div className="flex justify-end mt-2">
                          <button onClick={() => navigator.clipboard.writeText(draftedEmail)} className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white font-medium transition-colors">
                            Copy to Clipboard
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <button 
                        onClick={handleDraftEmail}
                        disabled={!crmData || isDraftingEmail}
                        className="w-full sm:w-auto ml-auto bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-50 disabled:grayscale text-white py-3.5 px-8 rounded-xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-indigo-500/20 transition-all"
                      >
                        {isDraftingEmail ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Drafting Email...</>
                        ) : (
                          <><Mail className="w-5 h-5" /> Generate Follow-Up Email</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
