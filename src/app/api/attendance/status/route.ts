import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const configured = isSupabaseConfigured();
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return NextResponse.json({
    supabaseConfigured: configured,
    hasUrl,
    hasKey,
    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
  });
}

