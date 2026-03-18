
import React, { useState, useEffect } from 'react';
import { UserApiKey } from '../types';

interface KeyManagementProps {
  onBack: () => void;
}

const KEY_STORAGE_NAME = 'arena_user_keys';

const KeyManagement: React.FC<KeyManagementProps> = ({ onBack }) => {
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(KEY_STORAGE_NAME);
    if (stored) {
      try {
        setKeys(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load keys", e);
      }
    }
  }, []);

  const showNotify = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveKeys = (updatedKeys: UserApiKey[]) => {
    setKeys(updatedKeys);
    localStorage.setItem(KEY_STORAGE_NAME, JSON.stringify(updatedKeys));
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    if (keys.some(k => k.key === newKey.trim())) {
      showNotify('error', 'Key already exists in the matrix.');
      return;
    }

    const keyObj: UserApiKey = {
      id: crypto.randomUUID(),
      key: newKey.trim(),
      label: newLabel.trim() || `Neural Link ${keys.length + 1}`,
      isActive: true,
      isDefault: keys.length === 0, // First key is default
      addedAt: Date.now()
    };

    saveKeys([...keys, keyObj]);
    setNewKey('');
    setNewLabel('');
    showNotify('success', 'Uplink synchronized.');
  };

  const handleBulkAdd = () => {
    const lines = bulkInput.split('\n').filter(l => l.trim());
    const newKeys: UserApiKey[] = [];
    
    lines.forEach((line, idx) => {
      const k = line.trim();
      if (k && !keys.some(existing => existing.key === k)) {
        newKeys.push({
          id: crypto.randomUUID(),
          key: k,
          label: `Bulk Link ${keys.length + idx + 1}`,
          isActive: true,
          isDefault: keys.length === 0 && idx === 0,
          addedAt: Date.now()
        });
      }
    });

    if (newKeys.length > 0) {
      saveKeys([...keys, ...newKeys]);
      setBulkInput('');
      setBulkMode(false);
      showNotify('success', `${newKeys.length} links established.`);
    } else {
      showNotify('error', 'No new valid keys found in input.');
    }
  };

  const handleDeleteKey = (id: string) => {
    const updated = keys.filter(k => k.id !== id);
    // If we deleted the default, set a new one
    if (keys.find(k => k.id === id)?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    saveKeys(updated);
    showNotify('success', 'Uplink severed.');
  };

  const toggleKeyStatus = (id: string) => {
    saveKeys(keys.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));
  };

  const setAsDefault = (id: string) => {
    saveKeys(keys.map(k => ({
      ...k,
      isDefault: k.id === id,
      isActive: k.id === id ? true : k.isActive // Default key should be active
    })));
    showNotify('success', 'Primary bridge assigned.');
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-8 animate-fade-in-up pb-32">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl z-[1000] animate-bounce text-[10px] font-black uppercase tracking-widest border transition-all ${
          notification.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
        }`}>
          <i className={`fa-solid ${notification.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} mr-2`}></i>
          {notification.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic mb-3">
            Neural <span className="text-indigo-600">Quota</span> Bridge
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] max-w-xl leading-relaxed">
            Configure your API rotation pool. The engine automatically balances requests across all active keys to maximize throughput and bypass individual rate limits.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setBulkMode(!bulkMode)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              bulkMode ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-600'
            }`}
          >
            <i className="fa-solid fa-list-check mr-2"></i> Bulk Sync
          </button>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Arena Return
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 sticky top-24">
            {bulkMode ? (
              <div className="animate-fade-in-up">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-8 flex items-center gap-3">
                  <i className="fa-solid fa-layer-group"></i> Mass Uplink Protocol
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-6 tracking-widest leading-relaxed">Paste multiple keys (one per line) for rapid deployment.</p>
                <textarea 
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="AIzaSy...&#10;AIzaSy...&#10;AIzaSy..."
                  className="w-full h-48 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none font-mono text-xs transition-all mb-6 resize-none"
                />
                <div className="flex gap-4">
                  <button 
                    onClick={handleBulkAdd}
                    className="flex-1 py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-lg shadow-indigo-100 hover:bg-slate-900 transition-all text-[10px]"
                  >
                    Sync Matrix
                  </button>
                  <button 
                    onClick={() => setBulkMode(false)}
                    className="px-6 py-5 bg-slate-100 text-slate-500 font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-200 transition-all text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in-up">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Manual Link Setup</h3>
                <form onSubmit={handleAddKey} className="space-y-8">
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest group-focus-within:text-indigo-600 transition-colors">Strategic Label</label>
                    <input 
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. Tier-1 Placement Pool"
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none font-black text-xs transition-all"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest group-focus-within:text-indigo-600 transition-colors">Gemini API String</label>
                    <input 
                      type="password"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none font-mono text-xs transition-all"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-[0.5em] rounded-3xl shadow-2xl hover:bg-indigo-600 transition-all text-[10px] flex items-center justify-center gap-3"
                  >
                    Establish Link <i className="fa-solid fa-plus text-[8px]"></i>
                  </button>
                </form>
              </div>
            )}
            
            <div className="mt-12 p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100/30">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-shield-halved"></i> Key Isolation
              </h4>
              <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">
                All keys reside exclusively in your local storage matrix. They never traverse our servers and are only utilized for direct peer-to-peer cognitive requests.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Tactical Key Pool ({keys.length})</h3>
              <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {keys.filter(k => k.isActive).length} Active Channels
              </span>
            </div>
            
            {keys.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3.5rem] p-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                  <i className="fa-solid fa-key text-slate-300 text-2xl"></i>
                </div>
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[11px] mb-2">Zero Active Links</p>
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Connect a key to enable the Neural Engine.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {keys.map((k) => (
                  <div key={k.id} className={`bg-white border p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all flex items-center justify-between group relative overflow-hidden ${
                    k.isActive ? 'border-slate-100' : 'border-slate-50 opacity-60 grayscale-[50%]'
                  }`}>
                    {k.isDefault && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                    )}
                    
                    <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-sm ${
                        k.isActive ? (k.isDefault ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-indigo-600') : 'bg-slate-50 text-slate-400'
                      }`}>
                        <i className={`fa-solid ${k.isDefault ? 'fa-star' : 'fa-key'} text-lg`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className={`text-sm font-black uppercase tracking-tight ${k.isActive ? 'text-slate-900' : 'text-slate-400'}`}>{k.label}</h4>
                          {k.isDefault && <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase border border-indigo-100">Primary</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          <code className="text-[11px] font-mono text-slate-400 tracking-wider">{maskKey(k.key)}</code>
                          <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Added {new Date(k.addedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {!k.isDefault && (
                        <button 
                          onClick={() => setAsDefault(k.id)}
                          className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                          title="Set as Primary"
                        >
                          <i className="fa-solid fa-star-of-david"></i>
                        </button>
                      )}
                      <button 
                        onClick={() => toggleKeyStatus(k.id)}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${
                          k.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                        }`}
                        title={k.isActive ? 'Deactivate Uplink' : 'Restore Uplink'}
                      >
                        <i className={`fa-solid ${k.isActive ? 'fa-toggle-on' : 'fa-toggle-off'} text-lg`}></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteKey(k.id)}
                        className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-slate-300 flex items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                        title="Sever Connection"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="p-8 bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
               <div className="flex items-start gap-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                     <i className="fa-solid fa-microchip text-indigo-400"></i>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-2 italic">Neural Load Balancing</h5>
                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed tracking-widest">
                      The engine cycles through your active keys using a <span className="text-indigo-400">Weighted Stochastic Switch</span>. If any key hits a quota ceiling (429), it's temporarily sidelined, and the system automatically reroutes cognitive load to the next available project uplink.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyManagement;
