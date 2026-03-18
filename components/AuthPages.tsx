
import React, { useState } from 'react';

interface AuthPagesProps {
  mode: 'login' | 'signin';
  onAuthSuccess: () => void;
  onToggle: () => void;
}

const AuthPages: React.FC<AuthPagesProps> = ({ mode, onAuthSuccess, onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    onAuthSuccess();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-30"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl relative z-10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
             <i className={`fa-solid ${mode === 'login' ? 'fa-unlock-keyhole' : 'fa-user-plus'} text-white`}></i>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
            {mode === 'login' ? 'Arena Access' : 'Create Identity'}
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
            {mode === 'login' ? 'Sync your credentials' : 'Join the elite preparation network'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signin' && (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">Full Name</label>
              <input 
                type="text" 
                placeholder="Jane Cooper"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-semibold transition-all"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@executive.com"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-semibold transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">Secure Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-semibold transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white font-black uppercase tracking-[0.4em] py-5 rounded-2xl shadow-xl hover:bg-slate-900 transition-all text-xs"
          >
            {mode === 'login' ? 'Authenticate' : 'Initiate Profile'}
          </button>
        </form>

        <div className="mt-8 text-center">
           <button onClick={onToggle} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
              {mode === 'login' ? "Don't have an identity? Sign Up" : "Already registered? Log In"}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
