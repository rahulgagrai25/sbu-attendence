import { createClient } from '@supabase/supabase-js';
import { SemesterData } from '@/types/attendance';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  const configured = !!supabaseUrl && !!supabaseAnonKey;
  if (!configured) {
    console.warn('Supabase not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return configured;
}

// Create Supabase client function (creates new instance each time for server-side)
function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

// Database table name
const TABLE_NAME = 'attendance_data';

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
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Failed to create Supabase client');
  }

  try {
    console.log('Reading data from Supabase...');
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: true }); // Oldest first, newest at bottom

    if (error) {
      console.error('Supabase read error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log(`Successfully read ${data?.length || 0} semesters from Supabase`);

    if (!data || data.length === 0) {
      return [];
    }

    // Convert database rows to SemesterData format
    return data.map((row: AttendanceDataRow) => ({
      semester: row.semester,
      records: row.records,
    }));
  } catch (error: any) {
    console.error('Error reading attendance data from Supabase:', error);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
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
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Failed to create Supabase client');
  }

  try {
    console.log(`Writing ${data.length} semesters to Supabase...`);

    if (data.length === 0) {
      // If no data, delete all records
      const { error: deleteError } = await supabase
        .from(TABLE_NAME)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows to delete
        console.error('Error deleting all data:', deleteError);
        throw deleteError;
      }
      console.log('All data deleted from Supabase');
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
    const { data: existingData, error: selectError } = await supabase
      .from(TABLE_NAME)
      .select('semester');

    if (selectError) {
      console.error('Error selecting existing data:', selectError);
      // Continue anyway - might be first time
    } else if (existingData) {
      const semestersToDelete = existingData
        .map((row: any) => row.semester)
        .filter((sem: string) => !semestersToKeep.has(sem));

      if (semestersToDelete.length > 0) {
        console.log(`Deleting ${semestersToDelete.length} old semesters:`, semestersToDelete);
        const { error: deleteError } = await supabase
          .from(TABLE_NAME)
          .delete()
          .in('semester', semestersToDelete);

        if (deleteError) {
          console.error('Error deleting old semesters:', deleteError);
          // Continue anyway - will try to upsert
        }
      }
    }

    // Upsert (insert or update) the data
    // Using semester as the unique constraint
    console.log('Upserting data to Supabase...');
    const { error: upsertError } = await supabase
      .from(TABLE_NAME)
      .upsert(rows, {
        onConflict: 'semester',
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error('Error upserting data:', upsertError);
      console.error('Error details:', JSON.stringify(upsertError, null, 2));
      throw upsertError;
    }

    console.log('Successfully wrote data to Supabase');
  } catch (error: any) {
    console.error('Error writing attendance data to Supabase:', error);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    throw error;
  }
}

