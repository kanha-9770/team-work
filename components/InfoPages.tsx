
import React from 'react';

interface InfoPagesProps {
  type: 'about' | 'services';
  onAction: () => void;
}

const InfoPages: React.FC<InfoPagesProps> = ({ type, onAction }) => {
  if (type === 'about') {
    return (
      <div className="bg-white">
        <section className="max-w-7xl mx-auto px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
               <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600 mb-6">Our Vision</h2>
               <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-8">
                  WE BELIEVE IN THE <br />
                  <span className="text-indigo-600 italic">ART OF DEBATE.</span>
               </h1>
               <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                  ArenaGD was founded by a team of Ivy League behavioral psychologists and Google AI engineers. Our mission is to democratize high-end corporate training that was previously only available to the C-suite.
               </p>
               <div className="grid grid-cols-2 gap-8 mb-12">
                  <div>
                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">10M+</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Processed Tokens</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">5K+</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Simulations</p>
                  </div>
               </div>
               <button onClick={onAction} className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl">Start Your Journey</button>
            </div>
            <div className="relative h-[600px] bg-slate-50 rounded-[4rem] border border-slate-100 p-12 overflow-hidden shadow-inner">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-100 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
               <div className="relative z-10 space-y-8">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-fade-in-up" style={{ animationDelay: `${i*0.2}s` }}>
                       <div className="w-10 h-10 bg-indigo-50 rounded-xl mb-4 flex items-center justify-center"><i className="fa-solid fa-lightbulb text-indigo-600"></i></div>
                       <h5 className="font-bold text-slate-900 mb-2">Principle {i}</h5>
                       <p className="text-xs text-slate-500 leading-relaxed">Advanced neural heuristics applied to human behavioral modeling.</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="max-w-7xl mx-auto px-8 py-24">
         <div className="text-center mb-24">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600 mb-4">Our Services</h2>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">ENGINEERED SUCCESS.</h1>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Neural GD Prep', desc: 'Standard AI boardroom simulation with feedback.', price: 'Free' },
              { title: 'Corporate Training', desc: 'Custom personas modeled after your specific company culture.', price: '$49/mo' },
              { title: 'Elite Admissions', desc: 'Case-study focus for Harvard, INSEAD, and IIM aspirants.', price: '$99/mo' },
              { title: 'API Integration', desc: 'Embed the ArenaGD engine into your own hiring platform.', price: 'Custom' },
              { title: 'Semantic Analytics', desc: 'Deep dive reports on word choice, tone, and confidence.', price: '$19/mo' },
              { title: '1-on-1 AI Mentor', desc: 'Personalized AI coaching sessions based on history.', price: '$39/mo' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-[2.5rem] p-10 hover:shadow-2xl transition-all group flex flex-col justify-between hover:-translate-y-2">
                 <div>
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                          <i className="fa-solid fa-layer-group text-indigo-600 group-hover:text-white"></i>
                       </div>
                       <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">{s.price}</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-4">{s.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                 </div>
                 <button className="mt-12 text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b-2 border-transparent hover:border-indigo-600 transition-all w-fit">Learn More</button>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default InfoPages;
