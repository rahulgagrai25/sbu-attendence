import { createClient } from '@supabase/supabase-js';
import { SemesterData } from '@/types/attendance';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database table name
const TABLE_NAME = 'attendance_data';

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  const hasUrl = !!supabaseUrl && supabaseUrl.length > 0;
  const hasKey = !!supabaseAnonKey && supabaseAnonKey.length > 0;
  const isConfigured = hasUrl && hasKey && !!supabase;
  
  if (!isConfigured && (hasUrl || hasKey)) {
    // Only log warning if partially configured (helps with debugging)
    console.warn('Supabase partially configured:', {
      hasUrl,
      hasKey,
      urlLength: supabaseUrl.length,
      keyLength: supabaseAnonKey.length,
    });
  }
  
  return isConfigured;
}

// Database types
interface AttendanceDataRow {
  id: string;
  semester: string;
  records: SemesterData['records'];
  created_at?: string;
  updated_at?: string;
}

/**
 * Read all attendance data from Supabase
 */
export async function readAttendanceDataFromSupabase(): Promise<SemesterData[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  try {
    const { data, error } = await supabase!
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: true }); // Oldest first, newest at bottom

    if (error) {
      console.error('Error reading from Supabase:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Convert database rows to SemesterData format
    return data.map((row: AttendanceDataRow) => ({
      semester: row.semester,
      records: row.records,
    }));
  } catch (error) {
    console.error('Error reading attendance data from Supabase:', error);
    throw error;
  }
}

/**
 * Write attendance data to Supabase
 * Uses upsert to update existing records or insert new ones
 */
export async function writeAttendanceDataToSupabase(
  data: SemesterData[]
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  try {
    if (data.length === 0) {
      // If no data, delete all records
      const { error: deleteError } = await supabase!
        .from(TABLE_NAME)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows to delete
        console.error('Error deleting data:', deleteError);
      }
      return;
    }

    // Prepare data for upsert
    const rows: Omit<AttendanceDataRow, 'id' | 'created_at' | 'updated_at'>[] = data.map(
      (semester) => ({
        semester: semester.semester,
        records: semester.records,
      })
    );

    // Get list of semesters we're keeping
    const semestersToKeep = new Set(data.map(d => d.semester));

    // Delete semesters that are no longer in the data
    const { data: existingData } = await supabase!
      .from(TABLE_NAME)
      .select('semester');

    if (existingData) {
      const semestersToDelete = existingData
        .map(row => row.semester)
        .filter(sem => !semestersToKeep.has(sem));

      if (semestersToDelete.length > 0) {
        const { error: deleteError } = await supabase!
          .from(TABLE_NAME)
          .delete()
          .in('semester', semestersToDelete);

        if (deleteError) {
          console.error('Error deleting old semesters:', deleteError);
        }
      }
    }

    // Upsert (insert or update) the data
    // Using semester as the unique constraint
    const { error: upsertError } = await supabase!
      .from(TABLE_NAME)
      .upsert(rows, {
        onConflict: 'semester',
        ignoreDuplicates: false,
      })
      .select();

    if (upsertError) {
      console.error('Error upserting data to Supabase:', upsertError);
      console.error('Error code:', upsertError.code);
      console.error('Error message:', upsertError.message);
      console.error('Error details:', upsertError.details);
      throw upsertError;
    }
    
    console.log('✅ Successfully upserted', rows.length, 'semesters to Supabase');
  } catch (error) {
    console.error('Error writing attendance data to Supabase:', error);
    throw error;
  }
}

