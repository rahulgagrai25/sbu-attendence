'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SemesterData } from '@/types/attendance';

interface PresentAbsentChartProps {
  data: SemesterData[];
}

export default function PresentAbsentChart({ data }: PresentAbsentChartProps) {
  const totalPresent = data.reduce((sum, sem) => 
    sum + sem.records.reduce((s, r) => s + r.present, 0), 0
  );
  const totalAbsent = data.reduce((sum, sem) => 
    sum + sem.records.reduce((s, r) => s + r.absent, 0), 0
  );

  const pieData = [
    { name: 'Present', value: totalPresent, color: '#10b981' },
    { name: 'Absent', value: totalAbsent, color: '#ef4444' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 lg:p-6 border-l-4 border-blue-600">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Overall Present vs Absent</h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 sm:mt-3 lg:mt-4 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          Total Present: <span className="font-bold text-green-600">{totalPresent}</span> | 
          Total Absent: <span className="font-bold text-red-600">{totalAbsent}</span>
        </p>
      </div>
    </div>
  );
}