import { useState, useRef, useEffect } from 'react';
import { Send, Radio, MessageSquare, AlignLeft } from 'lucide-react';
import { SimBridge } from '../bridge';
import type { HoppieMessage, HoppieLog } from '../types';
import { pushToast } from './ToastOverlay';

interface Props {
  messages: HoppieMessage[];
  logs: HoppieLog[];
  callsign: string;
}

export default function HoppiePanel({ messages, logs, callsign }: Props) {
  const [activeTab, setActiveTab] = useState<'telex' | 'cpdlc' | 'stations' | 'logs'>('telex');
  
  // Telex state
  const [telexRecipient, setTelexRecipient] = useState('');
  const [telexMessage, setTelexMessage] = useState('');
  
  // CPDLC state
  const [cpdlcRecipient, setCpdlcRecipient] = useState('');
  const [cpdlcMessage, setCpdlcMessage] = useState('');

  // Online stations state
  const [onlineAtc, setOnlineAtc] = useState<string[]>([]);
  const [onlineCallsigns, setOnlineCallsigns] = useState<string[]>([]);
  const [refreshingStations, setRefreshingStations] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Initialize Hoppie on mount
  useEffect(() => {
    SimBridge.initializeHoppie();
  }, []);

  // Listen for station results
  useEffect(() => {
    const removeListener = window.chrome?.webview?.addEventListener('message', (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data.type === 'hoppieAtcResult') {
          setOnlineAtc(data.atc || []);
          setRefreshingStations(false);
        } else if (data.type === 'hoppieCallsignsResult') {
          setOnlineCallsigns(data.callsigns || []);
          setRefreshingStations(false);
        } else if (data.type === 'hoppieError') {
          pushToast('danger', data.message || 'Hoppie initialization failed');
          setRefreshingStations(false);
        }
      } catch { }
    });

    return () => {
      if (removeListener) window.chrome?.webview?.removeEventListener('message', removeListener as any);
    };
  }, []);

  // Auto-refresh stations when stations tab is opened
  useEffect(() => {
    if (activeTab === 'stations') {
      handleRefreshStations();
    }
  }, [activeTab]);

  const handleRefreshStations = () => {
    setRefreshingStations(true);
    SimBridge.getHoppieAtc();
    SimBridge.getHoppieCallsigns();
  };

  const handleSendTelex = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telexRecipient.trim() || !telexMessage.trim()) return;
    
    SimBridge.sendTelex(telexRecipient.trim().toUpperCase(), telexMessage.trim());
    setTelexMessage(''); // Clear input but keep recipient
    pushToast('info', `Sending Telex to ${telexRecipient.toUpperCase()}...`);
  };

  const handleSendCpdlc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpdlcRecipient.trim() || !cpdlcMessage.trim()) return;
    
    SimBridge.sendCpdlc(cpdlcRecipient.trim().toUpperCase(), cpdlcMessage.trim());
    setCpdlcMessage('');
    pushToast('info', `Sending CPDLC to ${cpdlcRecipient.toUpperCase()}...`);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-white/[0.04] overflow-hidden">
      {/* Header & Tabs */}
      <div className="shrink-0 bg-white/[0.02] border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.02]">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Radio size={16} className="animate-pulse" />
            <h3>HOPPIE ACARS / CPDLC</h3>
          </div>
          <div className="text-[10px] font-mono text-gray-500 tracking-wider">
            LOGON: <span className="text-white">{callsign || 'N/A'}</span>
          </div>
        </div>
        <div className="flex px-2">
          {(['telex', 'cpdlc', 'stations', 'logs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === tab 
                  ? 'border-cyan-400 text-cyan-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'telex' ? 'TELEX' : tab === 'cpdlc' ? 'CPDLC' : tab === 'stations' ? 'ONLINE' : 'COMM LOGS'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* TELEX TAB */}
        {activeTab === 'telex' && (
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.filter(m => m.messageType === 'telex').length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <MessageSquare size={32} className="mb-2 opacity-50" />
                  <p className="text-xs font-mono">No telex messages</p>
                </div>
              ) : (
                messages.filter(m => m.messageType === 'telex').slice().reverse().map(msg => (
                  <div key={msg.messageId} className={`flex flex-col ${msg.isInbound ? 'items-start' : 'items-end'}`}>
                    <div className="text-[9px] text-gray-500 font-mono mb-1 px-1">
                      {msg.isInbound ? msg.from : 'You'} • {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                    <div className={`px-3 py-2 rounded-lg max-w-[85%] font-mono text-sm ${
                      msg.isInbound 
                        ? 'bg-white/10 text-white rounded-tl-none border border-white/5' 
                        : 'bg-cyan-500/20 text-cyan-50 border border-cyan-500/30 rounded-tr-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendTelex} className="shrink-0 p-3 bg-black/40 border-t border-white/[0.04]">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={telexRecipient}
                  onChange={e => setTelexRecipient(e.target.value)}
                  placeholder="TO (e.g. BAW123)" 
                  className="w-24 px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500 uppercase"
                />
                <input 
                  type="text" 
                  value={telexMessage}
                  onChange={e => setTelexMessage(e.target.value)}
                  placeholder="Message..." 
                  className="flex-1 px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <button 
                  type="submit"
                  disabled={!telexRecipient || !telexMessage}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Send size={14} /> Send
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CPDLC TAB */}
        {activeTab === 'cpdlc' && (
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.filter(m => m.messageType === 'cpdlc').length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <AlignLeft size={32} className="mb-2 opacity-50" />
                  <p className="text-xs font-mono">No CPDLC clearances</p>
                </div>
              ) : (
                messages.filter(m => m.messageType === 'cpdlc').slice().reverse().map(msg => (
                  <div key={msg.messageId} className={`flex flex-col ${msg.isInbound ? 'items-start' : 'items-end'}`}>
                    <div className="text-[9px] text-gray-500 font-mono mb-1 px-1 flex items-center gap-1">
                      {msg.isInbound ? <span className="px-1 bg-amber-500/20 text-amber-500 rounded border border-amber-500/30">ATC</span> : null}
                      {msg.isInbound ? msg.from : 'You'} • {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                    <div className={`px-4 py-3 rounded-lg max-w-[90%] font-mono text-sm leading-relaxed whitespace-pre-wrap uppercase ${
                      msg.isInbound 
                        ? 'bg-[#1a1a1a] text-amber-400 border border-amber-500/30 font-bold shadow-lg' 
                        : 'bg-white/10 text-white border border-white/10'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.isInbound && (
                      <div className="flex gap-2 mt-1.5 ml-1">
                        <button 
                          onClick={() => { setCpdlcRecipient(msg.from); setCpdlcMessage('WILCO'); }}
                          className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors uppercase tracking-wider"
                        >
                          WILCO
                        </button>
                        <button 
                          onClick={() => { setCpdlcRecipient(msg.from); setCpdlcMessage('STANDBY'); }}
                          className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors uppercase tracking-wider"
                        >
                          STANDBY
                        </button>
                        <button 
                          onClick={() => { setCpdlcRecipient(msg.from); setCpdlcMessage('UNABLE'); }}
                          className="px-2 py-0.5 text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-colors uppercase tracking-wider"
                        >
                          UNABLE
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendCpdlc} className="shrink-0 p-3 bg-black/40 border-t border-white/[0.04]">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={cpdlcRecipient}
                  onChange={e => setCpdlcRecipient(e.target.value)}
                  placeholder="ATC CALLSIGN" 
                  className="w-32 px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500 uppercase font-bold text-center"
                />
                <input 
                  type="text" 
                  value={cpdlcMessage}
                  onChange={e => setCpdlcMessage(e.target.value)}
                  placeholder="e.g. REQUEST FL350" 
                  className="flex-1 px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500 uppercase"
                />
                <button 
                  type="submit"
                  disabled={!cpdlcRecipient || !cpdlcMessage}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Send size={14} /> Send
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ONLINE STATIONS TAB */}
        {activeTab === 'stations' && (
          <div className="absolute inset-0 flex flex-col bg-black/50">
            <div className="shrink-0 p-3 border-b border-white/[0.04] flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400">ONLINE NETWORK</span>
              <button 
                onClick={handleRefreshStations}
                disabled={refreshingStations}
                className="px-3 py-1 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded border border-cyan-500/30 transition-colors disabled:opacity-50"
              >
                {refreshingStations ? 'REFRESHING...' : 'REFRESH'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                {/* ATC Column */}
                <div>
                  <h4 className="text-[10px] font-bold text-amber-500 mb-2 border-b border-amber-500/20 pb-1">ATC STATIONS ({onlineAtc.length})</h4>
                  {onlineAtc.length === 0 ? (
                    <div className="text-xs text-gray-600 font-mono py-2">No stations found</div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {onlineAtc.map(atc => (
                        <div key={atc} className="text-xs font-mono text-gray-300 hover:text-amber-400 cursor-pointer transition-colors"
                             onClick={() => { setCpdlcRecipient(atc); setActiveTab('cpdlc'); }}>
                          {atc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Traffic Column */}
                <div>
                  <h4 className="text-[10px] font-bold text-cyan-500 mb-2 border-b border-cyan-500/20 pb-1">AIRCRAFT ({onlineCallsigns.length})</h4>
                  {onlineCallsigns.length === 0 ? (
                    <div className="text-xs text-gray-600 font-mono py-2">No aircraft found</div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {onlineCallsigns.map(cs => (
                        <div key={cs} className="text-xs font-mono text-gray-300 hover:text-cyan-400 cursor-pointer transition-colors"
                             onClick={() => { setTelexRecipient(cs); setActiveTab('telex'); }}>
                          {cs}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar bg-black/50">
            <div className="space-y-1 font-mono text-[10px]">
              {logs.length === 0 ? (
                <div className="text-gray-600 text-center py-8">No logs generated yet. Ensure Hoppie code is set in portal.</div>
              ) : (
                logs.slice().reverse().map((log, i) => (
                  <div key={i} className="flex gap-3 hover:bg-white/5 px-2 py-1 rounded">
                    <span className="text-gray-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-gray-300 break-all">{log.content}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
