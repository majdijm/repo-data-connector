
export type Language = 'en' | 'ar';

export interface TranslationKeys {
  // Navigation
  navigation: string;
  dashboard: string;
  tasks: string;
  jobs: string;
  clients: string;
  calendar: string;
  files: string;
  financial: string;
  payments: string;
  settings: string;
  signOut: string;
  users: string;
  
  // Common actions
  create: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  submit: string;
  loading: string;
  search: string;
  filter: string;
  
  // Job Management
  jobManagement: string;
  myJobs: string;
  createJob: string;
  createNewJob: string;
  editJob: string;
  deleteJob: string;
  confirmDeleteJob: string;
  jobDeletedSuccessfully: string;
  failedToDeleteJob: string;
  jobStatusUpdatedSuccessfully: string;
  failedToUpdateJobStatus: string;
  loadingJobs: string;
  noJobsAssignedYet: string;
  noJobsCreatedYet: string;
  noPermissionToViewJobs: string;
  failedToFetchJobs: string;
  jobsCount: string;
  loaded: string;
  
  // Job details
  title: string;
  description: string;
  status: string;
  client: string;
  assigned: string;
  due: string;
  price: string;
  workflow: string;
  step: string;
  unknown: string;
  unassigned: string;
  noDueDate: string;
  
  // Job statuses
  pending: string;
  inprogress: string;
  review: string;
  completed: string;
  delivered: string;
  
  // Workflow
  workflowJob: string;
  selectWorkflowStage: string;
  autoAssign: string;
  manualAssign: string;
  selectUser: string;
  completeCurrentStage: string;
  markAsComplete: string;
  
  // Messages
  success: string;
  error: string;
  unknownError: string;
  
  // Welcome messages
  welcome: string;
  welcomeBack: string;
  
  // Dashboard
  myDashboard: string;
  activeProjects: string;
  completedProjects: string;
  totalProjects: string;
  totalSpent: string;
  currentlyInProgress: string;
  successfullyFinished: string;
  allYourProjects: string;
  projectInvestment: string;
  projectTypes: string;
  myProjects: string;
  trackProgress: string;
  noProjectsFound: string;
  contactUsToStart: string;
  createdDate: string;
  type: string;
}

export type TranslationKey = keyof TranslationKeys;

export const translations: Record<Language, TranslationKeys> = {
  en: {
    // Navigation
    navigation: "Navigation",
    dashboard: "Dashboard",
    tasks: "Tasks",
    jobs: "Jobs",
    clients: "Clients", 
    calendar: "Calendar",
    files: "Files",
    financial: "Financial",
    payments: "Payments",
    settings: "Settings",
    signOut: "Sign Out",
    users: "Users",
    
    // Common actions
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    loading: "Loading...",
    search: "Search",
    filter: "Filter",
    
    // Job Management
    jobManagement: "Job Management",
    myJobs: "My Jobs",
    createJob: "Create Job",
    createNewJob: "Create New Job",
    editJob: "Edit Job",
    deleteJob: "Delete Job", 
    confirmDeleteJob: "Are you sure you want to delete this job?",
    jobDeletedSuccessfully: "Job deleted successfully",
    failedToDeleteJob: "Failed to delete job",
    jobStatusUpdatedSuccessfully: "Job status updated successfully",
    failedToUpdateJobStatus: "Failed to update job status",
    loadingJobs: "Loading jobs...",
    noJobsAssignedYet: "No jobs assigned to you yet",
    noJobsCreatedYet: "No jobs created yet",
    noPermissionToViewJobs: "You don't have permission to view jobs",
    failedToFetchJobs: "Failed to fetch jobs",
    jobsCount: "jobs",
    loaded: "Loaded",
    
    // Job details
    title: "Title",
    description: "Description",
    status: "Status",
    client: "Client",
    assigned: "Assigned",
    due: "Due",
    price: "Price",
    workflow: "Workflow",
    step: "Step",
    unknown: "Unknown",
    unassigned: "Unassigned",
    noDueDate: "No due date",
    
    // Job statuses
    pending: "Pending",
    inprogress: "In Progress",
    review: "Review",
    completed: "Completed",
    delivered: "Delivered",
    
    // Workflow
    workflowJob: "Workflow Job",
    selectWorkflowStage: "Select workflow stage",
    autoAssign: "Auto-assign",
    manualAssign: "Manual assign",
    selectUser: "Select user",
    completeCurrentStage: "Complete Current Stage",
    markAsComplete: "Mark as Complete",
    
    // Messages
    success: "Success",
    error: "Error", 
    unknownError: "Unknown error",
    
    // Welcome messages
    welcome: "Welcome",
    welcomeBack: "Welcome back",
    
    // Dashboard
    myDashboard: "My Dashboard",
    activeProjects: "Active Projects",
    completedProjects: "Completed",
    totalProjects: "Total Projects",
    totalSpent: "Total Spent",
    currentlyInProgress: "Currently in progress",
    successfullyFinished: "Successfully finished",
    allYourProjects: "All your projects",
    projectInvestment: "Project investment",
    projectTypes: "Project Types",
    myProjects: "My Projects",
    trackProgress: "Track the progress of your projects",
    noProjectsFound: "No projects found. Contact us to start your first project!",
    contactUsToStart: "Contact us to start your first project!",
    createdDate: "Created",
    type: "Type",
  },
  ar: {
    // Navigation
    navigation: "التنقل",
    dashboard: "لوحة التحكم",
    tasks: "المهام",
    jobs: "المشاريع",
    clients: "العملاء",
    calendar: "التقويم", 
    files: "الملفات",
    financial: "المالية",
    payments: "المدفوعات",
    settings: "الإعدادات",
    signOut: "تسجيل الخروج",
    users: "المستخدمين",
    
    // Common actions
    create: "إنشاء",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    submit: "إرسال",
    loading: "جاري التحميل...",
    search: "بحث",
    filter: "تصفية",
    
    // Job Management
    jobManagement: "إدارة المشاريع",
    myJobs: "مشاريعي",
    createJob: "إنشاء مشروع",
    createNewJob: "إنشاء مشروع جديد",
    editJob: "تعديل المشروع",
    deleteJob: "حذف المشروع",
    confirmDeleteJob: "هل أنت متأكد من حذف هذا المشروع؟",
    jobDeletedSuccessfully: "تم حذف المشروع بنجاح",
    failedToDeleteJob: "فشل في حذف المشروع",
    jobStatusUpdatedSuccessfully: "تم تحديث حالة المشروع بنجاح",
    failedToUpdateJobStatus: "فشل في تحديث حالة المشروع",
    loadingJobs: "جاري تحميل المشاريع...",
    noJobsAssignedYet: "لا توجد مشاريع مخصصة لك حتى الآن",
    noJobsCreatedYet: "لم يتم إنشاء أي مشاريع حتى الآن",
    noPermissionToViewJobs: "ليس لديك صلاحية لعرض المشاريع",
    failedToFetchJobs: "فشل في جلب المشاريع",
    jobsCount: "مشاريع",
    loaded: "تم التحميل",
    
    // Job details
    title: "العنوان",
    description: "الوصف",
    status: "الحالة",
    client: "العميل",
    assigned: "مكلف",
    due: "موعد التسليم",
    price: "السعر",
    workflow: "سير العمل",
    step: "خطوة",
    unknown: "غير معروف",
    unassigned: "غير مكلف",
    noDueDate: "لا يوجد موعد تسليم",
    
    // Job statuses
    pending: "في الانتظار",
    inprogress: "قيد التنفيذ",
    review: "قيد المراجعة",
    completed: "مكتمل",
    delivered: "تم التسليم",
    
    // Workflow
    workflowJob: "مشروع سير عمل",
    selectWorkflowStage: "اختر مرحلة سير العمل",
    autoAssign: "تكليف تلقائي",
    manualAssign: "تكليف يدوي",
    selectUser: "اختر مستخدم",
    completeCurrentStage: "إكمال المرحلة الحالية",
    markAsComplete: "تعيين كمكتمل",
    
    // Messages
    success: "نجح",
    error: "خطأ",
    unknownError: "خطأ غير معروف",
    
    // Welcome messages
    welcome: "أهلاً وسهلاً",
    welcomeBack: "مرحباً بعودتك",
    
    // Dashboard
    myDashboard: "لوحة التحكم الخاصة بي",
    activeProjects: "المشاريع النشطة",
    completedProjects: "المكتملة",
    totalProjects: "إجمالي المشاريع",
    totalSpent: "إجمالي المنفق",
    currentlyInProgress: "قيد التنفيذ حالياً",
    successfullyFinished: "تم إنجازها بنجاح",
    allYourProjects: "جميع مشاريعك",
    projectInvestment: "استثمار المشروع",
    projectTypes: "أنواع المشاريع",
    myProjects: "مشاريعي",
    trackProgress: "تتبع تقدم مشاريعك",
    noProjectsFound: "لم يتم العثور على مشاريع. اتصل بنا لبدء مشروعك الأول!",
    contactUsToStart: "اتصل بنا لبدء مشروعك الأول!",
    createdDate: "تاريخ الإنشاء",
    type: "النوع",
  }
};

export const isRTL = (language: Language): boolean => {
  return language === 'ar';
};

export const getTranslation = (key: TranslationKey, language: Language): string => {
  return translations[language][key] || translations.en[key] || key;
};
