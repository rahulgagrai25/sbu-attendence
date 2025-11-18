'use client';

import { useEffect, useState, useCallback } from 'react';
import { SemesterData } from '@/types/attendance';
import StatsCard from './StatsCard';
import SemesterChart from './SemesterChart';
import AttendanceTrendChart from './AttendanceTrendChart';
import PresentAbsentChart from './PresentAbsentChart';
import SemesterTable from './SemesterTable';

interface DashboardContentProps {
  initialData: SemesterData[];
}

export default function DashboardContent({ initialData }: DashboardContentProps) {
  const [attendanceData, setAttendanceData] = useState<SemesterData[]>(initialData);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attendance');
      if (response.ok) {
        const data = await response.json();
        // Data is already sorted by created_at (oldest first, newest at bottom)
        setAttendanceData(data);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch latest data on mount
    fetchData();
    
    // Refresh data when window gains focus (user returns from admin page)
    const handleFocus = () => {
      fetchData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Also set up periodic refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchData]);

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
  const overallAttendance = totalConducted > 0 ? (totalPresent / totalConducted) * 100 : 0;
  
  // Calculate average attendance across all subjects
  const allAttendances = attendanceData.flatMap(sem => 
    sem.records.map(r => r.attendancePercent)
  );
  const avgAttendance = allAttendances.length > 0
    ? allAttendances.reduce((sum, a) => sum + a, 0) / allAttendances.length
    : 0;

  // Count subjects with good attendance (>= 75%)
  const goodAttendanceCount = allAttendances.filter(a => a >= 75).length;
  const totalSubjects = allAttendances.length;

  if (loading && attendanceData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
          {attendanceData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No semester data available.</p>
              <a
                href="/admin"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Add Semester Data
              </a>
            </div>
          ) : (
            attendanceData.map((semesterData) => (
              <SemesterTable key={semesterData.semester} semesterData={semesterData} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

