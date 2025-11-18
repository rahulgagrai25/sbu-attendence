import Image from 'next/image';
import { attendanceData, studentInfo } from '@/data/attendanceData';
import StatsCard from '@/components/StatsCard';
import SemesterChart from '@/components/SemesterChart';
import SubjectChart from '@/components/SubjectChart';
import AttendanceTrendChart from '@/components/AttendanceTrendChart';
import PresentAbsentChart from '@/components/PresentAbsentChart';
import SemesterTable from '@/components/SemesterTable';

export default function Home() {
  // Calculate overall statistics
  const totalConducted = attendanceData.reduce(
    (sum, sem) => sum + sem.records.reduce((s, r) => s + r.conducted, 0),
    0
  );
  const totalPresent = attendanceData.reduce(
    (sum, sem) => sum + sem.records.reduce((s, r) => s + r.present, 0),
    0
  );
  const totalAbsent = attendanceData.reduce(
    (sum, sem) => sum + sem.records.reduce((s, r) => s + r.absent, 0),
    0
  );
  const overallAttendance = (totalPresent / totalConducted) * 100;
  
  // Calculate average attendance across all subjects
  const allAttendances = attendanceData.flatMap(sem => 
    sem.records.map(r => r.attendancePercent)
  );
  const avgAttendance = allAttendances.reduce((sum, a) => sum + a, 0) / allAttendances.length;

  // Count subjects with good attendance (>= 75%)
  const goodAttendanceCount = allAttendances.filter(a => a >= 75).length;
  const totalSubjects = allAttendances.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <Image
                  src="/logo.png"
                  alt="College Logo"
                  width={40}
                  height={40}
                  className="object-contain sm:w-[50px] sm:h-[50px]"
                />
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-blue-600">{studentInfo.college}</p>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Attendance Analytics Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{studentInfo.degree}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600">User: {studentInfo.userName}</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900">{studentInfo.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{studentInfo.roles}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <StatsCard
            title="Overall Attendance"
            value={`${overallAttendance.toFixed(2)}%`}
            subtitle={`${totalPresent} present out of ${totalConducted} classes`}
            trend={overallAttendance >= 75 ? 'up' : overallAttendance >= 60 ? 'neutral' : 'down'}
          />
          <StatsCard
            title="Average Attendance"
            value={`${avgAttendance.toFixed(2)}%`}
            subtitle="Across all subjects"
            trend={avgAttendance >= 75 ? 'up' : avgAttendance >= 60 ? 'neutral' : 'down'}
          />
          <StatsCard
            title="Total Classes"
            value={totalConducted}
            subtitle={`${totalPresent} present, ${totalAbsent} absent`}
          />
          <StatsCard
            title="Subjects Status"
            value={`${goodAttendanceCount}/${totalSubjects}`}
            subtitle="Subjects with ≥75% attendance"
            trend={goodAttendanceCount / totalSubjects >= 0.75 ? 'up' : 'neutral'}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <SemesterChart data={attendanceData} />
          <PresentAbsentChart data={attendanceData} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <AttendanceTrendChart data={attendanceData} />
        </div>

        {/* Subject Chart */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <SubjectChart data={attendanceData} />
        </div>

        {/* Semester Breakdown Tables */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Semester-wise Breakdown</h2>
          {attendanceData.map((semesterData) => (
            <SemesterTable key={semesterData.semester} semesterData={semesterData} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-6 sm:mt-8 lg:mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <p className="text-center text-sm text-gray-600">
            © Copyright 2024. All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
