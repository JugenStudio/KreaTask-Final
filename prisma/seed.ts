import { PrismaClient } from '@prisma/client';
import { initialUsers, initialTasks } from '../src/lib/data';
import type { Task, User } from '../src/lib/types';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Seed Users
  // Using `upsert` to avoid creating duplicate users on subsequent runs.
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
  // Using `create` as tasks are simpler to recreate. 
  // For a real-world scenario, you might want more complex logic.
  for (const t of (initialTasks as unknown as Task[])) {
     const task = await prisma.task.create({
      data: {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
        dueDate: t.dueDate,
        category: t.category,
        valueCategory: t.valueCategory,
        value: t.value,
        evaluator: t.evaluator,
        approvedBy: t.approvedBy,
        assignees: {
          connect: t.assignees.map((a) => ({ id: a.id })),
        },
        // Note: comments, revisions, files, subtasks are complex relations
        // and would require more detailed seeding logic if needed.
        // For this initial seed, we are keeping it simple.
      },
    });
    console.log(`Created task with id: ${task.id}`);
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
