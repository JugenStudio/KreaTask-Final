

export enum UserRole {
  ADMIN = "roles_super_admin",
  DIREKTUR_UTAMA = "roles_admin",
  DIREKTUR_OPERASIONAL = "roles_team_leader",
  JURNALIS = "roles_team_member",
  SOCIAL_MEDIA_OFFICER = "Social_Media_Officer",
  DESAIN_GRAFIS = "Desain_Grafis",
  MARKETING = "Marketing",
  FINANCE = "Finance",
  UNASSIGNED = "Unassigned",
}

export enum TaskCategory {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum TaskStatus {
    TODO = "To-do",
    IN_PROGRESS = "In Progress",
    IN_REVIEW = "In Review",
    COMPLETED = "Completed",
    BLOCKED = "Blocked"
}

export type LocalizedString = {
  en: string;
  id: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  jabatan?: string; // Add optional jabatan field
}

export interface File {
  id: string;
  name: string;
  type: 'video' | 'image' | 'illustration' | 'document';
  url: string;
  size: string;
  note?: string;
}

export interface Comment {
  id: string;
  author: User;
  timestamp: string;
  content: LocalizedString;
  isPinned: boolean;
}

export interface Revision {
  id: string;
  timestamp: string;
  author: User;
  change: LocalizedString;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export type Evaluator = "AI" | "Direktur Operasional" | "Direktur Bisnis" | "Direktur Utama";
export type ValueCategory = "Rendah" | "Menengah" | "Tinggi" | "Kritis";


export interface Task {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  status: TaskStatus;
  assignees: User[];
  dueDate: string;
  revisions: Revision[];
  comments: Comment[];
  files: File[];
  subtasks: Subtask[];
  createdAt: string;
  category: TaskCategory; // Priority: low, medium, high
  
  // New performance value system
  valueCategory: ValueCategory;
  value: number; // 10, 20, 40
  evaluator: Evaluator;
  approvedBy: "Direktur Utama" | null;
}

export interface LeaderboardEntry {
    id: string;
    rank: number;
    name: string;
    score: number;
    tasksCompleted: number;
    avatarUrl: string;
    role: UserRole;
    jabatan?: string;
}

export interface DetailedReportEntry {
    id: string;
    taskId: string;
    employeeName: string;
    taskTitle: LocalizedString;
    role: UserRole;
    priority: string;
    deadline: string;
    completedOn: string;
    status: string;
    revisions: number;
    taskScore: number;
    aiJustification: LocalizedString;
    reviewer: string;
    assessmentDate: string;
}

export type NotificationType =
  | "TASK_ASSIGN"
  | "TASK_REVIEW"
  | "TASK_APPROVED"
  | "AI_SUGGESTION"
  | "VALIDATION_REQUEST"
  | "PERFORMANCE_ALERT"
  | "SYSTEM_UPDATE"
  | "SECURITY_ALERT";

export interface Notification {
  id: string;
  userId: string;       // siapa yang menerima notif
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;        // tautan menuju halaman terkait
  taskId?: string;      // ID tugas jika terkait
  createdAt: string;
}
