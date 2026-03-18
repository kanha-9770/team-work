
import React, { useState } from 'react';
import { EvaluationReport } from '../types';
import RadarChart from './RadarChart';

interface FeedbackReportProps {
  report: EvaluationReport;
  onRestart: () => void;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ report, onRestart }) => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'STRATEGY' | 'SENTIMENT'>('ANALYTICS');

  const scores = report?.scores || {
    contentLogic: 0,
    communicationSkills: 0,
    confidenceAssertiveness: 0,
    listeningResponse: 0,
    leadershipPotential: 0
  };

  const radarData = [
    { label: 'LOGIC', value: scores.contentLogic },
    { label: 'SPEECH', value: scores.communicationSkills },
    { label: 'ASSERT', value: scores.confidenceAssertiveness },
    { label: 'LISTEN', value: scores.listeningResponse },
    { label: 'LEAD', value: scores.leadershipPotential }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-8">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Mission Debugging Complete</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.85] mb-8 uppercase italic">
                STRATEGIC <br /><span className="text-indigo-600">DEBRIEF.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed italic">"{report?.executiveVerdict || 'No summary available.'}"</p>
            </div>
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <button 
                onClick={() => setActiveTab('ANALYTICS')}
                className={`px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'ANALYTICS' ? 'bg-slate-900 text-white shadow-2xl' : 'bg-slate-50 text-slate-400 hover:text-slate-900'}`}
              >
                Analytics
              </button>
              <button 
                onClick={() => setActiveTab('SENTIMENT')}
                className={`px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'SENTIMENT' ? 'bg-slate-900 text-white shadow-2xl' : 'bg-slate-50 text-slate-400 hover:text-slate-900'}`}
              >
                Sentiment Map
              </button>
              <button 
                onClick={() => setActiveTab('STRATEGY')}
                className={`px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'STRATEGY' ? 'bg-slate-900 text-white shadow-2xl' : 'bg-slate-50 text-slate-400 hover:text-slate-900'}`}
              >
                Strategy Pivot
              </button>
              <button 
                onClick={onRestart}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-20">
        {activeTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-[3.5rem] p-12 shadow-sm relative overflow-hidden h-full">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-16">Executive Competency Radar</h3>
                <div className="w-full aspect-square max-w-[500px] mx-auto">
                   <RadarChart data={radarData} size={500} color="#4f46e5" />
                </div>
                <div className="grid grid-cols-5 gap-6 mt-16 pt-12 border-t border-slate-50">
                   {radarData.map((d, i) => (
                     <div key={i} className="text-center">
                        <div className="text-3xl font-black text-slate-900 mb-2">{d.value}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{d.label}</div>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-8">
               <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl flex items-center justify-between">
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Interruption Density</h3>
                    <div className="text-4xl font-black text-white">{report.interruptionCount || 0}</div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-1">Total Occurrences</p>
                 </div>
                 <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <i className="fa-solid fa-bolt-auto text-indigo-400 text-2xl"></i>
                 </div>
               </div>

               <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-10">Elite Strengths</h3>
                 <ul className="space-y-6">
                   {(report?.strengths || []).map((s, i) => (
                     <li key={i} className="flex items-start gap-5 group animate-fade-in-up">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                        <span className="text-[13px] font-bold leading-relaxed">{s}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-10">Critical Deltas</h3>
                 <ul className="space-y-6">
                   {(report?.weaknesses || []).map((w, i) => (
                     <li key={i} className="flex items-start gap-5 group animate-fade-in-up">
                        <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                        <span className="text-[13px] font-bold text-slate-700 leading-relaxed">{w}</span>
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'SENTIMENT' && (
          <div className="space-y-12 animate-fade-in">
             <div className="bg-white border border-slate-200 rounded-[3.5rem] p-12 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-12">Emotional Architecture</h3>
                
                {report?.sentimentAnalysis && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                     <div className="p-8 bg-indigo-600 text-white rounded-[3rem] shadow-xl">
                        <div className="text-4xl font-black mb-2 italic uppercase tracking-tighter">{report.sentimentAnalysis.dominantSentiment}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Dominant Sentiment</div>
                     </div>
                     <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-xl">
                        <div className="text-4xl font-black mb-2">{report.sentimentAnalysis.emotionalStability}/10</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Stability Index</div>
                     </div>
                     <div className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
                        <div className="text-lg font-bold text-slate-800 leading-tight mb-2 italic">"{report.sentimentAnalysis.tone}"</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tone Inference</div>
                     </div>
                  </div>
                )}

                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10">Turn-by-Turn Sentiment Map</h4>
                <div className="flex flex-wrap gap-4">
                   {(report?.sentimentAnalysis?.sentimentOverTime || []).map((turn, i) => (
                     <div key={i} className="flex flex-col items-center gap-3 p-6 bg-slate-50 border border-slate-100 rounded-3xl min-w-[120px] transition-all hover:bg-white hover:shadow-xl hover:-translate-y-2">
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Turn {turn.turn || i+1}</div>
                        <div className="text-xl font-black text-indigo-600 italic tracking-tighter uppercase">{turn.sentiment}</div>
                     </div>
                   ))}
                   {(!report?.sentimentAnalysis?.sentimentOverTime || report.sentimentAnalysis.sentimentOverTime.length === 0) && (
                     <p className="text-slate-400 text-xs italic">Temporal sentiment data not captured in this session.</p>
                   )}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'STRATEGY' && (
          <div className="space-y-12 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white border border-slate-200 rounded-[3.5rem] p-12 shadow-sm">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-12">Strategic Analysis</h3>
                   <p className="text-xl text-slate-800 font-bold italic leading-relaxed mb-10">"{report?.overallSummary}"</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-[3.5rem] p-12 shadow-sm">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-12">Missed Opportunities</h3>
                   <div className="space-y-6">
                      {(report?.missedOpportunities || []).map((mo, i) => (
                        <div key={i} className="flex gap-6 p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition-all">
                           <p className="text-[12px] font-bold text-slate-600 italic leading-relaxed">{mo}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-16 text-center">Optimal Tactical Responses</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {(report?.sampleResponses || []).map((sr, i) => (
                     <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] relative group">
                        <p className="text-[15px] font-bold text-white italic leading-relaxed">"{sr}"</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-32 text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.8em]">Arena Neural Verdict Generation Complete</p>
      </div>
    </div>
  );
};

export default FeedbackReport;
