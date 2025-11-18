'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { studentInfo } from '@/data/attendanceData';
import { AttendanceRecord, SemesterData } from '@/types/attendance';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('manage');
  const [semester, setSemester] = useState('');
  const [records, setRecords] = useState<Omit<AttendanceRecord, 'attendancePercent'>[]>([
    {
      paperCode: '',
      subject: '',
      batchCode: '',
      conducted: 0,
      present: 0,
      absent: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [allSemesters, setAllSemesters] = useState<SemesterData[]>([]);
  const [editingSemester, setEditingSemester] = useState<string | null>(null);

  useEffect(() => {
    fetchAllSemesters();
  }, []);

  const fetchAllSemesters = async () => {
    try {
      const response = await fetch('/api/attendance');
      const data: SemesterData[] = await response.json();
      setAllSemesters(data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const addRecord = () => {
    setRecords([
      ...records,
      {
        paperCode: '',
        subject: '',
        batchCode: '',
        conducted: 0,
        present: 0,
        absent: 0,
      },
    ]);
  };

  const removeRecord = (index: number) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  const updateRecord = (index: number, field: keyof AttendanceRecord, value: string | number) => {
    const newRecords = [...records];
    newRecords[index] = { ...newRecords[index], [field]: value };
    
    if (field === 'present' || field === 'conducted') {
      const conducted = field === 'conducted' ? Number(value) : newRecords[index].conducted;
      const present = field === 'present' ? Number(value) : newRecords[index].present;
      newRecords[index].absent = Math.max(0, conducted - present);
    }
    
    setRecords(newRecords);
  };

  const loadSemesterForEdit = (semesterData: SemesterData) => {
    setSemester(semesterData.semester);
    setRecords(
      semesterData.records.map((r) => ({
        paperCode: r.paperCode,
        subject: r.subject,
        batchCode: r.batchCode,
        conducted: r.conducted,
        present: r.present,
        absent: r.absent,
      }))
    );
    setEditingSemester(semesterData.semester);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setSemester('');
    setRecords([
      {
        paperCode: '',
        subject: '',
        batchCode: '',
        conducted: 0,
        present: 0,
        absent: 0,
      },
    ]);
    setEditingSemester(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!semester.trim()) {
      setMessage({ type: 'error', text: 'Please enter a semester name' });
      setLoading(false);
      return;
    }

    if (records.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one record' });
      setLoading(false);
      return;
    }

    for (const record of records) {
      if (!record.paperCode.trim() || !record.subject.trim() || !record.batchCode.trim()) {
        setMessage({ type: 'error', text: 'Please fill in all required fields for all records' });
        setLoading(false);
        return;
      }
      if (record.conducted < 0 || record.present < 0 || record.absent < 0) {
        setMessage({ type: 'error', text: 'Values cannot be negative' });
        setLoading(false);
        return;
      }
      if (record.present + record.absent !== record.conducted) {
        setMessage({ type: 'error', text: 'Present + Absent must equal Conducted for all records' });
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ semester, records }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        resetForm();
        // Refresh the list immediately
        await fetchAllSemesters();
        setTimeout(() => {
          setActiveTab('manage');
          setMessage(null);
        }, 2000);
      } else {
        const errorMsg = result.error || 'Failed to save data';
        setMessage({ 
          type: 'error', 
          text: `${errorMsg}. Please check your Supabase configuration and deployment logs.` 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving data' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSemester = async (semesterName: string) => {
    if (!confirm(`Are you sure you want to delete ${semesterName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/attendance', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ semester: semesterName }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        await fetchAllSemesters();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorMsg = result.error || 'Failed to delete semester';
        setMessage({ 
          type: 'error', 
          text: `${errorMsg}. Please check your Supabase configuration.` 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while deleting semester' });
    }
  };

  const handleDeleteRecord = async (semesterName: string, paperCode: string) => {
    if (!confirm(`Are you sure you want to delete this record (${paperCode})?`)) {
      return;
    }

    try {
      const response = await fetch('/api/attendance', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ semester: semesterName, paperCode }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        await fetchAllSemesters();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorMsg = result.error || 'Failed to delete record';
        setMessage({ 
          type: 'error', 
          text: `${errorMsg}. Please check your Supabase configuration.` 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while deleting record' });
    }
  };

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
              <span>Admin Portal</span>
              <span className="hidden sm:inline">|</span>
              <button
                onClick={() => router.push('/')}
                className="text-blue-200 hover:text-white transition-colors"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-5 lg:py-6">
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
                Admin Panel - Manage Attendance Data
              </h1>
              <p className="text-sm sm:text-base text-blue-700 font-medium mt-1">
                Add, edit, and delete semester attendance records
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-10">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6 border-l-4 border-blue-600">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('manage');
                resetForm();
              }}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'manage'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Manage Semesters
            </button>
            <button
              onClick={() => {
                setActiveTab('add');
                resetForm();
              }}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'add'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {editingSemester ? 'Edit Semester' : 'Add New Semester'}
            </button>
          </div>
        </div>

        {/* Manage Semesters Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-4">
            {allSemesters.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600 text-center">
                <p className="text-gray-600 mb-4">No semesters found.</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Add First Semester
                </button>
              </div>
            ) : (
              allSemesters.map((semesterData) => (
                <div
                  key={semesterData.semester}
                  className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-l-4 border-blue-600"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                        {semesterData.semester}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {semesterData.records.length} record(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadSemesterForEdit(semesterData)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSemester(semesterData.semester)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          <th className="px-3 py-2 text-left font-semibold">Paper Code</th>
                          <th className="px-3 py-2 text-left font-semibold">Subject</th>
                          <th className="px-3 py-2 text-center font-semibold">Conducted</th>
                          <th className="px-3 py-2 text-center font-semibold">Present</th>
                          <th className="px-3 py-2 text-center font-semibold">Absent</th>
                          <th className="px-3 py-2 text-center font-semibold">Attendance %</th>
                          <th className="px-3 py-2 text-center font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semesterData.records.map((record, index) => (
                          <tr
                            key={record.paperCode}
                            className={`border-b border-gray-200 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="px-3 py-2 font-medium">{record.paperCode}</td>
                            <td className="px-3 py-2">{record.subject}</td>
                            <td className="px-3 py-2 text-center">{record.conducted}</td>
                            <td className="px-3 py-2 text-center text-green-700 font-medium">
                              {record.present}
                            </td>
                            <td className="px-3 py-2 text-center text-red-700 font-medium">
                              {record.absent}
                            </td>
                            <td className="px-3 py-2 text-center font-semibold">
                              {record.attendancePercent.toFixed(2)}%
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() =>
                                  handleDeleteRecord(semesterData.semester, record.paperCode)
                                }
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add/Edit Semester Tab */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border-l-4 border-blue-600">
            {editingSemester && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Editing:</strong> {editingSemester}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Semester Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Semester Name *
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="e.g., SEMESTER I, SEMESTER II"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!!editingSemester}
                />
                {editingSemester && (
                  <p className="mt-1 text-xs text-gray-500">
                    Semester name cannot be changed. To rename, delete and create a new one.
                  </p>
                )}
              </div>

              {/* Records Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Attendance Records *
                  </label>
                  <button
                    type="button"
                    onClick={addRecord}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + Add Record
                  </button>
                </div>

                <div className="space-y-4">
                  {records.map((record, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Record {index + 1}
                        </h3>
                        {records.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRecord(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Paper Code *
                          </label>
                          <input
                            type="text"
                            value={record.paperCode}
                            onChange={(e) =>
                              updateRecord(index, 'paperCode', e.target.value)
                            }
                            placeholder="e.g., BBA-101"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Subject *
                          </label>
                          <input
                            type="text"
                            value={record.subject}
                            onChange={(e) =>
                              updateRecord(index, 'subject', e.target.value)
                            }
                            placeholder="e.g., Principles of Management"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Batch Code *
                          </label>
                          <input
                            type="text"
                            value={record.batchCode}
                            onChange={(e) =>
                              updateRecord(index, 'batchCode', e.target.value)
                            }
                            placeholder="e.g., D"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Conducted *
                          </label>
                          <input
                            type="number"
                            value={record.conducted || ''}
                            onChange={(e) =>
                              updateRecord(index, 'conducted', Number(e.target.value) || 0)
                            }
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Present *
                          </label>
                          <input
                            type="number"
                            value={record.present || ''}
                            onChange={(e) =>
                              updateRecord(index, 'present', Number(e.target.value) || 0)
                            }
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Absent (Auto-calculated)
                          </label>
                          <input
                            type="number"
                            value={record.absent || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Saving...'
                    : editingSemester
                    ? 'Update Semester'
                    : 'Save Semester Data'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('manage');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 text-white mt-10 sm:mt-12 lg:mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <p className="text-center text-sm text-gray-400">
            © Copyright 2024 {studentInfo.college}. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
