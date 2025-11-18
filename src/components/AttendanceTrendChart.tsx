'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SemesterData } from '@/types/attendance';

interface AttendanceTrendChartProps {
  data: SemesterData[];
}

export default function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  const chartData = data.map((sem) => {
    const avgAttendance = sem.records.reduce((sum, r) => sum + r.attendancePercent, 0) / sem.records.length;
    const totalConducted = sem.records.reduce((sum, r) => sum + r.conducted, 0);
    const totalPresent = sem.records.reduce((sum, r) => sum + r.present, 0);
    const totalAbsent = sem.records.reduce((sum, r) => sum + r.absent, 0);

    return {
      semester: sem.semester.replace('SEMESTER ', ''),
      'Avg Attendance %': parseFloat(avgAttendance.toFixed(2)),
      'Present': totalPresent,
      'Absent': totalAbsent,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 lg:p-6 border-l-4 border-blue-600">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Attendance Trend Analysis</h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Avg Attendance %" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

