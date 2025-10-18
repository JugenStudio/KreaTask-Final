
import { PrismaClient } from '@prisma/client';
import type { Task, User } from '../src/lib/types';
import { UserRole, TaskCategory, TaskStatus } from '../src/lib/types';

const prisma = new PrismaClient();

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/100/100`;

const initialUsers: User[] = [
  { id: 'user-1', name: 'Naufal', email: 'naufal@kreatask.com', avatarUrl: getAvatarUrl(1), role: UserRole.DIREKTUR_UTAMA, jabatan: 'Direktur Utama' },
  { id: 'user-2', name: 'Deva', email: 'deva@kreatask.com', avatarUrl: getAvatarUrl(2), role: UserRole.DIREKTUR_OPERASIONAL, jabatan: 'Direktur Operasional' },
  { id: 'user-3', name: 'Agus', email: 'agus@kreatask.com', avatarUrl: getAvatarUrl(3), role: UserRole.JURNALIS, jabatan: 'Jurnalis' },
  { id: 'user-4', name: 'Sasi', email: 'sasi@kreatask.com', avatarUrl: getAvatarUrl(4), role: UserRole.SOCIAL_MEDIA_OFFICER, jabatan: 'Social Media Officer' },
  { id: 'user-5', name: 'Ariya', email: 'ariya@kreatask.com', avatarUrl: getAvatarUrl(5), role: UserRole.DESAIN_GRAFIS, jabatan: 'Desain Grafis' },
  { id: 'user-9', name: 'Citra', email: 'citra@kreatask.com', avatarUrl: getAvatarUrl(9), role: UserRole.MARKETING, jabatan: 'Marketing' },
  { id: 'user-10', name: 'Doni', email: 'doni@kreatask.com', avatarUrl: getAvatarUrl(10), role: UserRole.FINANCE, jabatan: 'Finance' },
  { id: 'user-11', name: 'Budi', email: 'budi@kreatask.com', avatarUrl: getAvatarUrl(11), role: UserRole.UNASSIGNED, jabatan: 'Unassigned' },
];

const initialTasks = [
    {
        id: 'task-1',
        title: { en: 'Create monthly social media report', id: 'Buat laporan media sosial bulanan' },
        description: { en: 'Compile and analyze social media performance for October.', id: 'Kompilasi dan analisis kinerja media sosial untuk bulan Oktober.' },
        status: TaskStatus.IN_PROGRESS,
        assigneeIds: ['user-4'], // Use IDs for connection
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        category: TaskCategory.High,
        valueCategory: 'Tinggi',
        value: 40,
    },
    {
        id: 'task-2',
        title: { en: 'Design new branding assets', id: 'Rancang aset branding baru' },
        description: { en: 'Develop a new set of branding guidelines and assets.', id: 'Kembangkan set baru pedoman dan aset branding.' },
        status: TaskStatus.TODO,
        assigneeIds: ['user-5'], // Use IDs for connection
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
        category: TaskCategory.Medium,
        valueCategory: 'Menengah',
        value: 20,
    },
];

async function main() {
  console.log(`Start seeding ...`);

  // Seed Users
  for (const u of initialUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        role: u.role,
        jabatan: u.jabatan,
      },
    });
    console.log(`Created/updated user with id: ${user.id}`);
  }

  // Seed Tasks
  for (const t of initialTasks) {
     const task = await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        createdAt: new Date().toISOString(),
        dueDate: t.dueDate,
        category: t.category,
        valueCategory: t.valueCategory,
        value: t.value,
        evaluator: 'AI',
        approvedBy: null,
        assignees: {
          connect: t.assigneeIds.map((id) => ({ id })),
        },
      },
    });
    console.log(`Created/updated task with id: ${task.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
