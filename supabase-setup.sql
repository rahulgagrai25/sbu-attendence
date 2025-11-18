-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create the attendance_data table
CREATE TABLE IF NOT EXISTS attendance_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  semester TEXT NOT NULL,
  records JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_semester UNIQUE (semester)
);

-- Create an index on semester for faster lookups
CREATE INDEX IF NOT EXISTS idx_attendance_data_semester ON attendance_data(semester);

-- Enable Row Level Security (RLS)
ALTER TABLE attendance_data ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (for simplicity)
-- For production, you should restrict this based on authentication
CREATE POLICY "Allow all operations on attendance_data"
ON attendance_data
FOR ALL
USING (true)
WITH CHECK (true);

-- Optional: Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_attendance_data_updated_at
BEFORE UPDATE ON attendance_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

