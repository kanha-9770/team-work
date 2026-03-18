
import React, { useState, useEffect } from 'react';
import { GDStage, EvaluationReport, GDMessage, Participant, AITraits, SimulationContext } from './types';
import { TOPICS, AI_PARTICIPANTS } from './constants';
import LandingPage from './components/LandingPage';
import Lobby from './components/Lobby';
import TopicSelection from './components/TopicSelection';
import DiscussionView from './components/DiscussionView';
import FeedbackReport from './components/FeedbackReport';
import AuthPages from './components/AuthPages';
import InfoPages from './components/InfoPages';
import ApiKeySetup from './components/ApiKeySetup';
import KeyManagement from './components/KeyManagement';
import { generateText } from './services/geminiService';

const AUTH_STORAGE_KEY = 'arena_gd_auth_status';

const App: React.FC = () => {
  const [stage, setStage] = useState<GDStage>(GDStage.LANDING);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string } | null>(null);
  const [simulationContext, setSimulationContext] = useState<SimulationContext>('UG_PLACEMENT');
  const [selectedTopic, setSelectedTopic] = useState<{title: string; context: string} | null>(null);
  const [customAIParticipants, setCustomAIParticipants] = useState<Participant[]>(AI_PARTICIPANTS);
  const [evaluation, setEvaluation] = useState<EvaluationReport | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [retryStatus, setRetryStatus] = useState<{ delay: number; attempt: number } | null>(null);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: GDStage.LOBBY, label: 'Profile', icon: 'fa-user-circle' },
    { id: GDStage.TOPIC_SELECTION, label: 'Agenda', icon: 'fa-layer-group' },
    { id: GDStage.DISCUSSION, label: 'Arena', icon: 'fa-microphone' },
    { id: GDStage.FEEDBACK, label: 'Analytics', icon: 'fa-chart-pie' },
  ];

  const checkKeyOnStart = async () => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        if (auth.authorized) {
          setStage(GDStage.LOBBY);
          return;
        }
      } catch (e) {}
    }

    try {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setStage(GDStage.API_KEY_SETUP);
          return;
        }
      }
      setStage(GDStage.LOBBY);
    } catch (err) {
      setStage(GDStage.API_KEY_SETUP);
    }
  };

  const handleStartLobby = (name: string, aiStances: Record<string, string>, aiTraits: Record<string, AITraits>, context: SimulationContext, updatedAIs: Participant[]) => {
    setUserProfile({ name, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` });
    setSimulationContext(context);
    const finalAIs = updatedAIs.map(p => ({
      ...p,
      stance: aiStances[p.id] || p.description,
      traits: aiTraits[p.id]
    }));
    setCustomAIParticipants(finalAIs);
    setStage(GDStage.TOPIC_SELECTION);
  };

  const handleGenerateDynamicTopic = async (keywords: string) => {
    setIsGeneratingTopic(true);
    setError(null);
    try {
      const prompt = `Generate a high-stakes GD topic for ${simulationContext} based on keywords: "${keywords}". Respond ONLY with JSON: { "title": "...", "context": "..." }`;
      const result = await generateText(prompt, undefined, 'gemini-3-flash-preview', (delay, attempt) => {
        setRetryStatus({ delay, attempt });
      });
      const generated = JSON.parse(result || '{}');
      setSelectedTopic(generated);
      setStage(GDStage.DISCUSSION);
    } catch (err: any) {
      if (err?.message?.includes("key") || err?.message?.includes("not found")) setStage(GDStage.API_KEY_SETUP);
      setError(`Topic synthesis interrupted: ${err.message}`);
    } finally {
      setIsGeneratingTopic(false);
      setRetryStatus(null);
    }
  };

  const handleSelectTopic = (topic: {title: string; context: string}) => {
    setSelectedTopic(topic);
    setStage(GDStage.DISCUSSION);
  };

  const generateFeedback = async (history: GDMessage[], sessionMetrics: any) => {
    setIsEvaluating(true);
    setError(null);
    setRetryStatus(null);

    const userMessages = history.filter(m => m.isUser);
    const processedMetrics = {
      userTotalWords: userMessages.reduce((acc, m) => acc + m.text.split(/\s+/).length, 0),
      userTurnCount: userMessages.length,
      interruptionCount: sessionMetrics?.interruptionCount || 0,
    };

    try {
      const prompt = `
        Perform a master-level behavioral and linguistic analysis for candidate "${userProfile?.name}".
        Topic: "${selectedTopic?.title}". 
        Context: ${simulationContext}. 
        
        SESSION ANALYTICS:
        - Words Spoken: ${processedMetrics.userTotalWords}
        - Conversational Turns: ${processedMetrics.userTurnCount}
        - User Interruptions: ${processedMetrics.interruptionCount}
        
        TRANSCRIPT DATA: 
        ${JSON.stringify(history)}
        
        REQUIREMENTS:
        Respond ONLY with a JSON object following the EvaluationReport structure.
      `;
      
      const result = await generateText(prompt, undefined, 'gemini-3-pro-preview', (delay, attempt) => {
        setRetryStatus({ delay, attempt });
      });
      
      const report: EvaluationReport = JSON.parse(result || '{}');
      report.interruptionCount = processedMetrics.interruptionCount;
      
      setEvaluation(report);
      setStage(GDStage.FEEDBACK);
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes("key") || err?.message?.includes("not found")) setStage(GDStage.API_KEY_SETUP);
      setError(`Strategic synthesis failed: ${err.message}`);
    } finally {
      setIsEvaluating(false);
      setRetryStatus(null);
    }
  };

  const handleRestart = () => {
    setStage(GDStage.LOBBY);
    setEvaluation(null);
    setSelectedTopic(null);
    setError(null);
  };

  const isSimActive = [GDStage.LOBBY, GDStage.TOPIC_SELECTION, GDStage.DISCUSSION, GDStage.FEEDBACK].includes(stage);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-indigo-100">
      <header className="h-16 bg-white/90 backdrop-blur-3xl border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 cursor-pointer" onClick={() => setStage(GDStage.LANDING)}>
            <i className="fa-solid fa-bolt-lightning text-white text-sm"></i>
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase italic cursor-pointer" onClick={() => setStage(GDStage.LANDING)}>Arena<span className="text-indigo-600">GD</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => setStage(GDStage.LANDING)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Home</button>
          <button onClick={() => setStage(GDStage.KEY_MANAGEMENT)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">API Bridge</button>
          <button onClick={() => setStage(GDStage.ABOUT)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Intelligence</button>
        </nav>

        <div className="flex items-center gap-4">
          {userProfile ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{userProfile.name}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Link</p>
              </div>
              <img src={userProfile.avatar} className="w-8 h-8 rounded-full border border-slate-200" alt="Avatar" />
            </div>
          ) : (
            <button 
              onClick={() => setStage(GDStage.LOGIN)}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
            >
              Access Portal
            </button>
          )}
        </div>
      </header>

      {isSimActive && (
        <div className="bg-white border-b border-slate-100 px-8 py-3 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-12 md:gap-24">
            {steps.map((step) => (
              <div key={step.id} className={`flex items-center gap-3 shrink-0 ${stage === step.id ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${stage === step.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <i className={`fa-solid ${step.icon}`}></i>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 relative">
        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 animate-shake">
            <i className="fa-solid fa-circle-exclamation text-rose-500"></i>
            <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">{error}</p>
          </div>
        )}

        {stage === GDStage.API_KEY_SETUP && <ApiKeySetup onSuccess={() => setStage(GDStage.LOBBY)} />}
        {stage === GDStage.KEY_MANAGEMENT && <KeyManagement onBack={() => setStage(GDStage.LOBBY)} />}
        {stage === GDStage.LANDING && <LandingPage onStart={checkKeyOnStart} />}
        {stage === GDStage.LOBBY && <Lobby onStart={handleStartLobby} />}
        {stage === GDStage.TOPIC_SELECTION && (
          <TopicSelection 
            onSelect={handleSelectTopic} 
            onGenerateDynamic={handleGenerateDynamicTopic} 
            isGenerating={isGeneratingTopic} 
          />
        )}
        {stage === GDStage.DISCUSSION && selectedTopic && (
          <DiscussionView 
            topic={selectedTopic} 
            user={userProfile!} 
            aiParticipants={customAIParticipants} 
            onEnd={generateFeedback}
          />
        )}
        {stage === GDStage.FEEDBACK && evaluation && (
          <FeedbackReport report={evaluation} onRestart={handleRestart} />
        )}
        {(stage === GDStage.LOGIN || stage === GDStage.SIGN_IN) && (
          <AuthPages 
            mode={stage === GDStage.LOGIN ? 'login' : 'signin'} 
            onAuthSuccess={() => setStage(GDStage.LOBBY)} 
            onToggle={() => setStage(stage === GDStage.LOGIN ? GDStage.SIGN_IN : GDStage.LOGIN)} 
          />
        )}
        {(stage === GDStage.ABOUT || stage === GDStage.SERVICES) && (
          <InfoPages 
            type={stage === GDStage.ABOUT ? 'about' : 'services'} 
            onAction={() => setStage(GDStage.LANDING)} 
          />
        )}

        {(isEvaluating || retryStatus) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-32 h-32 border-[6px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-10"></div>
            
            {retryStatus ? (
              <>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-4">Neural Quota Managed...</h2>
                <p className="text-indigo-200 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">
                  Attempt {retryStatus.attempt}: High traffic detected. Optimizing bridge (Waiting {Math.round(retryStatus.delay / 1000)}s)...
                </p>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-4">Synthesizing Performance...</h2>
                <p className="text-indigo-200 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Running semantic behavioral evaluation models</p>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.8em]">ArenaGD Neural Network • Confidential Simulation</p>
      </footer>
    </div>
  );
};

export default App;
