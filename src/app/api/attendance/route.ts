import { NextRequest, NextResponse } from 'next/server';
import { SemesterData, AttendanceRecord } from '@/types/attendance';
import { readAttendanceData, writeAttendanceData } from '@/lib/storage';

// GET - Read attendance data
export async function GET() {
  try {
    const data = await readAttendanceData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to read attendance data' },
      { status: 500 }
    );
  }
}

// POST - Add new semester data
export async function POST(request: NextRequest) {
  try {
    // Read existing data
    const existingData: SemesterData[] = await readAttendanceData();

    // Parse request body
    const body = await request.json();
    const { semester, records } = body;

    // Validate input
    if (!semester || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Invalid data format. Semester and records array are required.' },
        { status: 400 }
      );
    }

    // Calculate attendance percentage for each record
    const processedRecords: AttendanceRecord[] = records.map((record: any) => {
      const attendancePercent = record.conducted > 0
        ? (record.present / record.conducted) * 100
        : 0;
      
      return {
        paperCode: record.paperCode,
        subject: record.subject,
        batchCode: record.batchCode,
        conducted: record.conducted,
        present: record.present,
        absent: record.absent,
        attendancePercent: parseFloat(attendancePercent.toFixed(2)),
      };
    });

    // Create new semester data
    const newSemester: SemesterData = {
      semester,
      records: processedRecords,
    };

    // Check if semester already exists
    const semesterIndex = existingData.findIndex(
      (sem) => sem.semester === semester
    );

    if (semesterIndex >= 0) {
      // Update existing semester
      existingData[semesterIndex] = newSemester;
    } else {
      // Add new semester
      existingData.push(newSemester);
    }

    // Write back to storage
    await writeAttendanceData(existingData);

    return NextResponse.json({
      success: true,
      message: semesterIndex >= 0
        ? 'Semester updated successfully'
        : 'Semester added successfully',
      data: newSemester,
    });
  } catch (error) {
    console.error('Error writing attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to save attendance data' },
      { status: 500 }
    );
  }
}

// DELETE - Delete semester or record
export async function DELETE(request: NextRequest) {
  try {
    // Read existing data
    const existingData: SemesterData[] = await readAttendanceData();

    // Parse request body
    const body = await request.json();
    const { semester, paperCode } = body;

    if (!semester) {
      return NextResponse.json(
        { error: 'Semester is required' },
        { status: 400 }
      );
    }

    // Find semester
    const semesterIndex = existingData.findIndex(
      (sem) => sem.semester === semester
    );

    if (semesterIndex === -1) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    // If paperCode is provided, delete only that record
    if (paperCode) {
      const semesterData = existingData[semesterIndex];
      const recordIndex = semesterData.records.findIndex(
        (r) => r.paperCode === paperCode
      );

      if (recordIndex === -1) {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      }

      // Remove the record
      semesterData.records.splice(recordIndex, 1);

      // If no records left, remove the semester
      if (semesterData.records.length === 0) {
        existingData.splice(semesterIndex, 1);
      }

      await writeAttendanceData(existingData);

      return NextResponse.json({
        success: true,
        message: 'Record deleted successfully',
      });
    } else {
      // Delete entire semester
      existingData.splice(semesterIndex, 1);

      await writeAttendanceData(existingData);

      return NextResponse.json({
        success: true,
        message: 'Semester deleted successfully',
      });
    }
  } catch (error) {
    console.error('Error deleting attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to delete attendance data' },
      { status: 500 }
    );
  }
}

