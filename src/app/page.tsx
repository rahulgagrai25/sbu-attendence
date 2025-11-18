import Image from 'next/image';
import { attendanceData, studentInfo } from '@/data/attendanceData';
import StatsCard from '@/components/StatsCard';
import SemesterChart from '@/components/SemesterChart';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium">{studentInfo.college}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Student Portal</span>
              <span className="hidden sm:inline">|</span>
              <span className="text-blue-200">{studentInfo.userName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-5 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white p-2 rounded-lg shadow-md border-2 border-blue-100">
                <Image
                  src="/logo.png"
                  alt="College Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  Attendance Analytics Dashboard
                </h1>
                <p className="text-sm sm:text-base text-blue-700 font-medium mt-1">{studentInfo.degree}</p>
              </div>
            </div>
            <div className="ml-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-200 shadow-sm">
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Student Information</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{studentInfo.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{studentInfo.roles}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Page Title Section */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-bold">Academic Performance Overview</h2>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
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

        {/* Charts Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-t-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-bold">Visual Analytics</h2>
          </div>
          <div className="bg-white rounded-b-lg shadow-lg p-4 sm:p-6 border-l-4 border-blue-600">
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <SemesterChart data={attendanceData} />
              <PresentAbsentChart data={attendanceData} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
              <AttendanceTrendChart data={attendanceData} />
            </div>
          </div>
        </div>

        {/* Semester Breakdown Tables */}
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-t-lg shadow-md">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Semester-wise Detailed Breakdown</h2>
          </div>
          <div className="bg-white rounded-b-lg shadow-lg p-4 sm:p-6 border-l-4 border-blue-600 space-y-4 sm:space-y-5 lg:space-y-6">
            {attendanceData.map((semesterData) => (
              <SemesterTable key={semesterData.semester} semesterData={semesterData} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 text-white mt-10 sm:mt-12 lg:mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6">
            <div>
              <h3 className="text-lg font-bold mb-3 text-blue-300">{studentInfo.college}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Empowering students with comprehensive academic insights and analytics.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3 text-blue-300">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-blue-300 transition-colors">Student Portal</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Academic Records</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3 text-blue-300">Contact</h3>
              <p className="text-sm text-gray-300">
                Student ID: {studentInfo.userName}<br />
                {studentInfo.name}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 mt-4">
            <p className="text-center text-sm text-gray-400">
              © Copyright 2024 {studentInfo.college}. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
