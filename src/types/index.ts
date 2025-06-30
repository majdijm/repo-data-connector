
export type UserRole = 'admin' | 'receptionist' | 'photographer' | 'designer' | 'editor' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalPaid: number;
  totalDue: number;
  userId?: string;
  createdAt: Date;
}

export interface Job {
  id: string;
  title: string;
  type: 'photo_session' | 'video_editing' | 'design';
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'delivered';
  clientId: string;
  clientName: string;
  assignedTo?: string;
  assignedToName?: string;
  dueDate: Date;
  sessionDate?: Date;
  description: string;
  files: JobFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JobFile {
  id: string;
  name: string;
  url: string;
  type: 'raw' | 'final' | 'design' | 'video';
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  description: string;
  recordedBy: string;
  recordedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}
