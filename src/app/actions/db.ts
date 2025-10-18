
'use server';

import { prisma } from '@/lib/db';
import type { Task, User, Notification, TaskStatus } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { isEmployee } from '@/lib/roles';

// Fetch Actions
export async function getUser(userId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user as User | null;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
}


export async function fetchTasksForUser(userId: string, role: UserRole): Promise<Task[]> {
  try {
    let whereClause = {};
    if (isEmployee(role)) {
      whereClause = {
        assignees: {
          some: {
            id: userId,
          },
        },
      };
    }
    // Directors and Admins have no specific whereClause, fetching all tasks.

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignees: true,
        comments: {
          include: {
            author: true,
          },
        },
        revisions: {
          include: {
            author: true,
          },
        },
        files: true,
        subtasks: true,
      },
    });
    return tasks as unknown as Task[];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

export async function fetchAllUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany();
    return users as unknown as User[];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function fetchNotificationsForUser(userId: string): Promise<Notification[]> {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications as unknown as Notification[];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}


// Mutation Actions

export async function createUser(userData: User): Promise<User | null> {
  try {
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        // Prisma will handle role enum conversion
        role: userData.role as any,
      },
    });
    return newUser as User;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function createTask(taskData: Partial<Task>): Promise<Task | null> {
  const { assignees, ...rest } = taskData;
  try {
    const createdTask = await prisma.task.create({
      data: {
        ...(rest as any), // Cast to any to handle type mismatch for complex fields
        assignees: {
          connect: assignees?.map(a => ({ id: a.id })),
        },
      },
      include: { assignees: true, comments: true, revisions: true, files: true, subtasks: true }
    });
    return createdTask as unknown as Task;
  } catch (error) {
    console.error("Error creating task:", error);
    return null;
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  const { assignees, ...rest } = updates;
  try {
    const data: any = { ...rest };
    if (assignees) {
      data.assignees = {
        set: assignees.map(a => ({ id: a.id })),
      };
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: data,
      include: { assignees: true, comments: true, revisions: true, files: true, subtasks: true }
    });
    return updatedTask as unknown as Task;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return null;
  }
}

export async function deleteTask(taskId: string) {
  try {
    await prisma.task.delete({ where: { id: taskId } });
    return { success: true };
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return { success: false, error: "Failed to delete task" };
  }
}

export async function updateUser(userId: string, data: Partial<User>) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: data as any,
    });
    return updatedUser as unknown as User;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    return null;
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function createNotification(notificationData: Partial<Notification>) {
  try {
    const newNotification = await prisma.notification.create({
      data: notificationData as any,
    });
    return newNotification as unknown as Notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function updateNotifications(notificationIds: string[]) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating notifications:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}
