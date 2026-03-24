import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Ruler, Weight, Thermometer, ArrowRightLeft } from 'lucide-react';

interface ConverterPanelProps {
  onResult: (expression: string, result: number, unit: string) => void;
}

const ConverterPanel: React.FC<ConverterPanelProps> = ({ onResult }) => {
  const [type, setType] = useState<string>('length');
  const [value, setValue] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const types = [
    { id: 'length', name: 'Length', icon: Ruler, units: ['meters', 'cm', 'km'], op: 'convertlength' },
    { id: 'weight', name: 'Weight', icon: Weight, units: ['kg', 'grams', 'pounds'], op: 'convertweight' },
    { id: 'temperature', name: 'Temp', icon: Thermometer, units: ['celsius', 'fahrenheit', 'kelvin'], op: 'converttemperature' },
  ];

  const currentType = types.find(t => t.id === type)!;

  useEffect(() => {
    setFrom(currentType.units[0]);
    setTo(currentType.units[1]);
    setResult(null);
  }, [type]);

  const convert = async () => {
    if (!value) return;
    setIsLoading(true);
    try {
      const val = parseFloat(value) || 0;
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          operation: currentType.op, 
          value: val, 
          from, 
          to 
        }),
      });
      const data = await response.json();
      setResult(data.result);
      onResult(`${val} ${from} to ${to}`, data.result, to);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${type === t.id ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-zinc-800/30 text-zinc-400 hover:bg-zinc-800/50'}`}
          >
            <t.icon className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest">{t.name}</span>
          </button>
        ))}
      </div>

      <motion.div 
        key={type}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-800/20 rounded-3xl p-6 border border-zinc-800/50"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium opacity-40 uppercase tracking-widest">Input Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-2xl font-bold focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium opacity-40 uppercase tracking-widest">From</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors appearance-none"
              >
                {currentType.units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="pt-6">
              <ArrowRightLeft className="w-5 h-5 opacity-20" />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium opacity-40 uppercase tracking-widest">To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors appearance-none"
              >
                {currentType.units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={convert}
            disabled={isLoading || !value}
            className="w-full py-4 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/20 active:scale-95"
          >
            {isLoading ? 'Converting...' : 'Convert Now'}
          </button>

          {result !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center"
            >
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Converted Result</p>
              <p className="text-4xl font-bold tracking-tighter">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-lg opacity-40">{to}</span></p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ConverterPanel;
