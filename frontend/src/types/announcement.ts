// types.ts
export interface Announcement {
    id: number;
    title: string;
    content: string;
    category: 'System' | 'Feature' | 'Maintenance' | 'Security';
    date: string; // ISO string format
    isNew: boolean;
}