import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  History as HistoryIcon, 
  Moon, 
  Sun, 
  Copy, 
  RotateCcw, 
  ChevronRight, 
  X,
  Check,
  Calculator,
  Ruler,
  Activity,
  Maximize
} from 'lucide-react';
import MeasurementPanel from './components/MeasurementPanel';
import ConverterPanel from './components/ConverterPanel';
import GraphPanel from './components/GraphPanel';

// Types
interface Calculation {
  type: 'calculator' | 'geometry' | 'conversion' | 'graph';
  expression: string;
  result: number | string;
  timestamp: number;
  unit?: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [display, setDisplay] = useState<string>('');
  const [result, setResult] = useState<string | number | null>(null);
  const [history, setHistory] = useState<Calculation[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isScientific, setIsScientific] = useState<boolean>(true);
  const [memory, setMemory] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const tabs = [
    { id: 'calculator', name: 'Calculator', icon: Calculator },
    { id: 'measurements', name: 'Measurements', icon: Maximize },
    { id: 'converter', name: 'Converter', icon: Ruler },
    { id: 'graph', name: 'Graph', icon: Activity },
  ];

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('calc_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }, [history]);

  const handleKeyPress = (key: string) => {
    if (key === 'AC') {
      setDisplay('');
      setResult(null);
      setError(null);
    } else if (key === 'C') {
      setDisplay(prev => prev.slice(0, -1));
    } else if (key === '=') {
      evaluateExpression();
    } else if (key === 'M+') {
      if (result !== null) setMemory(prev => prev + Number(result));
    } else if (key === 'M-') {
      if (result !== null) setMemory(prev => prev - Number(result));
    } else if (key === 'MR') {
      setDisplay(prev => prev + memory.toString());
    } else if (key === 'MC') {
      setMemory(0);
    } else {
      // Handle scientific functions
      const scientificFuncs = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'cbrt', 'asin', 'acos', 'atan'];
      if (scientificFuncs.includes(key)) {
        setDisplay(prev => prev + key + '(');
      } else {
        setDisplay(prev => prev + key);
      }
    }
  };

  const evaluateExpression = async () => {
    if (!display) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: display }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data.result);
        addHistory('calculator', display, data.result);
      }
    } catch (err) {
      setError('Connection Error');
    } finally {
      setIsLoading(false);
    }
  };

  const addHistory = (type: Calculation['type'], expression: string, result: number | string, unit?: string) => {
    setHistory(prev => [{
      type,
      expression,
      result,
      timestamp: Date.now(),
      unit
    }, ...prev].slice(0, 50));
  };

  const copyToClipboard = () => {
    if (result !== null) {
      navigator.clipboard.writeText(result.toString());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('calc_history');
  };

  const buttons = [
    { label: 'AC', type: 'action', color: 'bg-red-500/20 text-red-400' },
    { label: 'C', type: 'action', color: 'bg-orange-500/20 text-orange-400' },
    { label: '%', type: 'operator', color: 'bg-blue-500/20 text-blue-400' },
    { label: '/', type: 'operator', color: 'bg-blue-500/20 text-blue-400' },
    
    { label: '7', type: 'number' },
    { label: '8', type: 'number' },
    { label: '9', type: 'number' },
    { label: '*', type: 'operator', color: 'bg-blue-500/20 text-blue-400' },
    
    { label: '4', type: 'number' },
    { label: '5', type: 'number' },
    { label: '6', type: 'number' },
    { label: '-', type: 'operator', color: 'bg-blue-500/20 text-blue-400' },
    
    { label: '1', type: 'number' },
    { label: '2', type: 'number' },
    { label: '3', type: 'number' },
    { label: '+', type: 'operator', color: 'bg-blue-500/20 text-blue-400' },
    
    { label: '0', type: 'number', span: 2 },
    { label: '.', type: 'number' },
    { label: '=', type: 'action', color: 'bg-green-500/20 text-green-400' },
  ];

  const scientificButtons = [
    { label: 'sin', type: 'func' },
    { label: 'cos', type: 'func' },
    { label: 'tan', type: 'func' },
    { label: 'log', type: 'func' },
    { label: 'ln', type: 'func' },
    { label: 'sqrt', type: 'func' },
    { label: '(', type: 'operator' },
    { label: ')', type: 'operator' },
    { label: '^', type: 'operator' },
    { label: '!', type: 'func' },
  ];

  const memoryButtons = [
    { label: 'MC', type: 'memory' },
    { label: 'MR', type: 'memory' },
    { label: 'M+', type: 'memory' },
    { label: 'M-', type: 'memory' },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
        <div className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-400'}`}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6`}
      >
        {/* Main Calculator Card */}
        <div className={`lg:col-span-8 rounded-3xl overflow-hidden border backdrop-blur-xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white/40 border-zinc-200'}`}>
          
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight">RPC Scientific</h1>
                <p className="text-xs opacity-50 font-mono">Bridge API v2.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'}`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-xl lg:hidden transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'}`}
              >
                <HistoryIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-500/10 text-blue-500' : 'opacity-40 hover:opacity-100'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'calculator' && (
              <motion.div 
                key="calculator"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Display Area */}
                <div className="p-8 flex flex-col items-end justify-end min-h-[200px] bg-black/5">
                  <div className="w-full text-right overflow-x-auto whitespace-nowrap scrollbar-hide mb-2">
                    <span className="text-2xl opacity-40 font-light tracking-wider">{display || '0'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {isLoading && (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                    )}
                    {error && <span className="text-red-400 text-sm font-medium">{error}</span>}
                    <AnimatePresence mode="wait">
                      {result !== null && (
                        <motion.div 
                          key={result}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-3"
                        >
                          <span className="text-6xl font-bold tracking-tighter">
                            {typeof result === 'number' ? result.toLocaleString(undefined, { maximumFractionDigits: 8 }) : result}
                          </span>
                          <button 
                            onClick={copyToClipboard}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            {copySuccess ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-40" />}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Keypad */}
                <div className="p-6 grid grid-cols-4 gap-3">
                  {/* Memory Row */}
                  <div className="col-span-4 grid grid-cols-4 gap-3 mb-2">
                    {memoryButtons.map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => handleKeyPress(btn.label)}
                        className={`py-2 rounded-xl text-xs font-bold tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800' : 'bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200'}`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Scientific Toggle */}
                  <div className="col-span-4 flex items-center justify-between mb-2">
                    <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Scientific Mode</span>
                    <button 
                      onClick={() => setIsScientific(!isScientific)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${isScientific ? 'bg-blue-500' : 'bg-zinc-700'}`}
                    >
                      <motion.div 
                        animate={{ x: isScientific ? 24 : 0 }}
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  {/* Scientific Buttons */}
                  <AnimatePresence>
                    {isScientific && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="col-span-4 grid grid-cols-5 gap-3 mb-4 overflow-hidden"
                      >
                        {scientificButtons.map((btn) => (
                          <button
                            key={btn.label}
                            onClick={() => handleKeyPress(btn.label)}
                            className={`py-3 rounded-xl text-xs font-medium transition-all active:scale-95 ${isDarkMode ? 'bg-zinc-800/30 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Standard Buttons */}
                  {buttons.map((btn) => (
                    <button
                      key={btn.label}
                      onClick={() => handleKeyPress(btn.label)}
                      className={`
                        ${btn.span === 2 ? 'col-span-2' : 'col-span-1'}
                        py-5 rounded-2xl text-xl font-semibold transition-all active:scale-95
                        ${btn.color || (isDarkMode ? 'bg-zinc-800/50 text-white hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200')}
                        shadow-sm
                      `}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'measurements' && <MeasurementPanel key="measurements" onResult={(exp, res) => addHistory('geometry', exp, res)} />}
            {activeTab === 'converter' && <ConverterPanel key="converter" onResult={(exp, res, unit) => addHistory('conversion', exp, res, unit)} />}
            {activeTab === 'graph' && <GraphPanel key="graph" onResult={(exp) => addHistory('graph', exp, 'Plotted')} />}
          </AnimatePresence>
        </div>

        {/* History Panel (Desktop) */}
        <div className={`hidden lg:block lg:col-span-4 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white/40 border-zinc-200'}`}>
          <div className="p-6 flex items-center justify-between border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 opacity-50" />
              <h2 className="font-bold text-sm uppercase tracking-widest opacity-50">History</h2>
            </div>
            <button 
              onClick={clearHistory}
              className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 h-[600px] overflow-y-auto space-y-4 custom-scrollbar">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-8">
                <HistoryIcon className="w-12 h-12 mb-4" />
                <p className="text-sm">No calculations yet</p>
              </div>
            ) : (
              history.map((item) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={item.timestamp}
                  className={`p-4 rounded-2xl border transition-colors cursor-pointer group ${isDarkMode ? 'bg-zinc-800/30 border-zinc-800/50 hover:bg-zinc-800/50' : 'bg-white/50 border-zinc-200 hover:bg-white'}`}
                  onClick={() => {
                    if (item.type === 'calculator') {
                      setDisplay(item.expression);
                      setActiveTab('calculator');
                    } else {
                      setActiveTab(item.type === 'geometry' ? 'measurements' : item.type);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">{item.type}</p>
                    <p className="text-[10px] opacity-40 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <p className="text-sm opacity-60 mb-2 truncate">{item.expression}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold tracking-tight text-blue-400">
                      {typeof item.result === 'number' ? item.result.toLocaleString() : item.result}
                      {item.unit && <span className="text-xs ml-1 opacity-50">{item.unit}</span>}
                    </p>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Mobile History Drawer */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className={`fixed top-0 right-0 bottom-0 w-80 z-50 p-6 border-l lg:hidden ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bold text-lg">History</h2>
                  <button onClick={() => setShowHistory(false)} className="p-2 rounded-full bg-zinc-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4 overflow-y-auto h-[calc(100vh-150px)]">
                  {history.map((item) => (
                    <div 
                      key={item.timestamp}
                      className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}
                      onClick={() => {
                        if (item.type === 'calculator') {
                          setDisplay(item.expression);
                          setActiveTab('calculator');
                        } else {
                          setActiveTab(item.type === 'geometry' ? 'measurements' : item.type);
                        }
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">{item.type}</p>
                        <p className="text-[10px] opacity-40">{new Date(item.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <p className="text-sm opacity-60 mb-1 truncate">{item.expression}</p>
                      <p className="text-lg font-bold text-blue-400">
                        {item.result} {item.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.4);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default App;
