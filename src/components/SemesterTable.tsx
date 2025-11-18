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
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-2 sm:mb-3 lg:mb-4">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">{semesterData.semester}</h3>
        <span className="text-xs sm:text-sm text-gray-600">
          Average: <span className="font-semibold">{avgAttendance.toFixed(2)}%</span>
        </span>
      </div>
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-left font-semibold text-gray-700">Paper Code</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-left font-semibold text-gray-700">Subject</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-center font-semibold text-gray-700">Cond.</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-center font-semibold text-gray-700">Pres.</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-center font-semibold text-gray-700">Abs.</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-center font-semibold text-gray-700">Att. %</th>
            </tr>
          </thead>
          <tbody>
            {semesterData.records.map((record, index) => (
              <tr
                key={record.paperCode}
                className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-gray-900 font-medium">{record.paperCode}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-gray-700">{record.subject}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-center text-gray-600">{record.conducted}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-center text-green-600 font-medium">{record.present}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-center text-red-600 font-medium">{record.absent}</td>
                <td className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-center ${getAttendanceColor(record.attendancePercent)}`}>
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

