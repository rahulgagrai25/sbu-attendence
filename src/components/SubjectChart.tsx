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
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border border-gray-200">
      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4">Attendance by Subject</h3>
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

