
// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LiveServerMessage, Modality } from '@google/genai';
import { Participant, GDMessage, VoiceName } from '../types';
import { decodeBase64Audio, decodeAudioData, getGeminiClient } from '../services/geminiService';
import { createBlob } from '../services/audioUtils';

interface DiscussionViewProps {
  topic: { title: string; context: string };
  user: { name: string; avatar: string };
  aiParticipants: Participant[];
  onEnd: (history: GDMessage[], metrics: any) => void;
}

const DiscussionView: React.FC<DiscussionViewProps> = ({ topic, user, aiParticipants, onEnd }) => {
  const [messages, setMessages] = useState<GDMessage[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [bridgeStatus, setBridgeStatus] = useState<'IDLE' | 'CONNECTING' | 'STABLE' | 'DEGRADED' | 'FAULT'>('IDLE');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [sessionVoice, setSessionVoice] = useState<VoiceName>(aiParticipants[0]?.voiceName || 'Zephyr');
  const [userVol, setUserVol] = useState(0);
  const [userConfidence, setUserConfidence] = useState<number>(50);

  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');

  // Refs for tracking mutable state without re-renders or stale closures
  const interruptionCountRef = useRef(0);
  const nextStartTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Critical: Accumulation refs for live transcription chunks
  const inputTranscriptionRef = useRef('');
  const outputTranscriptionRef = useRef('');

  // Active Floor Tracking
  const floorOccupantRef = useRef<string | null>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, currentInputTranscription, currentOutputTranscription, autoScroll]);

  useEffect(() => () => stopSession(), []);

  const stopSession = () => {
    setIsLive(false);
    setIsConnecting(false);
    setBridgeStatus('IDLE');
    
    // Disconnect audio processor first to stop data flow
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(s => { 
        try { s.close(); } catch(e) {} 
      });
      sessionPromiseRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      inputContextRef.current.close().catch(console.error);
      inputContextRef.current = null;
    }
    
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    sourcesRef.current.clear();
  };

  const startSession = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    setBridgeStatus('CONNECTING');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      // Ensure audio contexts are active (browser requirement)
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      
      const outputNode = audioCtx.createGain();
      outputNode.connect(audioCtx.destination);
      
      audioContextRef.current = audioCtx;
      inputContextRef.current = inputCtx;
      outputNodeRef.current = outputNode;

      const personaInstructions = aiParticipants.map(p => `[${p.name}]: ${p.stance || p.description}`).join('\n');
      const systemInstruction = `You are simulated participants in a GD. Roles:\n${personaInstructions}\nAlways prefix your speech with your [Name]. Candidate: ${user.name}`;

      // Use rotated key from pool
      const ai = getGeminiClient();
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsConnecting(false);
            setBridgeStatus('STABLE');
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              // Ensure we are still live before processing/sending
              if (!scriptProcessorRef.current) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
              setUserVol(Math.sqrt(sum/inputData.length));
              
              sessionPromise.then(s => {
                // Double check if session is still the active one to prevent late sending errors
                if (!isMuted && sessionPromiseRef.current === sessionPromise) {
                   try {
                     s.sendRealtimeInput({ media: createBlob(inputData) });
                   } catch (err) {
                     console.warn("Audio stream send failed (Session likely closed):", err);
                   }
                }
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decodeBase64Audio(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current!);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                  setActiveSpeaker(null);
                  floorOccupantRef.current = null;
                }
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (msg.serverContent?.interrupted) {
              interruptionCountRef.current++;
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setActiveSpeaker(null);
              floorOccupantRef.current = null;
            }

            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              const speakerMatch = text.match(/\[(.*?)\]/);
              const newSpeaker = speakerMatch ? speakerMatch[1] : activeSpeaker;

              // ADVANCED INTERRUPTION DETECTION
              if (floorOccupantRef.current && newSpeaker && floorOccupantRef.current !== newSpeaker) {
                if (sourcesRef.current.size > 0 || inputTranscriptionRef.current) {
                  interruptionCountRef.current++;
                }
              }

              outputTranscriptionRef.current += text;
              setCurrentOutputTranscription(prev => prev + text);
              if (newSpeaker) {
                setActiveSpeaker(newSpeaker);
                floorOccupantRef.current = newSpeaker;
              }
            } else if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              
              if (floorOccupantRef.current && floorOccupantRef.current !== user.name) {
                interruptionCountRef.current++;
              }

              inputTranscriptionRef.current += text;
              setCurrentInputTranscription(prev => prev + text);
              setActiveSpeaker(user.name);
              floorOccupantRef.current = user.name;
            }

            if (msg.serverContent?.turnComplete) {
              const finIn = inputTranscriptionRef.current.trim();
              const finOut = outputTranscriptionRef.current.trim();
              const newMsgs = [];
              if (finIn) newMsgs.push({ sender: user.name, text: finIn, timestamp: Date.now(), isUser: true });
              if (finOut) {
                const sMatch = finOut.match(/^\[(.*?)\]/);
                newMsgs.push({ sender: sMatch ? sMatch[1] : 'AI', text: finOut.replace(/^\[.*?\]:\s*/, ''), timestamp: Date.now(), isUser: false });
              }
              if (newMsgs.length > 0) setMessages(prev => [...prev, ...newMsgs]);
              
              // Reset accumulation refs for next turn
              inputTranscriptionRef.current = '';
              outputTranscriptionRef.current = '';
              setCurrentInputTranscription('');
              setCurrentOutputTranscription('');
            }
          },
          onerror: (e) => { 
            console.error("Live Bridge Error:", e);
            setBridgeStatus('FAULT'); 
            stopSession(); 
          },
          onclose: () => setIsLive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: sessionVoice } } },
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err: any) {
      setConnectionError(err.message);
      setBridgeStatus('FAULT');
      setIsConnecting(false);
    }
  };

  const handleEnd = () => {
    onEnd(messages, { interruptionCount: interruptionCountRef.current });
    stopSession();
  };

  const allParticipants = useMemo(() => [
    { id: 'user', name: user.name, role: 'CANDIDATE', avatar: user.avatar, isAI: false, gender: 'MALE', voiceName: 'Zephyr' },
    ...aiParticipants
  ], [user, aiParticipants]);

  const getParticipantStyle = (index: number) => {
    const total = allParticipants.length;
    const rx = 38; 
    const ry = 30;
    const angle = (index / total) * (2 * Math.PI) - Math.PI / 2;
    const x = 50 + rx * Math.cos(angle);
    const y = 50 + ry * Math.sin(angle);
    return { left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%)`, zIndex: Math.round(y * 10) };
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex bg-slate-50 relative overflow-hidden">
      <div className={`flex-1 relative flex items-center justify-center p-8 transition-all duration-1000 order-2 lg:order-1 ${sidebarOpen ? 'lg:pr-[500px]' : ''}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_70%)]"></div>
        
        <div className="absolute top-8 left-8 flex flex-col gap-4 z-[100] w-full max-w-[320px]">
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${bridgeStatus === 'STABLE' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Neural Sync</span>
              </div>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Interrupted: {interruptionCountRef.current}</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[9px] font-black text-white/30 uppercase tracking-widest">
                 <span>Confidence</span>
                 <span className="text-indigo-400">{userConfidence}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${userConfidence}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full h-full max-w-7xl max-h-[850px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-slate-200 bg-white/30 backdrop-blur-3xl flex flex-col items-center justify-center text-center">
             {!isLive && !isConnecting ? (
               <button onClick={startSession} className="w-48 h-48 bg-slate-900 text-white rounded-[4rem] flex flex-col items-center justify-center gap-4 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 group">
                 <i className="fa-solid fa-microphone text-4xl group-hover:scale-110 transition-transform"></i>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Initialize Arena</span>
               </button>
             ) : (
               <div className="relative flex flex-col items-center">
                 <div className="w-32 h-32 border-[4px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Capturing Dynamics...</h4>
               </div>
             )}
          </div>

          {allParticipants.map((p, idx) => {
            const isSpeaking = activeSpeaker?.toLowerCase().includes(p.name.split(' ')[0].toLowerCase());
            const isUser = p.id === 'user';
            const pulseScale = isUser && isSpeaking ? 1 + userVol * 1.5 : (isSpeaking ? 1.15 : 1);
            
            return (
              <div key={p.id} style={getParticipantStyle(idx)} className="absolute transition-all duration-700">
                <div className="flex flex-col items-center">
                  <div className={`relative transition-all duration-500 ${isSpeaking ? 'z-50' : ''}`} style={{ transform: `scale(${pulseScale})` }}>
                    <div className={`relative w-28 h-28 lg:w-48 lg:h-48 rounded-[4.5rem] p-1.5 bg-white border-2 shadow-2xl transition-all duration-500 overflow-hidden ${isSpeaking ? 'border-indigo-500 ring-[15px] ring-indigo-500/10' : 'border-slate-100'} ${activeSpeaker && !isSpeaking ? 'opacity-30 grayscale blur-[2px]' : 'opacity-100'}`}>
                      <img src={p.avatar} className="w-full h-full rounded-[4rem] object-cover" alt={p.name} />
                      {isSpeaking && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end justify-center gap-1 h-12 w-32 px-4 bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-white/20">
                          {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%` }}></div>)}
                        </div>
                      )}
                    </div>
                    {isSpeaking && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 rounded-full shadow-lg z-50">
                         <span className="text-[8px] font-black text-white uppercase tracking-widest whitespace-nowrap">Speaking</span>
                      </div>
                    )}
                  </div>
                  <div className={`mt-6 px-6 py-3 rounded-2xl border bg-white/95 backdrop-blur-3xl shadow-xl transition-all ${isSpeaking ? 'border-indigo-400 -translate-y-2' : 'border-slate-50 opacity-60'}`}>
                    <span className={`text-[13px] font-black uppercase tracking-widest ${isSpeaking ? 'text-indigo-600' : 'text-slate-900'}`}>{p.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isLive && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-slate-900 border border-white/10 px-12 py-8 rounded-[4rem] shadow-2xl z-[150] animate-fade-in-up">
            <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-lg`}></i>
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${sidebarOpen ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <i className="fa-solid fa-message-lines text-lg"></i>
            </button>
            <div className="h-10 w-[1px] bg-white/10 mx-2"></div>
            <button onClick={handleEnd} className="bg-white text-slate-900 px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-rose-500 hover:text-white transition-all shadow-xl">End Session</button>
          </div>
        )}
      </div>

      <div className={`fixed inset-y-0 right-0 lg:absolute lg:flex flex-col bg-white border-l border-slate-100 shadow-2xl z-[180] transition-all duration-700 ${sidebarOpen ? 'w-[500px]' : 'w-0 translate-x-full'}`}>
        <div className="p-10 border-b border-slate-50 flex items-center justify-between min-w-[500px]">
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Live Transcript Stream</h3>
            <button onClick={() => setAutoScroll(!autoScroll)} className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all ${autoScroll ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
               Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
            </button>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"><i className="fa-solid fa-xmark"></i></button>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar bg-slate-50/10 min-w-[500px]">
          {messages.map((m, idx) => {
            const isSpeakingNow = activeSpeaker?.toLowerCase().includes(m.sender.split(' ')[0].toLowerCase());
            return (
              <div key={idx} className={`flex flex-col ${m.isUser ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 px-3 ${m.isUser ? 'text-indigo-600' : (isSpeakingNow ? 'text-indigo-500 scale-110' : 'text-slate-300')}`}>
                  {m.sender} {isSpeakingNow && '• SPEAKING'}
                </span>
                <div className={`p-10 rounded-[3rem] text-[14px] font-bold leading-relaxed max-w-[90%] shadow-xl border transition-all ${m.isUser ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            );
          })}
          
          {(currentInputTranscription || currentOutputTranscription) && (
            <div className={`flex flex-col ${currentInputTranscription ? 'items-end' : 'items-start'} animate-pulse`}>
               <div className="flex items-center gap-3 mb-2 px-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{activeSpeaker || 'Speaker'} is speaking...</span>
               </div>
               <div className="p-8 bg-white border-2 border-indigo-100 rounded-[2rem] text-[13px] font-medium max-w-[85%] italic shadow-md">
                 {currentInputTranscription || currentOutputTranscription}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionView;
