
import React, { useState } from 'react';
import { TOPICS } from '../constants';

interface TopicSelectionProps {
  onSelect: (topic: { title: string; context: string }) => void;
  onGenerateDynamic: (keywords: string) => void;
  isGenerating: boolean;
}

const TopicSelection: React.FC<TopicSelectionProps> = ({ onSelect, onGenerateDynamic, isGenerating }) => {
  const [keywords, setKeywords] = useState('');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-6xl font-black tracking-tighter text-slate-900 leading-[0.85] mb-4">
            CHOOSE YOUR <span className="text-indigo-600">MISSION.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl">
            Select a verified discussion prompt or prompt our AI to synthesize a bespoke socio-economic scenario.
          </p>
        </div>
        
        <div className="w-full md:w-[400px] bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Neural Agenda Synthesis</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Concepts (e.g. Web3, India, Law)"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:border-indigo-600 outline-none font-medium"
            />
            <button 
              onClick={() => onGenerateDynamic(keywords)}
              disabled={isGenerating || !keywords}
              className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-slate-900 transition-all disabled:opacity-20"
            >
              <i className="fa-solid fa-sparkles text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelect(topic)}
            className="group text-left bg-white border border-slate-200 p-8 rounded-[2rem] hover:border-indigo-600 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 flex flex-col justify-between min-h-[340px]"
          >
            <div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i className="fa-solid fa-file-contract text-sm"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{topic.title}</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-4 font-medium uppercase tracking-wide opacity-70">{topic.context}</p>
            </div>
            <div className="pt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
              Initiate Discussion <i className="fa-solid fa-chevron-right text-[8px]"></i>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicSelection;
