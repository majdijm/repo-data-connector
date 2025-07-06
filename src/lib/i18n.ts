
export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    users: "Users",
    clients: "Clients",
    jobs: "Jobs",
    files: "Files",
    calendar: "Calendar",
    payments: "Payments",
    settings: "Settings",
    signOut: "Sign Out",
    
    // Calendar
    calendarView: "Calendar View",
    taskScheduling: "Task Scheduling and Calendar Management",
    selectDate: "Select a Date",
    noTasksScheduled: "No tasks scheduled for this date",
    scheduledTasks: "Scheduled Tasks",
    datesWithTasks: "Dates with scheduled tasks",
    
    // Jobs & Tasks
    jobDetails: "Job Details",
    client: "Client",
    type: "Type",
    assigned: "Assigned",
    status: "Status",
    dueDate: "Due Date",
    description: "Description",
    price: "Price",
    viewDetails: "View Details",
    
    // Status
    pending: "Pending",
    inProgress: "In Progress",
    review: "Review",
    completed: "Completed",
    delivered: "Delivered",
    cancelled: "Cancelled",
    
    // Job Types
    photography: "Photography",
    design: "Design",
    editing: "Editing",
    videoEditing: "Video Editing",
    
    // Common
    loading: "Loading...",
    error: "Error",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    search: "Search",
    filter: "Filter",
    
    // Settings
    languageSettings: "Language Settings",
    selectLanguage: "Select Language",
    english: "English",
    arabic: "Arabic",
    profileInformation: "Profile Information",
    name: "Name",
    email: "Email",
    role: "Role",
    
    // Authentication
    pleaseLogin: "Please log in to access this page.",
    goToLogin: "Go to Login Page",
    accessDenied: "Access denied",
    requiredRole: "Required role",
    yourRole: "Your role",
    
    // Financial
    financial: "Financial",
    management: "Management"
  },
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    users: "المستخدمون",
    clients: "العملاء",
    jobs: "المهام",
    files: "الملفات",
    calendar: "التقويم",
    payments: "المدفوعات",
    settings: "الإعدادات",
    signOut: "تسجيل الخروج",
    
    // Calendar
    calendarView: "عرض التقويم",
    taskScheduling: "جدولة المهام وإدارة التقويم",
    selectDate: "اختر تاريخ",
    noTasksScheduled: "لا توجد مهام مجدولة لهذا التاريخ",
    scheduledTasks: "المهام المجدولة",
    datesWithTasks: "التواريخ التي تحتوي على مهام مجدولة",
    
    // Jobs & Tasks
    jobDetails: "تفاصيل المهمة",
    client: "العميل",
    type: "النوع",
    assigned: "مُكلف إلى",
    status: "الحالة",
    dueDate: "تاريخ الاستحقاق",
    description: "الوصف",
    price: "السعر",
    viewDetails: "عرض التفاصيل",
    
    // Status
    pending: "قيد الانتظار",
    inProgress: "قيد التنفيذ",
    review: "قيد المراجعة",
    completed: "مكتمل",
    delivered: "تم التسليم",
    cancelled: "ملغى",
    
    // Job Types
    photography: "التصوير",
    design: "التصميم",
    editing: "التحرير",
    videoEditing: "تحرير الفيديو",
    
    // Common
    loading: "جاري التحميل...",
    error: "خطأ",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    create: "إنشاء",
    update: "تحديث",
    close: "إغلاق",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",
    search: "بحث",
    filter: "تصفية",
    
    // Settings
    languageSettings: "إعدادات اللغة",
    selectLanguage: "اختر اللغة",
    english: "الإنجليزية",
    arabic: "العربية",
    profileInformation: "معلومات الملف الشخصي",
    name: "الاسم",
    email: "البريد الإلكتروني",
    role: "الدور",
    
    // Authentication
    pleaseLogin: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة.",
    goToLogin: "الذهاب إلى صفحة تسجيل الدخول",
    accessDenied: "تم رفض الوصول",
    requiredRole: "الدور المطلوب",
    yourRole: "دورك",
    
    // Financial
    financial: "المالية",
    management: "الإدارة"
  }
};

export type Language = 'en' | 'ar';
export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (key: TranslationKey, language: Language): string => {
  return translations[language][key] || translations.en[key];
};

export const isRTL = (language: Language): boolean => {
  return language === 'ar';
};
