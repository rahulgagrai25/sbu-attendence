export interface AttendanceRecord {
  paperCode: string;
  subject: string;
  batchCode: string;
  conducted: number;
  present: number;
  absent: number;
  attendancePercent: number;
}

export interface SemesterData {
  semester: string;
  records: AttendanceRecord[];
}

export interface StudentInfo {
  userName: string;
  name: string;
  roles: string;
  degree: string;
  college: string;
}

