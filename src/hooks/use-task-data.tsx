
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { initialData } from '@/lib/data'; // Using mock data for now
import { UserRole } from '@/lib/types';
import { isEmployee } from '@/lib/roles';

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
    // --- TEMPORARY MOCK DATA STATE ---
    const [isLoading, setIsLoading] = useState(true);
    const [allTasks, setAllTasks] = useState<Task[]>(initialData.allTasks);
    const [users, setUsers] = useState<User[]>(initialData.users);
    const [currentUserData, setCurrentUserData] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>(initialData.mockNotifications);
    
    // Using a hardcoded mock user for now. In the future this will come from auth.
    const mockUserId = 'user-1';

    useEffect(() => {
        // Simulate fetching data
        const timer = setTimeout(() => {
            setCurrentUserData(users.find(u => u.id === mockUserId) || null);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [users]);


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
        setAllTasks(prev => [...prev, newTaskData as Task]);
    }, []);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    }, []);

    const deleteTask = useCallback(async (taskId: string) => {
        setAllTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);
    
    const updateUserInFirestore = useCallback(async (userId: string, data: Partial<User>) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    }, []);

    const deleteUser = useCallback(async (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    }, []);

    const addNotification = useCallback(async (newNotificationData: Partial<Notification>) => {
        setNotifications(prev => [newNotificationData as Notification, ...prev]);
    }, []);
    
    const updateNotifications = useCallback(async (notificationsToUpdate: Notification[]) => {
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
        setAllTasks, // Keep for compatibility
        setUsers, // Keep for compatibility
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
