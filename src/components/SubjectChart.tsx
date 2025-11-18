'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { SemesterData } from '@/types/attendance';

interface SubjectChartProps {
  data: SemesterData[];
}

export default function SubjectChart({ data }: SubjectChartProps) {
  const allSubjects = data.flatMap((sem) =>
    sem.records.map((record) => ({
      subject: record.subject.length > 30 ? record.subject.substring(0, 30) + '...' : record.subject,
      fullSubject: record.subject,
      attendance: record.attendancePercent,
      semester: sem.semester,
    }))
  );

  // Sort by attendance percentage
  const sortedSubjects = [...allSubjects].sort((a, b) => b.attendance - a.attendance);

  const getColor = (attendance: number) => {
    if (attendance >= 80) return '#10b981'; // green
    if (attendance >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 lg:p-6 border-l-4 border-blue-600">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Subject-wise Attendance Performance</h3>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={sortedSubjects} layout="vertical" margin={{ left: 60, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="subject" type="category" width={50} tick={{ fontSize: 9 }} />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            labelFormatter={(label) => `Subject: ${label}`}
          />
          <Bar dataKey="attendance" name="Attendance %">
            {sortedSubjects.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.attendance)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

