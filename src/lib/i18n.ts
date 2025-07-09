
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
  success: string;
  error: string;
  
  // User & Profile
  name: string;
  email: string;
  role: string;
  language: string;
  profile: string;
  profileInformation: string;
  languageSettings: string;
  selectLanguage: string;
  
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
  assigned: string;
  unassigned: string;
  due: string;
  noDueDate: string;
  workflow: string;
  step: string;
  unknown: string;
  
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
  
  // Job Management
  jobManagement: string;
  myJobs: string;
  createJob: string;
  createNewJob: string;
  editJob: string;
  noJobsAssignedYet: string;
  noJobsCreatedYet: string;
  confirmDeleteJob: string;
  jobDeletedSuccessfully: string;
  failedToDeleteJob: string;
  jobStatusUpdatedSuccessfully: string;
  failedToUpdateJobStatus: string;
  failedToFetchJobs: string;
  unknownError: string;
  loaded: string;
  loadingJobs: string;
  noPermissionToViewJobs: string;
  
  // Creative Studio Terms
  creativeStudio: string;
  digitalDesign: string;
  portfolio: string;
  showcase: string;
  inspiration: string;
  creativity: string;
  innovation: string;
  artDirection: string;
  brandIdentity: string;
  visualCommunication: string;
  
  // Additional UI Terms
  welcome: string;
  getStarted: string;
  learnMore: string;
  contactUs: string;
  aboutUs: string;
  services: string;
  projects: string;
  team: string;
  blog: string;
  news: string;
  events: string;
  gallery: string;
  testimonials: string;
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
    success: 'Success',
    error: 'Error',
    
    // User & Profile
    name: 'Name',
    email: 'Email',
    role: 'Role',
    language: 'Language',
    profile: 'Profile',
    profileInformation: 'Profile Information',
    languageSettings: 'Language Settings',
    selectLanguage: 'Select Language',
    
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
    assigned: 'Assigned',
    unassigned: 'Unassigned',
    due: 'Due',
    noDueDate: 'No due date',
    workflow: 'Workflow',
    step: 'Step',
    unknown: 'Unknown',
    
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
    
    // Job Management
    jobManagement: 'Job Management',
    myJobs: 'My Jobs',
    createJob: 'Create Job',
    createNewJob: 'Create New Job',
    editJob: 'Edit Job',
    noJobsAssignedYet: 'No jobs assigned to you yet.',
    noJobsCreatedYet: 'No jobs created yet.',
    confirmDeleteJob: 'Are you sure you want to delete this job?',
    jobDeletedSuccessfully: 'Job deleted successfully',
    failedToDeleteJob: 'Failed to delete job',
    jobStatusUpdatedSuccessfully: 'Job status updated successfully',
    failedToUpdateJobStatus: 'Failed to update job status',
    failedToFetchJobs: 'Failed to fetch jobs',
    unknownError: 'Unknown error',
    loaded: 'Loaded',
    loadingJobs: 'Loading jobs...',
    noPermissionToViewJobs: 'You don\'t have permission to view jobs.',
    
    // Creative Studio Terms
    creativeStudio: 'Creative Studio',
    digitalDesign: 'Digital Design',
    portfolio: 'Portfolio',
    showcase: 'Showcase',
    inspiration: 'Inspiration',
    creativity: 'Creativity',
    innovation: 'Innovation',
    artDirection: 'Art Direction',
    brandIdentity: 'Brand Identity',
    visualCommunication: 'Visual Communication',
    
    // Additional UI Terms
    welcome: 'Welcome',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    contactUs: 'Contact Us',
    aboutUs: 'About Us',
    services: 'Services',
    projects: 'Projects',
    team: 'Team',
    blog: 'Blog',
    news: 'News',
    events: 'Events',
    gallery: 'Gallery',
    testimonials: 'Testimonials',
  },
  ar: {
    // Navigation & Layout
    dashboard: 'لوحة التحكم',
    users: 'المستخدمون',
    clients: 'العملاء',
    jobs: 'المشاريع',
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
    success: 'نجح',
    error: 'خطأ',
    
    // User & Profile
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    role: 'الدور',
    language: 'اللغة',
    profile: 'الملف الشخصي',
    profileInformation: 'معلومات الملف الشخصي',
    languageSettings: 'إعدادات اللغة',
    selectLanguage: 'اختر اللغة',
    
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
    jobDetails: 'تفاصيل المشروع',
    assigned: 'مُكلف',
    unassigned: 'غير مُكلف',
    due: 'موعد الاستحقاق',
    noDueDate: 'لا يوجد تاريخ استحقاق',
    workflow: 'سير العمل',
    step: 'خطوة',
    unknown: 'غير معروف',
    
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
    
    // Job Management
    jobManagement: 'إدارة المشاريع',
    myJobs: 'مشاريعي',
    createJob: 'إنشاء مشروع',
    createNewJob: 'إنشاء مشروع جديد',
    editJob: 'تحرير المشروع',
    noJobsAssignedYet: 'لم يتم تكليفك بأي مشاريع بعد.',
    noJobsCreatedYet: 'لم يتم إنشاء أي مشاريع بعد.',
    confirmDeleteJob: 'هل أنت متأكد من أنك تريد حذف هذا المشروع؟',
    jobDeletedSuccessfully: 'تم حذف المشروع بنجاح',
    failedToDeleteJob: 'فشل في حذف المشروع',
    jobStatusUpdatedSuccessfully: 'تم تحديث حالة المشروع بنجاح',
    failedToUpdateJobStatus: 'فشل في تحديث حالة المشروع',
    failedToFetchJobs: 'فشل في جلب المشاريع',
    unknownError: 'خطأ غير معروف',
    loaded: 'تم التحميل',
    loadingJobs: 'جاري تحميل المشاريع...',
    noPermissionToViewJobs: 'ليس لديك صلاحية لعرض المشاريع.',
    
    // Creative Studio Terms
    creativeStudio: 'الاستوديو الإبداعي',
    digitalDesign: 'التصميم الرقمي',
    portfolio: 'معرض الأعمال',
    showcase: 'عرض الأعمال',
    inspiration: 'الإلهام',
    creativity: 'الإبداع',
    innovation: 'الابتكار',
    artDirection: 'التوجيه الفني',
    brandIdentity: 'الهوية التجارية',
    visualCommunication: 'التواصل البصري',
    
    // Additional UI Terms
    welcome: 'مرحباً',
    getStarted: 'ابدأ الآن',
    learnMore: 'اعرف المزيد',
    contactUs: 'اتصل بنا',
    aboutUs: 'نبذة عنا',
    services: 'الخدمات',
    projects: 'المشاريع',
    team: 'الفريق',
    blog: 'المدونة',
    news: 'الأخبار',
    events: 'الفعاليات',
    gallery: 'المعرض',
    testimonials: 'شهادات العملاء',
  }
};

export const getTranslation = (key: TranslationKey, language: Language = 'en'): string => {
  return translations[language][key] || translations['en'][key] || key;
};

export const isRTL = (language: Language): boolean => {
  return language === 'ar';
};
