
import React, { useState } from 'react';
import { AI_PARTICIPANTS } from '../constants';
import { AITraits, SimulationContext, Participant, VoiceName } from '../types';

interface LobbyProps {
  onStart: (name: string, aiStances: Record<string, string>, aiTraits: Record<string, AITraits>, context: SimulationContext, updatedAIs: Participant[]) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [context, setContext] = useState<SimulationContext>('UG_PLACEMENT');
  const [currentAIs, setCurrentAIs] = useState<Participant[]>(AI_PARTICIPANTS);
  
  const [stances, setStances] = useState<Record<string, string>>(
    Object.fromEntries(AI_PARTICIPANTS.map(p => [p.id, '']))
  );

  const [traits, setTraits] = useState<Record<string, AITraits>>(
    Object.fromEntries(AI_PARTICIPANTS.map(p => [p.id, {
      aggression: p.id === 'ai-2' ? 85 : p.id === 'ai-1' ? 30 : 50,
      talkativeness: 60,
      logicVsEmotion: p.id === 'ai-1' ? 10 : p.id === 'ai-3' ? 80 : 50,
      formality: 70
    }]))
  );

  const voiceOptions: { name: VoiceName; gender: string }[] = [
    { name: 'Puck', gender: 'Male' },
    { name: 'Charon', gender: 'Male' },
    { name: 'Fenrir', gender: 'Male' },
    { name: 'Kore', gender: 'Female' },
    { name: 'Zephyr', gender: 'Neutral' },
  ];

  const contexts: { id: SimulationContext; label: string; icon: string; desc: string }[] = [
    { id: 'UG_PLACEMENT', label: 'UG Placement', icon: 'fa-graduation-cap', desc: 'Entry-level roles.' },
    { id: 'MBA_ADMISSION', label: 'MBA Admission', icon: 'fa-building-columns', desc: 'Leadership focus.' },
    { id: 'CORPORATE_HIRE', label: 'Corporate Hire', icon: 'fa-briefcase', desc: 'Professional hire.' },
    { id: 'GOVT_SERVICES', label: 'Govt Services', icon: 'fa-landmark', desc: 'Policy & Ethics.' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onStart(name, stances, traits, context, currentAIs);
  };

  const handleTraitChange = (id: string, trait: keyof AITraits, value: number) => {
    const clampedValue = isNaN(value) ? 0 : Math.max(0, Math.min(100, value));
    setTraits(prev => ({ ...prev, [id]: { ...prev[id], [trait]: clampedValue } }));
  };

  const handleVoiceChange = (id: string, voice: VoiceName) => {
    setCurrentAIs(prev => prev.map(p => p.id === id ? { ...p, voiceName: voice } : p));
  };

  const getTraitColor = (val: number) => {
    if (val > 75) return 'bg-rose-500';
    if (val > 40) return 'bg-indigo-600';
    return 'bg-emerald-500';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in pb-32">
      <div className="mb-16 relative">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
        <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-[0.85] mb-6 relative z-10 uppercase">
          CALIBRATE THE <br /><span className="text-indigo-600 italic">PERSONALITY MATRIX.</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-4 space-y-8 sticky top-24">
          <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-xl shadow-slate-200/50">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10">01. Identity Uplink</h3>
            <div className="space-y-10">
              <div className="group">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest transition-colors group-focus-within:text-indigo-600">Candidate Codename</label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ALPHA_CANDIDATE"
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:border-indigo-600 focus:bg-white outline-none font-bold text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Target Environment</label>
                <div className="grid grid-cols-1 gap-4">
                  {contexts.map((ctx) => (
                    <button
                      key={ctx.id}
                      type="button"
                      onClick={() => setContext(ctx.id)}
                      className={`flex items-center gap-5 px-6 py-5 rounded-[1.5rem] border-2 transition-all text-left group ${
                        context === ctx.id 
                          ? 'bg-indigo-600 border-indigo-600 text-white' 
                          : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                      }`}
                    >
                      <i className={`fa-solid ${ctx.icon} ${context === ctx.id ? 'text-white' : 'text-slate-400'}`}></i>
                      <div className="relative z-10">
                        <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{ctx.label}</p>
                        <p className={`text-[9px] font-bold ${context === ctx.id ? 'text-indigo-100' : 'text-slate-400'}`}>{ctx.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.5em] py-10 rounded-[3rem] shadow-2xl hover:bg-indigo-600 transition-all flex flex-col items-center justify-center gap-4 group active:scale-95"
          >
            <span className="text-xs">Establish Bridge</span>
            <i className="fa-solid fa-bolt-lightning text-xl animate-pulse"></i>
          </button>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[3.5rem] border border-slate-200 p-12 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12">02. Persona Calibration Matrix</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {currentAIs.map(p => {
                const currentTraits = traits[p.id];
                return (
                  <div key={p.id} className="p-10 bg-slate-50/40 border border-slate-100 rounded-[3rem] group hover:border-indigo-600/30 hover:bg-white transition-all">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <img src={p.avatar} className="w-14 h-14 rounded-2xl" alt="" />
                        <div>
                          <h4 className="text-md font-black text-slate-900 uppercase tracking-tight">{p.name}</h4>
                          <span className="text-[8px] font-black text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded">{p.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group/voice">
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Neural Voice Output</label>
                        <select 
                          value={p.voiceName}
                          onChange={(e) => handleVoiceChange(p.id, e.target.value as VoiceName)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-600"
                        >
                          {voiceOptions.map(v => (
                            <option key={v.name} value={v.name}>{v.name} ({v.gender})</option>
                          ))}
                        </select>
                      </div>

                      {[
                        { key: 'aggression' as keyof AITraits, label: 'Aggression Vector', icon: 'fa-fire' },
                        { key: 'talkativeness' as keyof AITraits, label: 'Talkative Ratio', icon: 'fa-comments' },
                        { key: 'logicVsEmotion' as keyof AITraits, label: 'Logic Entropy', icon: 'fa-brain' },
                        { key: 'formality' as keyof AITraits, label: 'Corporate Rigor', icon: 'fa-tie' },
                      ].map(trait => (
                        <div key={trait.key} className="group/trait">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{trait.label}</span>
                            <span className="text-[10px] font-mono font-bold">{traits[p.id][trait.key]}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" 
                            value={traits[p.id][trait.key]}
                            onChange={(e) => handleTraitChange(p.id, trait.key, parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      ))}

                      <textarea 
                        placeholder="Inject logic core instructions..."
                        className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-xs h-24 resize-none focus:border-indigo-600 outline-none"
                        value={stances[p.id]}
                        onChange={(e) => setStances(prev => ({...prev, [p.id]: e.target.value}))}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Lobby;
