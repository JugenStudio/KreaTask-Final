
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { isEmployee } from '@/lib/roles';
import { prisma } from '@/lib/db'; // Assuming a server-side action file will handle this

// Server actions to interact with the database
async function fetchTasksForUser(userId: string, role: UserRole): Promise<Task[]> {
  // This would be a server action in a real app
  // For now, this logic is illustrative. The actual fetching will be done in server components or API routes.
  return [];
}

async function fetchAllUsers(): Promise<User[]> {
  return [];
}

async function fetchNotificationsForUser(userId: string): Promise<Notification[]> {
  return [];
}

type DownloadItem = {
  id: number;
  fileName: string;
  taskName: string;
  date: string;
  url: string;
  size: string;
  status: 'Completed' | 'In Progress' | 'Failed';
  progress: number;
};

const calculateLeaderboard = (tasks: Task[], users: User[]): LeaderboardEntry[] => {
    if (!tasks || !users) return [];
    
    const teamMembers = users.filter(user => isEmployee(user.role));
    if (teamMembers.length === 0) return [];

    const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string; role: any; jabatan?: string; } } = {};

    teamMembers.forEach(user => {
      userScores[user.id] = { name: user.name, score: 0, tasksCompleted: 0, avatarUrl: user.avatarUrl, role: user.role, jabatan: user.jabatan };
    });

    tasks.forEach(task => {
      if (task.status === 'Completed' && task.approvedBy) {
        task.assignees.forEach(assignee => {
          if (assignee && userScores[assignee.id]) {
            userScores[assignee.id].score += task.value;
            userScores[assignee.id].tasksCompleted += 1;
          }
        });
      }
    });

    const sortedUsers = Object.entries(userScores).sort(([, a], [, b]) => b.score - a.score);

    return sortedUsers.map(([id, data], index) => ({
      id,
      rank: index + 1,
      name: data.name,
      score: data.score,
      tasksCompleted: data.tasksCompleted,
      avatarUrl: data.avatarUrl,
      role: data.role,
      jabatan: data.jabatan,
    }));
};

export interface TaskDataContextType {
    isLoading: boolean;
    allTasks: Task[];
    users: User[];
    currentUserData: User | null;
    leaderboardData: LeaderboardEntry[];
    notifications: Notification[];
    setNotifications: (notifications: Notification[] | ((prev: Notification[]) => Notification[])) => void;
    updateNotifications: (notificationsToUpdate: Notification[]) => Promise<void>;
    downloadHistory: DownloadItem[];
    setDownloadHistory: (history: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => void;
    addTask: (task: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    addNotification: (notification: Partial<Notification>) => Promise<void>;
    updateUserInFirestore: (userId: string, data: Partial<User>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    addToDownloadHistory: (file: { name: string; size: string, url: string }, taskName: string, isRedownload?: boolean) => void;
    setAllTasks: (tasks: Task[]) => void;
    setUsers: (users: User[]) => void;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export function TaskDataProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUserData, setCurrentUserData] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    // Using a hardcoded mock user for now. This should be replaced with real auth.
    const mockUserId = 'user-1';

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                // In a real app, you would call server actions here that use Prisma
                // For now, we simulate this with empty data.
                const fetchedUsers = await fetchAllUsers();
                setUsers(fetchedUsers);

                const currentUser = fetchedUsers.find(u => u.id === mockUserId) || null;
                setCurrentUserData(currentUser);

                if (currentUser) {
                    const [fetchedTasks, fetchedNotifications] = await Promise.all([
                        fetchTasksForUser(currentUser.id, currentUser.role),
                        fetchNotificationsForUser(currentUser.id),
                    ]);
                    setAllTasks(fetchedTasks);
                    setNotifications(fetchedNotifications);
                }
            } catch (error) {
                console.error("Failed to load initial data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);


    const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
    
    useEffect(() => {
        if (currentUserData?.id) {
          try {
            const savedDownloads = localStorage.getItem(`kreatask_downloads_${currentUserData.id}`);
            if (savedDownloads) {
                setDownloadHistory(JSON.parse(savedDownloads));
            } else {
                setDownloadHistory([]);
            }
          } catch (error) {
              console.error("Failed to load downloads from localStorage:", error);
          }
        }
    }, [currentUserData?.id]);

    useEffect(() => {
      if (currentUserData?.id) {
        localStorage.setItem(`kreatask_downloads_${currentUserData.id}`, JSON.stringify(downloadHistory));
      }
    }, [downloadHistory, currentUserData?.id]);

    const leaderboardData = useMemo(() => calculateLeaderboard(allTasks, users), [allTasks, users]);

    const addTask = useCallback(async (newTaskData: Partial<Task>) => {
        // This will be replaced with a server action calling prisma.task.create
        setAllTasks(prev => [...prev, newTaskData as Task]);
    }, []);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        // This will be replaced with a server action calling prisma.task.update
        setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    }, []);

    const deleteTask = useCallback(async (taskId: string) => {
        // This will be replaced with a server action calling prisma.task.delete
        setAllTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);
    
    const updateUserInFirestore = useCallback(async (userId: string, data: Partial<User>) => {
        // This will be replaced with a server action calling prisma.user.update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    }, []);

    const deleteUser = useCallback(async (userId: string) => {
         // This will be replaced with a server action calling prisma.user.delete
        setUsers(prev => prev.filter(u => u.id !== userId));
    }, []);

    const addNotification = useCallback(async (newNotificationData: Partial<Notification>) => {
        // This will be replaced with a server action calling prisma.notification.create
        setNotifications(prev => [newNotificationData as Notification, ...prev]);
    }, []);
    
    const updateNotifications = useCallback(async (notificationsToUpdate: Notification[]) => {
        // This will be replaced with a server action
        setNotifications(prev => prev.map(n => {
            const updated = notificationsToUpdate.find(u => u.id === n.id);
            return updated || n;
        }));
    }, []);

    const addToDownloadHistory = useCallback((file: { name: string; size: string, url: string }, taskName: string, isRedownload = false) => {
      const newDownloadItem: DownloadItem = {
        id: Date.now(),
        fileName: file.name,
        taskName: taskName,
        date: new Date().toISOString(),
        size: file.size,
        url: file.url,
        status: 'In Progress',
        progress: 0,
      };
      
      setDownloadHistory(prevHistory => {
        const existingItemIndex = prevHistory.findIndex(item => item.fileName === file.name && item.taskName === taskName);
        if (isRedownload && existingItemIndex > -1) {
            const updatedHistory = [...prevHistory];
            updatedHistory[existingItemIndex] = newDownloadItem;
            return updatedHistory;
        }
        return [newDownloadItem, ...prevHistory];
      });
    }, []);
    

    const value: TaskDataContextType = useMemo(() => ({
        isLoading,
        allTasks,
        users,
        currentUserData,
        leaderboardData,
        notifications,
        setNotifications,
        updateNotifications,
        downloadHistory,
        setDownloadHistory,
        addTask,
        updateTask,
        deleteTask,
        addNotification,
        updateUserInFirestore,
        deleteUser,
        addToDownloadHistory,
        setAllTasks, 
        setUsers, 
    }), [
        isLoading, allTasks, users, currentUserData, leaderboardData, notifications, 
        downloadHistory, addTask, updateTask, deleteTask, 
        addNotification, updateUserInFirestore, deleteUser, addToDownloadHistory, updateNotifications
    ]);

    return (
        <TaskDataContext.Provider value={value}>
            {children}
        </TaskDataContext.Provider>
    );
}

export const useTaskData = () => {
    const context = useContext(TaskDataContext);
    if (context === undefined) {
        throw new Error('useTaskData must be used within a TaskDataProvider');
    }
    return context;
};
