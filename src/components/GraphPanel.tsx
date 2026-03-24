import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as math from 'mathjs';
import { Activity, Play } from 'lucide-react';

interface GraphPanelProps {
  onResult: (expression: string) => void;
}

const GraphPanel: React.FC<GraphPanelProps> = ({ onResult }) => {
  const [expression, setExpression] = useState<string>('x^2');
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateData = () => {
    try {
      const node = math.parse(expression);
      const code = node.compile();
      const newData = [];
      
      for (let x = -10; x <= 10; x += 0.5) {
        try {
          const y = code.evaluate({ x });
          if (typeof y === 'number' && isFinite(y)) {
            newData.push({ x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(2)) });
          }
        } catch (e) {
          // Skip invalid points
        }
      }
      setData(newData);
      if (newData.length === 0) {
        setError('No valid points to plot');
      } else {
        setError(null);
        onResult(`y = ${expression}`);
      }
    } catch (err: any) {
      setError(err.message);
      setData([]);
    }
  };

  useEffect(() => {
    generateData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-zinc-800/20 rounded-3xl p-6 border border-zinc-800/50 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5 text-green-500" />
          <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest">Function Plotter</h3>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold opacity-20">y =</span>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateData()}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 text-xl font-bold focus:outline-none focus:border-green-500 transition-colors"
              placeholder="x^2"
            />
          </div>
          <button
            onClick={generateData}
            className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            <Play className="w-6 h-6" />
          </button>
        </div>
        
        {error && <p className="text-red-400 text-xs font-medium px-2">{error}</p>}
      </div>

      <div className="h-[400px] bg-zinc-900/40 rounded-3xl border border-zinc-800/50 p-6 relative overflow-hidden">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="x" 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                label={{ value: 'x', position: 'insideBottomRight', offset: -5, fill: '#666' }}
              />
              <YAxis 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                label={{ value: 'y', angle: -90, position: 'insideLeft', fill: '#666' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#22c55e' }}
              />
              <Line 
                type="monotone" 
                dataKey="y" 
                stroke="#22c55e" 
                strokeWidth={3} 
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center opacity-10">
            <Activity className="w-24 h-24" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphPanel;
