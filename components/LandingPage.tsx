
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="bg-white overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative px-8 pt-24 pb-48 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Large Decorative Circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[900px] h-[900px] bg-indigo-50/50 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Floating Abstract Shapes */}
        <div className="absolute top-40 left-10 w-32 h-32 bg-indigo-600/5 rounded-[3rem] rotate-12 hidden lg:block animate-bounce opacity-50" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border-[1px] border-indigo-100 rounded-[4rem] -rotate-12 hidden lg:block animate-pulse opacity-40"></div>
        <div className="absolute top-20 right-[15%] w-12 h-12 bg-slate-900/[0.03] rounded-full hidden lg:block animate-spin" style={{ animationDuration: '10s' }}></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-50/80 backdrop-blur-md rounded-full border border-indigo-100 mb-10 animate-fade-in-up">
            <div className="flex -space-x-2">
               {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-indigo-50 bg-slate-200"></div>)}
            </div>
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Global Elite Evaluation Index</span>
          </div>
          
          <h1 className="text-6xl md:text-[8.5rem] font-black tracking-tighter text-slate-900 leading-[0.8] mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            ENGINEERED <br />
            <span className="text-indigo-600 italic">CONVERSATION.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mb-16 mx-auto animate-fade-in-up font-medium leading-relaxed" style={{ animationDelay: '0.2s' }}>
            The world's first <span className="text-slate-900 font-bold underline decoration-indigo-600/30 underline-offset-8">Neural Arena</span>. Master high-stakes corporate discussions through high-fidelity AI simulations that respond, react, and reject.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={onStart}
              className="px-14 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-200 text-sm flex items-center justify-center gap-4 group"
            >
              Initiate Simulation
              <i className="fa-solid fa-chevron-right text-[10px] group-hover:translate-x-2 transition-transform"></i>
            </button>
            <button className="px-14 py-6 bg-white border border-slate-200 text-slate-600 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-sm">
              Watch Intelligence Replay
            </button>
          </div>
        </div>
      </section>

      {/* The Pillars: What, Why, How */}
      <section className="relative bg-slate-50 py-48 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          {/* Section 1: WHAT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center mb-48">
             <div className="relative group">
                <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-100 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-6">01. The Concept</h2>
                <h3 className="text-6xl font-black tracking-tighter text-slate-900 leading-tight mb-8">
                  <span className="text-indigo-600">WHAT</span> IS ARENAGD?
                </h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10">
                  ArenaGD is a <span className="text-slate-900 font-bold">social synthesis engine</span>. We use the Gemini 2.5 Live API to build an auditory bridge between you and four distinct neural personalities. It simulates the chaos of a real placement-style group discussion.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {[
                     { l: 'Binaural Audio Link', i: 'fa-headset' },
                     { l: 'Semantic Latency <200ms', i: 'fa-bolt' },
                     { l: '100+ Persona Profiles', i: 'fa-brain' },
                     { l: 'Live Stress Calibration', i: 'fa-gauge-high' }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><i className={`fa-solid ${item.i} text-indigo-600 text-xs`}></i></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item.l}</span>
                     </div>
                   ))}
                </div>
             </div>
             <div className="relative p-12 bg-white rounded-[4rem] shadow-2xl border border-slate-200 overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600 opacity-[0.03]"></div>
                {/* SVG Visual Illustration of "What" */}
                <div className="relative h-[300px] flex items-center justify-center">
                   <div className="w-48 h-48 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
                         <i className="fa-solid fa-microchip text-4xl text-indigo-600"></i>
                      </div>
                   </div>
                   {/* Orbiting Points */}
                   {[0, 90, 180, 270].map(a => (
                     <div 
                        key={a}
                        className="absolute w-12 h-12 bg-white border border-slate-200 rounded-2xl shadow-lg flex items-center justify-center animate-[spin_10s_linear_infinite]"
                        style={{ transform: `rotate(${a}deg) translate(140px) rotate(-${a}deg)` }}
                     >
                        <i className="fa-solid fa-user-ninja text-slate-400 text-sm"></i>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Section 2: WHY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
             <div className="order-2 lg:order-1 relative p-12 bg-slate-900 rounded-[4rem] shadow-2xl overflow-hidden min-h-[450px] flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.3),transparent_70%)]"></div>
                <div className="relative z-10 space-y-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-500 animate-pulse"></div>
                      <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 w-[70%]"></div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-3xl backdrop-blur-md">
                         <p className="text-white font-bold text-lg mb-2 italic">"Candidate shows 85% confidence under inter-AI pressure."</p>
                         <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Real-time Inference</div>
                      </div>
                      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-3xl opacity-50">
                         <div className="h-4 w-48 bg-slate-700 rounded-full"></div>
                      </div>
                   </div>
                </div>
             </div>
             <div className="order-1 lg:order-2">
                <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-6">02. The Advantage</h2>
                <h3 className="text-6xl font-black tracking-tighter text-slate-900 leading-tight mb-8">
                  <span className="text-indigo-600">WHY</span> ARENAGD?
                </h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10">
                  Social intelligence is the modern currency. In an era of AI, the ability to <span className="text-slate-900 font-bold">persuade, pivot, and perform</span> in a human group setting is rare. We build the pressure, so you build the skill.
                </p>
                <div className="flex gap-4">
                   <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
                      <div className="text-4xl font-black tracking-tighter mb-2">92%</div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Delta</div>
                   </div>
                   <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] text-slate-900 shadow-sm">
                      <div className="text-4xl font-black tracking-tighter mb-2">100+</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Behavioral Metrics</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Shapes & Feature Illustration Grid */}
      <section className="py-48 max-w-7xl mx-auto px-8 relative">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] opacity-30"></div>
         
         <div className="text-center mb-32 relative z-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600 mb-6">The Platform Matrix</h2>
            <h3 className="text-7xl font-black text-slate-900 tracking-tighter italic">REDEFINING PREP.</h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
            {[
              { title: 'Neural Radar', desc: 'Visualize your performance on a 5-axis intelligence radar with micro-precision.', icon: 'fa-compass', shape: 'rounded-tl-[5rem]' },
              { title: 'Social HUD', desc: 'Track social pressure, participant volume, and floor control in real-time.', icon: 'fa-layer-group', shape: '' },
              { title: 'Voice Signature', desc: 'Advanced audio analysis for tone, pitch variability, and articulation levels.', icon: 'fa-waveform-lines', shape: 'rounded-tr-[5rem]' },
              { title: 'Conflict Matrix', desc: 'AI participants are hard-coded with biases to trigger debate and conflict.', icon: 'fa-bolt-lightning', shape: 'rounded-bl-[5rem]' },
              { title: 'Strategic Replay', desc: 'Review transcripts with AI-suggested ideal responses for every pivot.', icon: 'fa-arrow-rotate-left', shape: '' },
              { title: 'Global Benchmarks', desc: 'Rank against world-class candidates from Ivy League and top-tier corporations.', icon: 'fa-earth-americas', shape: 'rounded-br-[5rem]' },
            ].map((f, i) => (
              <div key={i} className={`group p-12 bg-white border border-slate-100 hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-600/5 transition-all duration-500 ${f.shape}`}>
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-indigo-600 transition-all duration-500">
                    <i className={`fa-solid ${f.icon} text-xl text-slate-400 group-hover:text-white transition-colors`}></i>
                 </div>
                 <h4 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{f.title}</h4>
                 <p className="text-slate-500 text-md leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* CTA: Join the Elite */}
      <section className="bg-slate-900 py-48 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.2),transparent_60%)]"></div>
        
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.8] mb-12 italic">
            READY TO FACE <br />
            <span className="text-indigo-500">THE ARENA?</span>
          </h2>
          <button 
            onClick={onStart}
            className="px-16 py-8 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all shadow-2xl shadow-indigo-900/40 text-lg flex items-center justify-center gap-4 mx-auto group"
          >
            Create My Simulation Identity
            <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
          </button>
          <p className="mt-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Zero setup required. Neural bridge links in 1.2s.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
