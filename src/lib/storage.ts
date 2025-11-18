import { SemesterData } from '@/types/attendance';
import {
  isSupabaseConfigured,
  readAttendanceDataFromSupabase,
  writeAttendanceDataToSupabase,
} from './supabase';

// In-memory storage as fallback (data resets on server restart)
let memoryStorage: SemesterData[] = [];

// Check if we're in a serverless environment
const isServerless = typeof process !== 'undefined' && 
  (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NEXT_PUBLIC_IS_SERVERLESS === 'true');

/**
 * Get default data - used when file system is not available
 */
function getDefaultData(): SemesterData[] {
  return [
    {
      semester: 'SEMESTER I',
      records: [
        {
          paperCode: 'BBA-101',
          subject: 'Principles of Management',
          batchCode: 'D',
          conducted: 30,
          present: 17,
          absent: 13,
          attendancePercent: 56.67,
        },
      ],
    },
  ];
}

/**
 * Read attendance data
 * Priority: Supabase > File System > Memory Storage
 */
export async function readAttendanceData(): Promise<SemesterData[]> {
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const data = await readAttendanceDataFromSupabase();
      // Update memory storage as backup
      memoryStorage = data;
      console.log('✅ Successfully read from Supabase:', data.length, 'semesters');
      return data; // Return even if empty array
    } catch (error) {
      console.error('❌ Error reading from Supabase, falling back to file system:', error);
      // Fall through to file system
    }
  } else {
    console.log('⚠️ Supabase not configured, using file system');
  }

  // Try to read from file system (works for reads even in serverless)
  try {
    const { promises: fs } = await import('fs');
    const path = await import('path');
    const dataFilePath = path.join(process.cwd(), 'data', 'attendance.json');
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Update memory storage with file data
    if (data && Array.isArray(data) && data.length > 0) {
      memoryStorage = data;
      // If Supabase is configured, sync file data to Supabase
      if (isSupabaseConfigured()) {
        try {
          await writeAttendanceDataToSupabase(data);
        } catch (error) {
          console.error('Error syncing to Supabase:', error);
        }
      }
    }
    
    return data;
  } catch (error) {
    // File read failed - use memory storage
    if (memoryStorage.length === 0) {
      // Try to initialize from default data
      memoryStorage = getDefaultData();
    }
    return memoryStorage;
  }
}

/**
 * Write attendance data
 * Priority: Supabase > File System > Memory Storage
 */
export async function writeAttendanceData(data: SemesterData[]): Promise<void> {
  // Update memory storage first
  memoryStorage = data;

  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      await writeAttendanceDataToSupabase(data);
      console.log('✅ Successfully wrote to Supabase:', data.length, 'semesters');
      return; // Success - no need to write to file
    } catch (error) {
      console.error('❌ Error writing to Supabase, falling back to file system:', error);
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      // Fall through to file system
    }
  } else {
    console.log('⚠️ Supabase not configured, using file system');
  }

  // Try file system (only works on regular servers, not serverless)
  if (!isServerless) {
    try {
      const { promises: fs } = await import('fs');
      const path = await import('path');
      const dataFilePath = path.join(process.cwd(), 'data', 'attendance.json');
      await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
      return;
    } catch (error) {
      console.error('Error writing to file system:', error);
      // Already stored in memory, so continue
    }
  }

  // If we reach here, data is only in memory
  // This is fine for serverless if Supabase is configured (it will be written on next request)
  if (!isSupabaseConfigured() && isServerless) {
    console.warn('Warning: Data is only stored in memory. It will be lost on server restart. Please configure Supabase for persistent storage.');
  }
}

