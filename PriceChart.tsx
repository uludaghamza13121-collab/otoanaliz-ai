import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface PriceChartProps {
  currentPrice: number;
  marketMin: number;
  marketMax: number;
  marketAvg: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ currentPrice, marketMin, marketMax, marketAvg }) => {
  
  // Prepare data for the chart
  const data = [
    {
      name: 'Piyasa Min',
      fiyat: marketMin,
      color: '#cbd5e1' // slate-300
    },
    {
      name: 'Piyasa Ort.',
      fiyat: marketAvg,
      color: '#64748b' // slate-500
    },
    {
      name: 'Sizin İlan',
      fiyat: currentPrice,
      color: currentPrice < marketAvg ? '#10b981' : (currentPrice > marketMax ? '#ef4444' : '#3b82f6') // Green if low, Red if high, Blue if mid
    },
    {
      name: 'Piyasa Max',
      fiyat: marketMax,
      color: '#cbd5e1' // slate-300
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumSignificantDigits: 3
    }).format(value);
  };

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{fontSize: 12}} />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Fiyat']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <ReferenceLine y={marketAvg} label="Piyasa Ortalaması" stroke="#64748b" strokeDasharray="3 3" />
          <Bar dataKey="fiyat" radius={[6, 6, 0, 0]}>
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
