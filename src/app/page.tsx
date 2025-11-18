import { SemesterData } from '@/types/attendance';
import { promises as fs } from 'fs';
import path from 'path';
import PageWithPreloader from '@/components/PageWithPreloader';

async function getAttendanceData(): Promise<SemesterData[]> {
  try {
    const dataFilePath = path.join(process.cwd(), 'data', 'attendance.json');
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading attendance data:', error);
    return [];
  }
}

export default async function Home() {
  const initialData = await getAttendanceData();

  return <PageWithPreloader initialData={initialData} />;
}
