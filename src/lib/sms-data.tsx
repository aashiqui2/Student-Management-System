import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PursuingYear =
  | "FIRST_YEAR"
  | "SECOND_YEAR"
  | "THIRD_YEAR"
  | "FOURTH_YEAR";

export const PURSUING_YEARS: { value: PursuingYear; label: string }[] = [
  { value: "FIRST_YEAR", label: "First Year" },
  { value: "SECOND_YEAR", label: "Second Year" },
  { value: "THIRD_YEAR", label: "Third Year" },
  { value: "FOURTH_YEAR", label: "Fourth Year" },
];

export interface Student {
  id: string;
  name: string;
  regNo: string;
  email: string;
  mobileNumber?: string;
  department?: string;
  pursuingYear?: PursuingYear | "";
  hackerRankUsername?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  startYear?: string;
  endYear?: string;
}

export interface AssessmentResource {
  name: string;
  type: string; // mime type or extension
  dataUrl: string; // base64 data URL
}

export interface Assessment {
  id: string;
  assessmentName: string;
  dateConducted: string; // ISO date
  totalMarks: number;
  resources?: AssessmentResource[];
}

/** key: `${studentId}:${assessmentId}` -> marks scored */
export type MarksMap = Record<string, number>;

export type Category = "Level 1" | "Level 2" | "Level 3" | "Uncategorized";

export interface StudentSummary extends Student {
  totalMarks: number;
  averageMarks: number; // average percentage across attempted assessments
  attempts: number;
  category: Category;
}

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)) as string;

// ---- Seed data -------------------------------------------------------------

const seedStudents: Student[] = [
  {
    id: "s1",
    name: "Aarav Sharma",
    regNo: "21CSE001",
    email: "aarav.sharma@college.edu",
    mobileNumber: "9876543210",
    department: "CSE",
    pursuingYear: "THIRD_YEAR",
    hackerRankUsername: "aarav_s",
    githubUrl: "https://github.com/aarav",
    startYear: "2021",
    endYear: "2025",
  },
  {
    id: "s2",
    name: "Diya Patel",
    regNo: "21IT014",
    email: "diya.patel@college.edu",
    mobileNumber: "9812345678",
    department: "IT",
    pursuingYear: "THIRD_YEAR",
    startYear: "2021",
    endYear: "2025",
  },
  {
    id: "s3",
    name: "Rohan Verma",
    regNo: "21ECE022",
    email: "rohan.verma@college.edu",
    department: "ECE",
    pursuingYear: "SECOND_YEAR",
    startYear: "2022",
    endYear: "2026",
  },
  {
    id: "s4",
    name: "Ishita Nair",
    regNo: "21CSE045",
    email: "ishita.nair@college.edu",
    mobileNumber: "9090909090",
    department: "CSE",
    pursuingYear: "FOURTH_YEAR",
    hackerRankUsername: "ishita_codes",
    startYear: "2020",
    endYear: "2024",
  },
  {
    id: "s5",
    name: "Karthik Reddy",
    regNo: "21IT008",
    email: "karthik.reddy@college.edu",
    department: "IT",
    pursuingYear: "THIRD_YEAR",
    startYear: "2021",
    endYear: "2025",
  },
];

const seedAssessments: Assessment[] = [
  { id: "a1", assessmentName: "Data Structures Quiz", dateConducted: "2026-03-14", totalMarks: 50 },
  { id: "a2", assessmentName: "Algorithms Midterm", dateConducted: "2026-04-02", totalMarks: 100 },
  { id: "a3", assessmentName: "Coding Challenge", dateConducted: "2026-05-20", totalMarks: 75 },
];

const seedMarks: MarksMap = {
  "s1:a1": 47,
  "s1:a2": 91,
  "s1:a3": 70,
  "s2:a1": 32,
  "s2:a2": 58,
  "s2:a3": 49,
  "s3:a1": 18,
  "s3:a2": 35,
  "s4:a1": 49,
  "s4:a2": 95,
  "s4:a3": 73,
  "s5:a1": 28,
  "s5:a2": 44,
  "s5:a3": 30,
};

// ---- Category logic --------------------------------------------------------

export function categorize(averagePct: number, attempts: number): Category {
  if (attempts === 0) return "Uncategorized";
  if (averagePct >= 75) return "Level 1";
  if (averagePct >= 40) return "Level 2";
  return "Level 3";
}

// ---- Store -----------------------------------------------------------------

interface SMSContextValue {
  students: Student[];
  assessments: Assessment[];
  marks: MarksMap;
  summaries: StudentSummary[];
  getStudent: (id: string) => Student | undefined;
  getSummary: (id: string) => StudentSummary | undefined;
  getAssessment: (id: string) => Assessment | undefined;
  addStudent: (s: Omit<Student, "id">) => Student;
  updateStudent: (id: string, s: Omit<Student, "id">) => void;
  deleteStudent: (id: string) => void;
  addAssessment: (a: Omit<Assessment, "id">) => Assessment;
  updateAssessment: (id: string, a: Omit<Assessment, "id">) => void;
  deleteAssessment: (id: string) => void;
  setMark: (studentId: string, assessmentId: string, marks: number | null) => void;
}

const SMSContext = createContext<SMSContextValue | null>(null);

const STORAGE_KEY = "edutrack-state-v1";

interface PersistShape {
  students: Student[];
  assessments: Assessment[];
  marks: MarksMap;
}

export function SMSProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(seedStudents);
  const [assessments, setAssessments] = useState<Assessment[]>(seedAssessments);
  const [marks, setMarks] = useState<MarksMap>(seedMarks);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistShape;
        if (parsed.students) setStudents(parsed.students);
        if (parsed.assessments) setAssessments(parsed.assessments);
        if (parsed.marks) setMarks(parsed.marks);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ students, assessments, marks } satisfies PersistShape),
      );
    } catch {
      /* ignore */
    }
  }, [students, assessments, marks]);

  const summaries = useMemo<StudentSummary[]>(() => {
    return students.map((student) => {
      let total = 0;
      let pctSum = 0;
      let attempts = 0;
      for (const a of assessments) {
        const key = `${student.id}:${a.id}`;
        if (key in marks) {
          const scored = marks[key];
          total += scored;
          pctSum += a.totalMarks > 0 ? (scored / a.totalMarks) * 100 : 0;
          attempts += 1;
        }
      }
      const averageMarks = attempts > 0 ? pctSum / attempts : 0;
      return {
        ...student,
        totalMarks: total,
        averageMarks,
        attempts,
        category: categorize(averageMarks, attempts),
      };
    });
  }, [students, assessments, marks]);

  const value: SMSContextValue = {
    students,
    assessments,
    marks,
    summaries,
    getStudent: (id) => students.find((s) => s.id === id),
    getSummary: (id) => summaries.find((s) => s.id === id),
    getAssessment: (id) => assessments.find((a) => a.id === id),
    addStudent: (s) => {
      const created = { ...s, id: uid() };
      setStudents((prev) => [...prev, created]);
      return created;
    },
    updateStudent: (id, s) =>
      setStudents((prev) => prev.map((p) => (p.id === id ? { ...s, id } : p))),
    deleteStudent: (id) => {
      setStudents((prev) => prev.filter((p) => p.id !== id));
      setMarks((prev) => {
        const next: MarksMap = {};
        for (const k of Object.keys(prev)) {
          if (!k.startsWith(`${id}:`)) next[k] = prev[k];
        }
        return next;
      });
    },
    addAssessment: (a) => {
      const created = { ...a, id: uid() };
      setAssessments((prev) => [...prev, created]);
      return created;
    },
    updateAssessment: (id, a) =>
      setAssessments((prev) => prev.map((p) => (p.id === id ? { ...a, id } : p))),
    deleteAssessment: (id) => {
      setAssessments((prev) => prev.filter((p) => p.id !== id));
      setMarks((prev) => {
        const next: MarksMap = {};
        for (const k of Object.keys(prev)) {
          if (!k.endsWith(`:${id}`)) next[k] = prev[k];
        }
        return next;
      });
    },
    setMark: (studentId, assessmentId, m) =>
      setMarks((prev) => {
        const key = `${studentId}:${assessmentId}`;
        const next = { ...prev };
        if (m === null || Number.isNaN(m)) delete next[key];
        else next[key] = m;
        return next;
      }),
  };

  return <SMSContext.Provider value={value}>{children}</SMSContext.Provider>;
}

export function useSMS() {
  const ctx = useContext(SMSContext);
  if (!ctx) throw new Error("useSMS must be used within SMSProvider");
  return ctx;
}
