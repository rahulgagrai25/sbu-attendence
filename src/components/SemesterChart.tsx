'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SemesterData } from '@/types/attendance';

interface SemesterChartProps {
  data: SemesterData[];
}

export default function SemesterChart({ data }: SemesterChartProps) {
  const chartData = data.map((sem) => {
    const totalConducted = sem.records.reduce((sum, r) => sum + r.conducted, 0);
    const totalPresent = sem.records.reduce((sum, r) => sum + r.present, 0);
    const totalAbsent = sem.records.reduce((sum, r) => sum + r.absent, 0);
    const avgAttendance = sem.records.reduce((sum, r) => sum + r.attendancePercent, 0) / sem.records.length;

    return {
      semester: sem.semester.replace('SEMESTER ', ''),
      'Average Attendance %': parseFloat(avgAttendance.toFixed(2)),
      'Total Conducted': totalConducted,
      'Total Present': totalPresent,
      'Total Absent': totalAbsent,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border border-gray-200">
      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4">Attendance by Semester</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Average Attendance %" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

