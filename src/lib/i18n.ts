
export type Language = 'en' | 'ar';

export interface TranslationKeys {
  // Navigation & Layout
  dashboard: string;
  users: string;
  clients: string;
  jobs: string;
  tasks: string;
  files: string;
  calendar: string;
  payments: string;
  settings: string;
  signOut: string;
  management: string;
  financial: string;
  
  // Common Actions
  loading: string;
  search: string;
  viewDetails: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  update: string;
  
  // User & Profile
  name: string;
  email: string;
  role: string;
  language: string;
  profile: string;
  
  // Job Statuses
  pending: string;
  inProgress: string;
  review: string;
  completed: string;
  delivered: string;
  cancelled: string;
  
  // Job Types
  photoSession: string;
  videoEditing: string;
  design: string;
  
  // General Terms
  client: string;
  type: string;
  status: string;
  price: string;
  dueDate: string;
  description: string;
  jobDetails: string;
  
  // Languages
  english: string;
  arabic: string;
  
  // Calendar
  calendarView: string;
  selectDate: string;
  noTasksScheduled: string;
  scheduledTasks: string;
  datesWithTasks: string;
  taskScheduling: string;
}

export type TranslationKey = keyof TranslationKeys;

const translations: Record<Language, TranslationKeys> = {
  en: {
    // Navigation & Layout
    dashboard: 'Dashboard',
    users: 'Users',
    clients: 'Clients',
    jobs: 'Jobs',
    tasks: 'Tasks',
    files: 'Files',
    calendar: 'Calendar',
    payments: 'Payments',
    settings: 'Settings',
    signOut: 'Sign Out',
    management: 'Management',
    financial: 'Financial',
    
    // Common Actions
    loading: 'Loading...',
    search: 'Search...',
    viewDetails: 'View Details',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    
    // User & Profile
    name: 'Name',
    email: 'Email',
    role: 'Role',
    language: 'Language',
    profile: 'Profile',
    
    // Job Statuses
    pending: 'Pending',
    inProgress: 'In Progress',
    review: 'Review',
    completed: 'Completed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    
    // Job Types
    photoSession: 'Photo Session',
    videoEditing: 'Video Editing',
    design: 'Design',
    
    // General Terms
    client: 'Client',
    type: 'Type',
    status: 'Status',
    price: 'Price',
    dueDate: 'Due Date',
    description: 'Description',
    jobDetails: 'Job Details',
    
    // Languages
    english: 'English',
    arabic: 'العربية',
    
    // Calendar
    calendarView: 'Calendar View',
    selectDate: 'Select a Date',
    noTasksScheduled: 'No tasks scheduled for this date',
    scheduledTasks: 'Scheduled Tasks',
    datesWithTasks: 'Dates with scheduled tasks',
    taskScheduling: 'Manage and schedule your tasks',
  },
  ar: {
    // Navigation & Layout
    dashboard: 'لوحة التحكم',
    users: 'المستخدمون',
    clients: 'العملاء',
    jobs: 'الوظائف',
    tasks: 'المهام',
    files: 'الملفات',
    calendar: 'التقويم',
    payments: 'المدفوعات',
    settings: 'الإعدادات',
    signOut: 'تسجيل الخروج',
    management: 'الإدارة',
    financial: 'المالية',
    
    // Common Actions
    loading: 'جاري التحميل...',
    search: 'البحث...',
    viewDetails: 'عرض التفاصيل',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تحرير',
    create: 'إنشاء',
    update: 'تحديث',
    
    // User & Profile
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    role: 'الدور',
    language: 'اللغة',
    profile: 'الملف الشخصي',
    
    // Job Statuses
    pending: 'معلق',
    inProgress: 'قيد التنفيذ',
    review: 'مراجعة',
    completed: 'مكتمل',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
    
    // Job Types
    photoSession: 'جلسة تصوير',
    videoEditing: 'مونتاج فيديو',
    design: 'تصميم',
    
    // General Terms
    client: 'العميل',
    type: 'النوع',
    status: 'الحالة',
    price: 'السعر',
    dueDate: 'تاريخ الاستحقاق',
    description: 'الوصف',
    jobDetails: 'تفاصيل الوظيفة',
    
    // Languages
    english: 'English',
    arabic: 'العربية',
    
    // Calendar
    calendarView: 'عرض التقويم',
    selectDate: 'اختر تاريخاً',
    noTasksScheduled: 'لا توجد مهام مجدولة لهذا التاريخ',
    scheduledTasks: 'المهام المجدولة',
    datesWithTasks: 'التواريخ التي تحتوي على مهام مجدولة',
    taskScheduling: 'إدارة وجدولة مهامك',
  }
};

export const getTranslation = (key: TranslationKey, language: Language = 'en'): string => {
  return translations[language][key] || translations['en'][key] || key;
};

export const isRTL = (language: Language): boolean => {
  return language === 'ar';
};
