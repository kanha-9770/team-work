
import React, { useState } from 'react';

interface ApiKeySetupProps {
  onSuccess: () => void;
}

const STORAGE_KEY = 'arena_gd_auth_status';

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cores = [
    { name: 'Cognitive Core', model: 'Gemini 3 Pro', desc: 'Reasoning & Logic', icon: 'fa-brain' },
    { name: 'Visual Core', model: 'Gemini 2.5 Flash Image', desc: 'Situational Rendering', icon: 'fa-image' },
    { name: 'Motion Core', model: 'Veo 3.1 Fast', desc: 'Temporal Simulation', icon: 'fa-video' },
    { name: 'Neural Bridge', model: 'Gemini 2.5 Live', desc: 'Real-time Audio Sync', icon: 'fa-microphone-lines' },
  ];

  const handleOpenKeyPicker = async () => {
    setIsProcessing(true);
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        
        // Persist the authorization state
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          authorized: true,
          timestamp: Date.now()
        }));

        onSuccess();
      } else {
        alert("Platform Bridge Missing: Please ensure you are running this in the intended AI Studio environment.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Key selection protocol failed", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1),transparent_70%)]"></div>
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-10">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Neural Authorization Hub</span>
          </div>
          
          <h1 className="text-7xl font-black text-white tracking-tighter mb-8 uppercase italic leading-[0.85]">
            UNLEASH <br />THE <span className="text-indigo-500">ENGINE.</span>
          </h1>
          
          <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-md italic">
            Initialize the Arena by connecting your high-performance Gemini API keys. 
            A single bridge enables all four core cognitive modules.
          </p>

          <button 
            onClick={handleOpenKeyPicker}
            disabled={isProcessing}
            className="group px-16 py-8 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.5em] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl text-sm flex items-center gap-4 active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? 'Syncing Cores...' : 'Initialize All Cores'}
            <i className="fa-solid fa-arrow-right-long transition-transform group-hover:translate-x-2"></i>
          </button>
          
          <p className="mt-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
            <i className="fa-solid fa-lock text-indigo-500"></i>
            Keys are secured via AI Studio Platform Bridge
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {cores.map((core, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] group hover:border-indigo-500/50 transition-all">
              <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i className={`fa-solid ${core.icon} text-xl`}></i>
              </div>
              <h3 className="text-white font-black text-xs uppercase tracking-widest mb-1">{core.name}</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4">{core.model}</p>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">{core.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 text-[9px] font-black text-white uppercase tracking-[1em]">
        ARENAGD MULTI-MODAL DEPLOYMENT
      </div>
    </div>
  );
};

export default ApiKeySetup;
