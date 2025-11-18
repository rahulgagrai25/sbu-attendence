import { NextResponse } from 'next/server';
import { isSupabaseConfigured, readAttendanceDataFromSupabase } from '@/lib/supabase';

// GET - Test Supabase connection
export async function GET() {
  try {
    const configured = isSupabaseConfigured();
    
    if (!configured) {
      return NextResponse.json({
        configured: false,
        error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.',
      }, { status: 400 });
    }

    // Try to read from Supabase
    const data = await readAttendanceDataFromSupabase();
    
    return NextResponse.json({
      configured: true,
      connected: true,
      message: 'Supabase connection successful',
      dataCount: data.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      configured: true,
      connected: false,
      error: error?.message || 'Failed to connect to Supabase',
      details: error?.code || 'Unknown error',
    }, { status: 500 });
  }
}

