
import type { User, Task } from './types';
import { UserRole, TaskCategory, TaskStatus } from './types';

// NOTE: This file is now used only for seeding data for the first time via `prisma/seed.ts`.
// The application itself fetches live data from the database.

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/100/100`;

export const initialUsers: User[] = [
  { id: 'user-1', name: 'Naufal', email: 'naufal@kreatask.com', avatarUrl: getAvatarUrl(1), role: UserRole.DIREKTUR_UTAMA, jabatan: 'Direktur Utama' },
  { id: 'user-2', name: 'Deva', email: 'deva@kreatask.com', avatarUrl: getAvatarUrl(2), role: UserRole.DIREKTUR_OPERASIONAL, jabatan: 'Direktur Operasional' },
  { id: 'user-3', name: 'Agus', email: 'agus@kreatask.com', avatarUrl: getAvatarUrl(3), role: UserRole.JURNALIS, jabatan: 'Jurnalis' },
  { id: 'user-4', name: 'Sasi', email: 'sasi@kreatask.com', avatarUrl: getAvatarUrl(4), role: UserRole.SOCIAL_MEDIA_OFFICER, jabatan: 'Social Media Officer' },
  { id: 'user-5', name: 'Ariya', email: 'ariya@kreatask.com', avatarUrl: getAvatarUrl(5), role: UserRole.DESAIN_GRAFIS, jabatan: 'Desain Grafis' },
  { id: 'user-9', name: 'Citra', email: 'citra@kreatask.com', avatarUrl: getAvatarUrl(9), role: UserRole.MARKETING, jabatan: 'Marketing' },
  { id: 'user-10', name: 'Doni', email: 'doni@kreatask.com', avatarUrl: getAvatarUrl(10), role: UserRole.FINANCE, jabatan: 'Finance' },
  { id: 'user-11', name: 'Budi', email: 'budi@kreatask.com', avatarUrl: getAvatarUrl(11), role: UserRole.UNASSIGNED, jabatan: 'Unassigned' },
];

export const initialTasks = [
    {
        id: 'task-1',
        title: { en: 'Create monthly social media report', id: 'Buat laporan media sosial bulanan' },
        description: { en: 'Compile and analyze social media performance for October.', id: 'Kompilasi dan analisis kinerja media sosial untuk bulan Oktober.' },
        status: TaskStatus.IN_PROGRESS,
        assignees: [initialUsers[3]],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        revisions: [],
        comments: [],
        files: [],
        subtasks: [],
        createdAt: new Date().toISOString(),
        category: TaskCategory.High,
        valueCategory: 'Tinggi',
        value: 40,
        evaluator: 'AI',
        approvedBy: null,
    },
    {
        id: 'task-2',
        title: { en: 'Design new branding assets', id: 'Rancang aset branding baru' },
        description: { en: 'Develop a new set of branding guidelines and assets.', id: 'Kembangkan set baru pedoman dan aset branding.' },
        status: TaskStatus.TODO,
        assignees: [initialUsers[4]],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
        revisions: [],
        comments: [],
        files: [],
        subtasks: [],
        createdAt: new Date().toISOString(),
        category: TaskCategory.Medium,
        valueCategory: 'Menengah',
        value: 20,
        evaluator: 'AI',
        approvedBy: null,
    },
];
