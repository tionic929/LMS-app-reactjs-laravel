import api from "./axios";

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  audience?: 'learners' | 'instructors' | 'all';
  date?: string;
  created_at?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
}

// Fetch CSRF cookie before mutating requests (Laravel Sanctum)
async function ensureCsrf() {
  try {
    await api.get("http://localhost:8000/sanctum/csrf-cookie");
  } catch (_) {
    // ignore; backend will reject if actually required
  }
}

// Normalize various possible backend shapes into a flat array
function normalize(raw: any): Announcement[] {
  if (!raw) return [];
  let arr: any[] = [];
  if (Array.isArray(raw)) arr = raw;
  else if (Array.isArray(raw?.data)) arr = raw.data;
  else if (Array.isArray(raw?.announcements)) arr = raw.announcements;
  else if (raw && typeof raw === "object") {
    if (raw.data && !Array.isArray(raw.data) && typeof raw.data === "object") arr = [raw.data];
    else arr = [raw];
  }
  return arr.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    type: a.type ?? "info",
    audience: a.audience ?? undefined,
    event_date: a.event_date ?? undefined,
    event_time: a.event_time ?? undefined,
    location: a.location ?? undefined,
    date: a.date ?? (a.created_at ? new Date(a.created_at).toLocaleDateString() : undefined),
    created_at: a.created_at,
  }));
}

export async function listAnnouncements(): Promise<Announcement[]> {
  const res = await api.get("/announcements");
  return normalize(res.data);
}

export async function createAnnouncement(payload: { title: string; content: string; type: string; audience: 'learners' | 'instructors' | 'all'; event_date?: string; event_time?: string; location?: string }): Promise<Announcement | null> {
  await ensureCsrf();
  const res = await api.post("/announcements", payload);
  return normalize(res.data)[0] ?? null;
}

export async function updateAnnouncement(id: number, payload: { title: string; content: string; type: string; audience?: 'learners' | 'instructors' | 'all'; event_date?: string; event_time?: string; location?: string }): Promise<Announcement | null> {
  await ensureCsrf();
  const res = await api.put(`/announcements/${id}`, payload);
  return normalize(res.data)[0] ?? null;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await ensureCsrf();
  await api.delete(`/announcements/${id}`);
}
