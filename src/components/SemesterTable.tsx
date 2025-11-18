import { SemesterData } from '@/types/attendance';

interface SemesterTableProps {
  semesterData: SemesterData;
}

export default function SemesterTable({ semesterData }: SemesterTableProps) {
  const getAttendanceColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600 font-semibold';
    if (percent >= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const avgAttendance = semesterData.records.reduce((sum, r) => sum + r.attendancePercent, 0) / semesterData.records.length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 lg:p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 mb-4 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">{semesterData.semester}</h3>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-200">
            <span className="text-xs sm:text-sm text-gray-600">
              Average Attendance: <span className="font-bold text-blue-700 text-sm sm:text-base">{avgAttendance.toFixed(2)}%</span>
            </span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto -mx-3 sm:mx-0 rounded-lg border border-gray-200">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <th className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-left font-semibold">Paper Code</th>
              <th className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-left font-semibold">Subject</th>
              <th className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-center font-semibold">Conducted</th>
              <th className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-center font-semibold">Present</th>
              <th className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-center font-semibold">Absent</th>
              <th className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-center font-semibold">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {semesterData.records.map((record, index) => (
              <tr
                key={record.paperCode}
                className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-gray-900 font-semibold">{record.paperCode}</td>
                <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-gray-700">{record.subject}</td>
                <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-center text-gray-600 font-medium">{record.conducted}</td>
                <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-center text-green-700 font-semibold bg-green-50">{record.present}</td>
                <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-center text-red-700 font-semibold bg-red-50">{record.absent}</td>
                <td className={`px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 text-center font-bold ${getAttendanceColor(record.attendancePercent)}`}>
                  {record.attendancePercent.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

