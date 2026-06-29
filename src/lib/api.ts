const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function buildUrl(path: string) {
  return `${API_BASE}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    credentials: "include",
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${res.statusText} ${text}`);
  }

  return (await res.json()) as T;
}

export type StudentApi = {
  id: number;
  name: string;
  regNo: string;
  email: string;
  mobileNumber?: string;
  department?: string;
  pursuingYear?: string | null;
  hackerRankUsername?: string;
  startYear?: number | null;
  endYear?: number | null;
  linkedInUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  profilePicUrl?: string;
};

export type AssessmentResourceApi = {
  id: number;
  name: string;
  contentType: string;
  downloadUrl: string;
};

export type AssessmentApi = {
  id: number;
  assessmentName: string;
  dateConducted: string;
  totalMarks: number;
  resources?: AssessmentResourceApi[];
};

export type StudentAssessmentMarkApi = {
  id: number;
  marksScored: number;
  student: { id: number };
  assessment: { id: number; totalMarks: number };
};

export type StudentCreatePayload = Omit<
  StudentApi,
  "id" | "profilePicUrl" | "pursuingYear" | "startYear" | "endYear"
> & {
  pursuingYear?: string | null;
  startYear?: number | null;
  endYear?: number | null;
};

export type AssessmentCreatePayload = Omit<AssessmentApi, "id" | "resources">;

function buildStudentFormData(
  payload: StudentCreatePayload,
  file?: File,
): FormData {
  const form = new FormData();
  form.set("student", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  if (file) {
    form.set("file", file);
  }
  return form;
}

export const api = {
  getStudents: () => request<StudentApi[]>("/api/students"),
  getStudentDetails: (id: string | number) => request<StudentApi>(`/api/students/${id}/details`),
  createStudent: (payload: StudentCreatePayload, file?: File) =>
    request<StudentApi>("/api/students", {
      method: "POST",
      body: buildStudentFormData(payload, file),
    }),
  updateStudent: (id: string | number, payload: StudentCreatePayload, file?: File) =>
    request<StudentApi>(`/api/students/${id}`, {
      method: "PUT",
      body: buildStudentFormData(payload, file),
    }),
  deleteStudent: (id: string | number) =>
    request<void>(`/api/students/${id}`, { method: "DELETE" }),
  uploadStudentsExcel: (file: File) => {
    const form = new FormData();
    form.set("file", file);
    return request<Record<string, unknown>>("/api/students/upload", {
      method: "POST",
      body: form,
    });
  },

  getAssessments: () => request<AssessmentApi[]>("/api/assessments"),
  createAssessment: (payload: AssessmentCreatePayload, files?: File[]) => {
    const form = new FormData();
    form.set("assessment", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    files?.forEach((file) => form.append("resources", file));
    return request<AssessmentApi>("/api/assessments", {
      method: "POST",
      body: form,
    });
  },
  updateAssessment: (id: string | number, payload: AssessmentCreatePayload, files?: File[]) => {
    const form = new FormData();
    form.set("assessment", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    files?.forEach((file) => form.append("resources", file));
    return request<AssessmentApi>(`/api/assessments/${id}`, {
      method: "PUT",
      body: form,
    });
  },
  deleteAssessment: (id: string | number) =>
    request<void>(`/api/assessments/${id}`, { method: "DELETE" }),

  getAllMarks: () => request<StudentAssessmentMarkApi[]>("/api/marks"),
  getMarksForAssessment: (assessmentId: string | number) =>
    request<StudentAssessmentMarkApi[]>(`/api/marks/assessment/${assessmentId}`),
  assignMark: (studentId: string | number, assessmentId: string | number, marks: number) =>
    request<StudentAssessmentMarkApi>(
      `/api/marks?studentId=${studentId}&assessmentId=${assessmentId}&marks=${marks}`,
      { method: "POST" },
    ),
  deleteMark: (studentId: string | number, assessmentId: string | number) =>
    request<void>(
      `/api/marks?studentId=${studentId}&assessmentId=${assessmentId}`,
      { method: "DELETE" },
    ),
  uploadMarksExcel: (file: File, assessmentId: string | number) => {
    const form = new FormData();
    form.set("file", file);
    form.set("assessmentId", String(assessmentId));
    return request<Record<string, unknown>>("/api/marks/upload", {
      method: "POST",
      body: form,
    });
  },
};
