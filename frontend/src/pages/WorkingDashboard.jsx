import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  X, Search, MapPin, ShieldAlert, Cloud, Activity, 
  Menu, LayoutDashboard, Lightbulb, Users, ArrowRight, Radio, Bell, Sun, Moon, Brain, Globe, Database, AlertTriangle, Zap, Shield, Heart, Eye, Loader2, CheckCircle2, Server, Cpu
} from 'lucide-react';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Full-Screen AI Analysis Overlay
const AIAnalysisOverlay = ({ isAnalyzing, step, isDarkMode }) => {
  if (!isAnalyzing) return null;
  return (
    <div className="fixed inset-0 z-[6000] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative w-72 h-72 flex items-center justify-center">
         <div className="absolute inset-0 border-4 border-red-600/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
         <div className="absolute inset-4 border-2 border-red-600/40 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
         <Brain size={80} className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] animate-pulse" />
      </div>
      <div className="mt-12 text-center space-y-4">
         <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em] animate-pulse">AI ANALYSING AREA</h2>
         <div className="flex items-center justify-center gap-3 text-lg font-bold text-red-500">
            <Loader2 className="animate-spin" size={24} />
            <span className="uppercase tracking-widest">{step}</span>
         </div>
      </div>
    </div>
  );
};

// "How it Works" Page Component
const HowItWorksContent = ({ isDarkMode }) => {
  const steps = [
    { title: "Data Harvesting", desc: "Our Sentinel agents scrape global sources like USGS, Twitter, and Google News every 500ms.", icon: <Globe className="text-blue-500" /> },
    { title: "LLM Classification", desc: "Advanced Gemini LLMs analyze raw text for emergency context, severity, and victim count.", icon: <Brain className="text-purple-500" /> },
    { title: "Spatial Mapping", desc: "Incidents are geocoded and mapped onto our Crisis Command center in real-time.", icon: <MapPin className="text-red-500" /> },
    { title: "SOS Propagation", desc: "Real-time notifications are pushed via WebSocket to users in the affected proximity.", icon: <Bell className="text-amber-500" /> }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
         <div className="text-center space-y-4">
            <h3 className="text-5xl font-black uppercase tracking-tighter">Sentinel Crisis Pipeline</h3>
            <p className="text-lg opacity-60">Autonomous AI tracking system for global emergency response.</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, i) => (
              <div key={i} className={`p-10 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'} shadow-xl`}>
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">{step.icon}</div>
                 <h4 className="text-2xl font-black uppercase mb-4 tracking-tight">{step.title}</h4>
                 <p className="opacity-60 leading-relaxed font-bold">{step.desc}</p>
              </div>
            ))}
         </div>
         <div className={`p-12 rounded-[3rem] border-2 border-red-600/50 ${isDarkMode ? 'bg-red-600/5' : 'bg-red-50'} text-center`}>
            <Activity className="mx-auto text-red-600 mb-6" size={64} />
            <h5 className="text-3xl font-black uppercase mb-4">Real-Time Core Active</h5>
            <p className="opacity-70 font-bold max-w-2xl mx-auto">The AlertBeacon core uses 99.9% uptime AI models to ensure that no life-threatening situation goes unnoticed.</p>
         </div>
      </div>
    </div>
  );
};

const CrisisAlertPopup = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-xl rounded-2xl shadow-2xl border-2 overflow-hidden ${isDarkMode ? 'bg-black text-white border-white' : 'bg-white text-slate-900 border-gray-200'}`}>
        <div className="p-10">
          <div className="flex items-center gap-4 mb-8">
             <AlertTriangle size={40} className="text-red-600 animate-bounce" />
             <h2 className="text-3xl font-black text-red-600 uppercase">EMERGENCY ALERT</h2>
          </div>
          <div className="space-y-6">
             <div className="p-6 bg-red-600 rounded-2xl text-white font-bold text-xl uppercase tracking-widest text-center shadow-lg shadow-red-600/30">Highly Critical Situation</div>
             <p className="text-lg leading-relaxed opacity-90 font-bold">A severe crisis has been detected at your exact location. Evacuate immediately.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-10">
             <button className="bg-red-600 text-white py-4 rounded-xl font-black text-lg hover:bg-red-700 shadow-xl transition-all">REQUEST SOS</button>
             <button onClick={onClose} className={`py-4 rounded-xl font-black text-lg transition-all ${isDarkMode ? 'bg-black border border-white text-white' : 'bg-slate-100 text-slate-600'}`}>DISMISS</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkingDashboard = () => {
  const [activePage, setActivePage] = useState('Dashboard'); // Dashboard, Crisis Detection
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiStep, setAiStep] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL'); 
  const [userLoc, setUserLoc] = useState("Global Monitor");

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#000000' : '#ffffff';
  }, [isDarkMode]);

  const ALL_INCIDENTS = [
    { id: 1, title: 'Massive Fire - Delhi Chandni Chowk', location_name: 'Delhi', severity_label: 'CRITICAL', zone: 'INDIA' },
    { id: 2, title: 'Extreme Heatwave - Rajasthan', location_name: 'Rajasthan', severity_label: 'MEDIUM', zone: 'INDIA' },
    { id: 3, title: 'Flood Warning - Mumbai Coast', location_name: 'Mumbai', severity_label: 'HIGH', zone: 'INDIA' },
    { id: 4, title: 'Localized Crisis Detected', location_name: 'Near Your GPS', severity_label: 'CRITICAL', zone: 'NEAR' },
  ];

  const handleAnalysisSequence = async (filter, targetPage = 'Dashboard') => {
    setActivePage(targetPage);
    setActiveFilter(filter);
    setIsAIProcessing(true);
    
    const steps = [
      "Accessing Satellite X-24...",
      "Syncing Ground Sensors...",
      "LLM Semantic Scan...",
      "Finalizing Intelligence Report..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setAiStep(steps[i]);
      await new Promise(r => setTimeout(r, 1000));
    }

    setIsAIProcessing(false);
    
    if (filter === 'NEAR') {
      setIncidents(ALL_INCIDENTS.filter(i => i.zone === 'NEAR'));
      setUserLoc("GPS: 28.70°N 77.10°E");
      setCurrentNotification({ title: "🚨 HIGH SEVERITY ALERT!", text: "Critical emergency detected near your location." });
    } else if (filter === 'INDIA') {
      setIncidents(ALL_INCIDENTS.filter(i => i.zone === 'INDIA'));
      setUserLoc("India National Feed");
    } else {
      setIncidents(ALL_INCIDENTS);
      setUserLoc("Global Monitor");
    }
  };

  useEffect(() => { setIncidents(ALL_INCIDENTS); }, []);

  const textC = isDarkMode ? 'text-white' : 'text-slate-900';
  const subTextC = isDarkMode ? 'text-gray-400' : 'text-slate-600';
  const cardC = isDarkMode ? 'bg-black border-white/20' : 'bg-white border-gray-200 shadow-sm';
  const sidebarC = isDarkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200';

  const getSeverityColor = (sev) => {
    const s = String(sev).toUpperCase();
    if (s.includes('CRITICAL') || s.includes('HIGH')) return 'bg-red-600 text-white';
    if (s.includes('MEDIUM')) return 'bg-orange-500 text-white';
    return 'bg-yellow-400 text-black';
  };

  const getSidebarItemClass = (page, filter = null) => {
    const isActive = activePage === page && (filter === null || activeFilter === filter);
    return `w-full flex items-center px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-red-600 text-white font-black shadow-lg shadow-red-600/30' : `hover:text-red-500 ${subTextC}`}`;
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 font-sans ${isDarkMode ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>
      
      <AIAnalysisOverlay isAnalyzing={isAIProcessing} step={aiStep} isDarkMode={isDarkMode} />
      <CrisisAlertPopup isOpen={showPopup} onClose={() => setShowPopup(false)} isDarkMode={isDarkMode} />

      {/* Sidebar - FIXED STUCK RED BLOCK */}
      <aside className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-[100] shrink-0 border-r ${sidebarC}`}>
        <div className={`h-20 flex items-center justify-between px-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
           <div className="flex items-center">
             <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0"><ShieldAlert size={20} /></div>
             {isSidebarOpen && <span className={`ml-3 font-black text-lg uppercase tracking-tighter ${textC}`}>AlertBeacon</span>}
           </div>
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-zinc-900 text-white' : 'hover:bg-gray-100 text-slate-600'}`}><X size={18} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 px-3 space-y-2">
          <button onClick={() => { setActivePage('Dashboard'); setActiveFilter('ALL'); setIncidents(ALL_INCIDENTS); }} className={getSidebarItemClass('Dashboard', 'ALL')}>
            <LayoutDashboard size={22} />
            {isSidebarOpen && <span className="ml-4 text-[13px] font-black uppercase tracking-widest">Dashboard</span>}
          </button>
          <button onClick={() => setActivePage('Crisis Detection')} className={getSidebarItemClass('Crisis Detection')}>
            <Activity size={22} />
            {isSidebarOpen && <span className="ml-4 text-[13px] font-black uppercase tracking-widest">How it Works</span>}
          </button>
          
          <div className={`pt-10 pb-2 px-6 opacity-40 text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Sentinel Hub</div>
          
          <button onClick={() => handleAnalysisSequence('NEAR', 'Dashboard')} className={getSidebarItemClass('Dashboard', 'NEAR')}>
            <MapPin size={22} className={activeFilter === 'NEAR' ? 'text-white' : 'text-red-600'} />
            {isSidebarOpen && <span className="ml-4 text-[13px] font-black uppercase tracking-widest">Near Me</span>}
          </button>
          <button onClick={() => handleAnalysisSequence('INDIA', 'Dashboard')} className={getSidebarItemClass('Dashboard', 'INDIA')}>
            <Globe size={22} className={activeFilter === 'INDIA' ? 'text-white' : 'text-blue-500'} />
            {isSidebarOpen && <span className="ml-4 text-[13px] font-black uppercase tracking-widest">India Alerts</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TICKER */}
        <div className={`h-12 flex items-center px-8 overflow-hidden z-20 shrink-0 border-b shadow-xl ${isDarkMode ? 'bg-red-600 text-white font-black' : 'bg-black text-white font-black'}`}>
           <div className="flex items-center gap-10 animate-ticker whitespace-nowrap text-[12px] uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-white text-red-600 px-3 py-1 rounded-full font-black"><span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> SENTINEL ACTIVE</span>
              <span>Live feeds processing... {incidents.length} incidents... Tokyo seismic drift safe...</span>
           </div>
        </div>

        <header className={`h-20 flex items-center justify-between px-10 border-b shrink-0 ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <h2 className={`text-xl font-black uppercase tracking-tighter ${textC}`}>{activePage}</h2>
            <div className="h-4 w-[1px] bg-white/20 ml-4"></div>
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest animate-pulse pl-4">{userLoc}</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-white text-white' : 'bg-gray-50 border-black text-black'}`}><Sun size={20} /></button>
            <div className={`flex items-center gap-3 p-1.5 rounded-full border pr-5 ${isDarkMode ? 'bg-zinc-900 border-white' : 'bg-gray-50 border-black'}`}>
               <img src="/alertbeacon.png" className="h-9 w-9 rounded-full bg-white p-1" />
               <span className={`text-[10px] font-black uppercase ${textC}`}>SYSTEM_ADMIN</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 scrollbar-none space-y-10">
          {activePage === 'Dashboard' ? (
            <div className="space-y-10">
              {currentNotification && (
                <div className="bg-red-600 p-8 rounded-[2rem] shadow-2xl flex justify-between items-center animate-in slide-in-from-top-10 duration-500 text-white border-4 border-white/20">
                   <div className="flex items-center gap-8">
                      <div className="bg-white/20 p-4 rounded-full"><Bell size={32} /></div>
                      <div>
                        <h4 className="text-xl font-black uppercase">{currentNotification.title}</h4>
                        <p className="text-base font-bold opacity-90">{currentNotification.text}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <button onClick={() => setShowPopup(true)} className="bg-white text-red-600 px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all">VIEW ALERT</button>
                      <button onClick={() => setCurrentNotification(null)} className="p-3 hover:bg-white/10 rounded-full"><X size={28} /></button>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { label: 'Alerts Processed', value: incidents.length, icon: <Bell size={20} className="text-red-600" /> },
                   { label: 'Lives Affected', value: '89.2k', icon: <Heart size={20} className="text-red-600" /> },
                   { label: 'AI Confidence', value: '98.4%', icon: <Zap size={20} className="text-blue-500" /> },
                   { label: 'System Uptime', value: '99.9%', icon: <Activity size={20} className="text-purple-600" /> },
                 ].map((stat, i) => (
                   <div key={i} className={`p-6 rounded-2xl border ${cardC} hover:border-red-600 transition-all`}>
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[9px] font-black opacity-50 uppercase tracking-widest">{stat.label}</span>
                         <div>{stat.icon}</div>
                      </div>
                      <div className={`text-2xl font-black tracking-tight ${textC}`}>{stat.value}</div>
                   </div>
                 ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 pb-20">
                <div className={`xl:col-span-8 rounded-[2rem] border overflow-hidden h-[600px] flex flex-col ${cardC} hover:border-red-600 transition-all`}>
                  <div className="p-6 flex items-center justify-between border-b border-white/10">
                    <span className={`text-base font-black uppercase flex items-center gap-3 ${textC}`}><MapPin size={20} className="text-red-600" /> Command Center</span>
                    <span className="bg-red-600 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest">Satellite Active</span>
                  </div>
                  <div className="flex-1 z-0 grayscale invert-[0.9]"><MapContainer center={[22.5, 80]} zoom={activeFilter === 'NEAR' ? 12 : 5} className="w-full h-full"><TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"} /></MapContainer></div>
                </div>

                <div className="xl:col-span-4 flex flex-col h-[600px]">
                  <div className={`rounded-[2rem] border flex-1 overflow-hidden flex flex-col ${cardC} hover:border-red-600 transition-all`}>
                    <div className="p-6 font-black text-base flex justify-between items-center border-b border-white/10">
                       <span className={textC}>{activeFilter} INTELLIGENCE</span>
                       <Bell size={20} className="text-red-600" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none">
                       {incidents.map((inc, i) => (
                         <div key={i} className={`p-5 rounded-xl border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-black border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                               <h4 className={`font-black text-sm uppercase leading-tight flex-1 pr-4 ${textC}`}>{inc.title}</h4>
                               <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase shrink-0 ${getSeverityColor(inc.severity_label)}`}>{inc.severity_label}</span>
                            </div>
                            <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${subTextC}`}><MapPin size={12} className="text-red-600"/> {inc.location_name}</div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <HowItWorksContent isDarkMode={isDarkMode} />
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkingDashboard;
