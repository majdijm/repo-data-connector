
export type Language = 'en' | 'ar';

export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // Loading states
    loading: 'Loading...',
    loadingJobs: 'Loading jobs...',
    loadingFiles: 'Loading files...',
    loaded: 'Loaded',
    processing: 'Processing...',
    
    // Languages
    english: 'English',
    arabic: 'Arabic',
    
    // Common actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    submit: 'Submit',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    open: 'Open',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    clear: 'Clear',
    reset: 'Reset',
    
    // Status messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    
    // Navigation
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    jobs: 'Jobs',
    clients: 'Clients',
    calendar: 'Calendar',
    files: 'Files',
    financial: 'Financial',
    payments: 'Payments',
    users: 'Users',
    settings: 'Settings',
    signOut: 'Sign Out',
    
    // Dashboard content
    welcome: 'Welcome',
    creativity: 'Creativity',
    inspiration: 'Inspiration',
    creativeStudio: 'Creative Studio',
    digitalDesign: 'Digital Design',
    innovation: 'Innovation',
    
    // Job management
    jobManagement: 'Job Management',
    createJob: 'Create Job',
    createNewJob: 'Create New Job',
    editJob: 'Edit Job',
    deleteJob: 'Delete Job',
    myJobs: 'My Jobs',
    viewDetails: 'View Details',
    jobDetails: 'Job Details',
    jobProgress: 'Job Progress',
    jobFiles: 'Job Files',
    noJobsCreatedYet: 'No jobs created yet',
    noJobsAssignedYet: 'No jobs assigned to you yet',
    
    // Job properties
    title: 'Title',
    description: 'Description',
    status: 'Status',
    type: 'Type',
    price: 'Price',
    projectValue: 'Project Value',
    dueDate: 'Due Date',
    sessionDate: 'Session Date',
    assignedTo: 'Assigned To',
    client: 'Client',
    assigned: 'Assigned',
    unassigned: 'Unassigned',
    due: 'Due',
    noDueDate: 'No due date',
    
    // Job statuses
    pending: 'Pending',
    inProgress: 'In Progress',
    in_progress: 'In Progress',
    review: 'Review',
    completed: 'Completed',
    delivered: 'Delivered',
    handovered: 'Handovered',
    cancelled: 'Cancelled',
    complete: 'Complete',
    
    // Job types
    photoSession: 'Photo Session',
    videoEditing: 'Video Editing',
    design: 'Design',
    singleJob: 'Single Job',
    workflowPackage: 'Workflow Package',
    
    // User roles
    photographer: 'Photographer',
    designer: 'Designer',
    editor: 'Editor',
    admin: 'Admin',
    receptionist: 'Receptionist',
    
    // Role icons (kept in English for icon references)
    camera: 'Camera',
    palette: 'Palette',
    video: 'Video',
    user: 'User',
    shield: 'Shield',
    headphones: 'Headphones',
    
    // Workflow
    workflow: 'Workflow',
    workflowActions: 'Workflow Actions',
    step: 'Step',
    stage: 'Stage',
    stageNotes: 'Stage Notes',
    addNotesForNextStage: 'Add notes for the next stage...',
    moveToNextStage: 'Move to Next Stage',
    markAsCompleted: 'Mark as Completed',
    workflowStageCompleted: 'Workflow stage completed successfully',
    failedToCompleteStage: 'Failed to complete workflow stage',
    jobMarkedAsCompleted: 'Job marked as completed successfully',
    failedToMarkAsCompleted: 'Failed to mark job as completed',
    
    // File management
    finalDeliverables: 'Final Deliverables',
    noFinalDeliverablesYet: 'No final deliverables available yet. Files will appear here once the work is completed.',
    noFilesUploaded: 'No files uploaded yet.',
    final: 'Final',
    uploadedBy: 'Uploaded by',
    attachFiles: 'Attach Files',
    cloudDriveLink: 'Cloud Drive Link',
    uploadFile: 'Upload File',
    
    // Project completion
    projectReadyForReview: 'Your project is ready for review!',
    reviewFinalDeliverables: 'Please review the final deliverables below. Once you are satisfied with the work, click "Accept & Complete" to finalize the project.',
    acceptCompleteProject: 'Accept & Complete Project',
    projectCompleted: 'Project Completed!',
    projectDeliveredSuccessfully: 'Your project has been delivered successfully. You can access all final files below.',
    
    // Calendar
    calendarView: 'Calendar View',
    taskScheduling: 'Task Scheduling',
    datesWithTasks: 'Dates with tasks are highlighted in blue',
    selectDate: 'Select a date to view tasks',
    noTasksScheduled: 'No tasks scheduled for this date',
    scheduledTasks: 'Scheduled Tasks',
    
    // User management
    name: 'Name',
    email: 'Email',
    role: 'Role',
    profileInformation: 'Profile Information',
    languageSettings: 'Language Settings',
    selectLanguage: 'Select Language',
    
    // Error messages
    errorLoadingData: 'Error loading data',
    unknownError: 'Unknown error',
    failedToFetchJobs: 'Failed to fetch jobs',
    failedToDeleteJob: 'Failed to delete job',
    failedToUpdateJobStatus: 'Failed to update job status',
    noPermissionToViewJobs: 'You do not have permission to view jobs',
    
    // Success messages
    jobDeletedSuccessfully: 'Job deleted successfully',
    jobStatusUpdatedSuccessfully: 'Job status updated successfully',
    
    // Confirmation messages
    confirmDeleteJob: 'Are you sure you want to delete this job? This action cannot be undone.',
    
    // Counters and statistics
    jobsCount: 'jobs',
    totalJobs: 'Total Jobs',
    
    // Miscellaneous
    action: 'Action',
    unknown: 'Unknown',
    
    // Form labels and placeholders
    selectTeamMember: 'Select team member',
    selectClient: 'Select client',
    selectJobType: 'Select job type',
    enterTitle: 'Enter title',
    enterDescription: 'Enter description',
    enterPrice: 'Enter price',
    optional: 'Optional',
    required: 'Required',
    
    // Job form specific
    jobType: 'Job Type',
    createStandaloneJob: 'Create a standalone job',
    createCompleteWorkflow: 'Create a complete workflow with photo session → editing → design',
    
    // File upload
    attachFilesOrLinks: 'Attach Files or Links (Optional)',
    cloudDriveLinkPlaceholder: 'https://drive.google.com/... or https://dropbox.com/...',
    
    // Authentication
    signIn: 'Sign In',
    signInToAccount: 'Sign in to your account',
    signUp: 'Sign Up',
    forgotPassword: 'Forgot Password',
    
    // Package management
    packageManagement: 'Package Management',
    packages: 'Packages',
    
    // Financial
    revenue: 'Revenue',
    expenses: 'Expenses',
    profit: 'Profit',
    
    // Time periods
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    
    // Days of week
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    
    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December'
  },
  ar: {
    // Loading states
    loading: 'جاري التحميل...',
    loadingJobs: 'جاري تحميل الوظائف...',
    loadingFiles: 'جاري تحميل الملفات...',
    loaded: 'تم التحميل',
    processing: 'جاري المعالجة...',
    
    // Languages
    english: 'الإنجليزية',
    arabic: 'العربية',
    
    // Common actions
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    create: 'إنشاء',
    update: 'تحديث',
    submit: 'إرسال',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    close: 'إغلاق',
    open: 'فتح',
    view: 'عرض',
    download: 'تحميل',
    upload: 'رفع',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    refresh: 'تحديث',
    clear: 'مسح',
    reset: 'إعادة تعيين',
    
    // Status messages
    success: 'نجح',
    error: 'خطأ',
    warning: 'تحذير',
    info: 'معلومات',
    
    // Navigation
    dashboard: 'لوحة التحكم',
    tasks: 'المهام',
    jobs: 'الوظائف',
    clients: 'العملاء',
    calendar: 'التقويم',
    files: 'الملفات',
    financial: 'المالية',
    payments: 'المدفوعات',
    users: 'المستخدمون',
    settings: 'الإعدادات',
    signOut: 'تسجيل الخروج',
    
    // Dashboard content
    welcome: 'مرحباً',
    creativity: 'الإبداع',
    inspiration: 'الإلهام',
    creativeStudio: 'الاستوديو الإبداعي',
    digitalDesign: 'التصميم الرقمي',
    innovation: 'الابتكار',
    
    // Job management
    jobManagement: 'إدارة الوظائف',
    createJob: 'إنشاء وظيفة',
    createNewJob: 'إنشاء وظيفة جديدة',
    editJob: 'تعديل الوظيفة',
    deleteJob: 'حذف الوظيفة',
    myJobs: 'وظائفي',
    viewDetails: 'عرض التفاصيل',
    jobDetails: 'تفاصيل الوظيفة',
    jobProgress: 'تقدم الوظيفة',
    jobFiles: 'ملفات الوظيفة',
    noJobsCreatedYet: 'لم يتم إنشاء وظائف بعد',
    noJobsAssignedYet: 'لا توجد وظائف مخصصة لك بعد',
    
    // Job properties
    title: 'العنوان',
    description: 'الوصف',
    status: 'الحالة',
    type: 'النوع',
    price: 'السعر',
    projectValue: 'قيمة المشروع',
    dueDate: 'تاريخ الاستحقاق',
    sessionDate: 'تاريخ الجلسة',
    assignedTo: 'مخصص لـ',
    client: 'العميل',
    assigned: 'مخصص',
    unassigned: 'غير مخصص',
    due: 'مستحق',
    noDueDate: 'لا يوجد تاريخ استحقاق',
    
    // Job statuses
    pending: 'معلق',
    inProgress: 'قيد التنفيذ',
    in_progress: 'قيد التنفيذ',
    review: 'مراجعة',
    completed: 'مكتمل',
    delivered: 'تم التسليم',
    handovered: 'تم التسليم النهائي',
    cancelled: 'ملغى',
    complete: 'مكتمل',
    
    // Job types
    photoSession: 'جلسة تصوير',
    videoEditing: 'تحرير فيديو',
    design: 'تصميم',
    singleJob: 'وظيفة واحدة',
    workflowPackage: 'حزمة سير عمل',
    
    // User roles
    photographer: 'مصور',
    designer: 'مصمم',
    editor: 'محرر',
    admin: 'مدير',
    receptionist: 'موظف استقبال',
    
    // Role icons (kept in English for icon references)
    camera: 'كاميرا',
    palette: 'لوحة',
    video: 'فيديو',
    user: 'مستخدم',
    shield: 'درع',
    headphones: 'سماعات',
    
    // Workflow
    workflow: 'سير العمل',
    workflowActions: 'إجراءات سير العمل',
    step: 'الخطوة',
    stage: 'المرحلة',
    stageNotes: 'ملاحظات المرحلة',
    addNotesForNextStage: 'أضف ملاحظات للمرحلة التالية...',
    moveToNextStage: 'الانتقال إلى المرحلة التالية',
    markAsCompleted: 'وضع علامة كمكتملة',
    workflowStageCompleted: 'تم إكمال مرحلة سير العمل بنجاح',
    failedToCompleteStage: 'فشل في إكمال مرحلة سير العمل',
    jobMarkedAsCompleted: 'تم وضع علامة على الوظيفة كمكتملة بنجاح',
    failedToMarkAsCompleted: 'فشل في وضع علامة على الوظيفة كمكتملة',
    
    // File management
    finalDeliverables: 'التسليمات النهائية',
    noFinalDeliverablesYet: 'لا توجد تسليمات نهائية متاحة بعد. ستظهر الملفات هنا بمجرد اكتمال العمل.',
    noFilesUploaded: 'لم يتم رفع ملفات بعد.',
    final: 'نهائي',
    uploadedBy: 'تم رفعه بواسطة',
    attachFiles: 'إرفاق ملفات',
    cloudDriveLink: 'رابط التخزين السحابي',
    uploadFile: 'رفع ملف',
    
    // Project completion
    projectReadyForReview: 'مشروعك جاهز للمراجعة!',
    reviewFinalDeliverables: 'يرجى مراجعة التسليمات النهائية أدناه. بمجرد أن تصبح راضياً عن العمل، انقر على "قبول وإكمال" لإنهاء المشروع.',
    acceptCompleteProject: 'قبول وإكمال المشروع',
    projectCompleted: 'تم إكمال المشروع!',
    projectDeliveredSuccessfully: 'تم تسليم مشروعك بنجاح. يمكنك الوصول إلى جميع الملفات النهائية أدناه.',
    
    // Calendar
    calendarView: 'عرض التقويم',
    taskScheduling: 'جدولة المهام',
    datesWithTasks: 'التواريخ التي تحتوي على مهام مميزة باللون الأزرق',
    selectDate: 'اختر تاريخاً لعرض المهام',
    noTasksScheduled: 'لا توجد مهام مجدولة لهذا التاريخ',
    scheduledTasks: 'المهام المجدولة',
    
    // User management
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    role: 'الدور',
    profileInformation: 'معلومات الملف الشخصي',
    languageSettings: 'إعدادات اللغة',
    selectLanguage: 'اختر اللغة',
    
    // Error messages
    errorLoadingData: 'خطأ في تحميل البيانات',
    unknownError: 'خطأ غير معروف',
    failedToFetchJobs: 'فشل في جلب الوظائف',
    failedToDeleteJob: 'فشل في حذف الوظيفة',
    failedToUpdateJobStatus: 'فشل في تحديث حالة الوظيفة',
    noPermissionToViewJobs: 'ليس لديك صلاحية لعرض الوظائف',
    
    // Success messages
    jobDeletedSuccessfully: 'تم حذف الوظيفة بنجاح',
    jobStatusUpdatedSuccessfully: 'تم تحديث حالة الوظيفة بنجاح',
    
    // Confirmation messages
    confirmDeleteJob: 'هل أنت متأكد من أنك تريد حذف هذه الوظيفة؟ لا يمكن التراجع عن هذا الإجراء.',
    
    // Counters and statistics
    jobsCount: 'وظائف',
    totalJobs: 'إجمالي الوظائف',
    
    // Miscellaneous
    action: 'إجراء',
    unknown: 'غير معروف',
    
    // Form labels and placeholders
    selectTeamMember: 'اختر عضو الفريق',
    selectClient: 'اختر العميل',
    selectJobType: 'اختر نوع الوظيفة',
    enterTitle: 'أدخل العنوان',
    enterDescription: 'أدخل الوصف',
    enterPrice: 'أدخل السعر',
    optional: 'اختياري',
    required: 'مطلوب',
    
    // Job form specific
    jobType: 'نوع الوظيفة',
    createStandaloneJob: 'إنشاء وظيفة مستقلة',
    createCompleteWorkflow: 'إنشاء سير عمل كامل مع جلسة تصوير ← تحرير ← تصميم',
    
    // File upload
    attachFilesOrLinks: 'إرفاق ملفات أو روابط (اختياري)',
    cloudDriveLinkPlaceholder: 'https://drive.google.com/... أو https://dropbox.com/...',
    
    // Authentication
    signIn: 'تسجيل الدخول',
    signInToAccount: 'سجل دخولك إلى حسابك',
    signUp: 'تسجيل جديد',
    forgotPassword: 'نسيت كلمة المرور',
    
    // Package management
    packageManagement: 'إدارة الباقات',
    packages: 'الباقات',
    
    // Financial
    revenue: 'الإيرادات',
    expenses: 'المصروفات',
    profit: 'الربح',
    
    // Time periods
    today: 'اليوم',
    yesterday: 'أمس',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    thisYear: 'هذا العام',
    
    // Days of week
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    sunday: 'الأحد',
    
    // Months
    january: 'يناير',
    february: 'فبراير',
    march: 'مارس',
    april: 'أبريل',
    may: 'مايو',
    june: 'يونيو',
    july: 'يوليو',
    august: 'أغسطس',
    september: 'سبتمبر',
    october: 'أكتوبر',
    november: 'نوفمبر',
    december: 'ديسمبر'
  }
};

export const getTranslation = (key: TranslationKey, language: Language): string => {
  return translations[language][key] || translations.en[key] || key;
};

export const isRTL = (language: Language): boolean => {
  return language === 'ar';
};
