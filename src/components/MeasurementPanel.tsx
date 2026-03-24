import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Square, Circle, Triangle, Box, Globe, Cylinder } from 'lucide-react';

interface MeasurementPanelProps {
  onResult: (expression: string, result: number) => void;
}

const MeasurementPanel: React.FC<MeasurementPanelProps> = ({ onResult }) => {
  const [shape, setShape] = useState<string>('rectangle');
  const [inputs, setInputs] = useState<any>({ a: '', b: '' });
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const shapes = [
    { id: 'rectangle', name: 'Rectangle', icon: Square, fields: ['Length', 'Width'], op: 'arearectangle' },
    { id: 'circle', name: 'Circle', icon: Circle, fields: ['Radius'], op: 'areacircle' },
    { id: 'triangle', name: 'Triangle', icon: Triangle, fields: ['Base', 'Height'], op: 'areatriangle' },
    { id: 'cube', name: 'Cube', icon: Box, fields: ['Side'], op: 'volumecube' },
    { id: 'sphere', name: 'Sphere', icon: Globe, fields: ['Radius'], op: 'volumesphere' },
    { id: 'cylinder', name: 'Cylinder', icon: Cylinder, fields: ['Radius', 'Height'], op: 'volumecylinder' },
  ];

  const currentShape = shapes.find(s => s.id === shape)!;

  const calculate = async () => {
    setIsLoading(true);
    try {
      const aVal = parseFloat(inputs.a) || 0;
      const bVal = parseFloat(inputs.b) || 0;
      const response = await fetch('/api/geometry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          operation: currentShape.op, 
          a: aVal, 
          b: bVal 
        }),
      });
      const data = await response.json();
      setResult(data.result);
      
      // Add to history
      const expression = currentShape.fields.length > 1 
        ? `${currentShape.name}(${aVal}, ${bVal})`
        : `${currentShape.name}(${aVal})`;
      onResult(expression, data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {shapes.map((s) => (
          <button
            key={s.id}
            onClick={() => { setShape(s.id); setResult(null); }}
            className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${shape === s.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-800/30 text-zinc-400 hover:bg-zinc-800/50'}`}
          >
            <s.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{s.name}</span>
          </button>
        ))}
      </div>

      <motion.div 
        key={shape}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-800/20 rounded-3xl p-6 border border-zinc-800/50"
      >
        <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-4">{currentShape.name} Calculation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {currentShape.fields.map((f, i) => (
            <div key={f} className="space-y-2">
              <label className="text-xs font-medium opacity-40">{f}</label>
              <input
                type="number"
                value={i === 0 ? inputs.a : inputs.b}
                onChange={(e) => setInputs({ ...inputs, [i === 0 ? 'a' : 'b']: e.target.value })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder={`Enter ${f.toLowerCase()}`}
              />
            </div>
          ))}
        </div>

        <button
          onClick={calculate}
          disabled={isLoading}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          {isLoading ? 'Calculating...' : 'Calculate'}
        </button>

        {result !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center"
          >
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Result</p>
            <p className="text-4xl font-bold tracking-tighter">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MeasurementPanel;
