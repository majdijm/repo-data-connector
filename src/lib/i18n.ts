
export const locales = ['en', 'ar'] as const;

export const defaultLocale = 'en';

export type Language = typeof locales[number];

export function getLocale(): Language {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && locales.includes(savedLanguage)) {
      return savedLanguage;
    }
    
    const browserLanguage = window.navigator.language.split('-')[0] as Language;
    if (locales.includes(browserLanguage)) {
      return browserLanguage;
    }
  }

  return defaultLocale;
}

export function isValidLocale(locale: string): locale is Language {
  return locales.includes(locale as Language);
}

export function isRTL(language: Language): boolean {
  return language === 'ar';
}

export const translations = {
  en: {
    // General
    success: "Success",
    error: "Error", 
    home: "Home",
    dashboard: "Dashboard",
    jobs: "Jobs",
    clients: "Clients",
    team: "Team",
    payments: "Payments",
    files: "Files",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    signup: "Sign Up",
    title: "Title",
    description: "Description",
    optional: "Optional",
    enterTitle: "Enter title",
    enterDescription: "Enter description",
    price: "Price",
    enterPrice: "Enter price",
    dueDate: "Due Date",
    sessionDate: "Session Date",
    selectDate: "Select date",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    viewDetails: "View Details",
    unassigned: "Unassigned",
    processing: "Processing...",
    loading: "Loading...",
    
    // Navigation and UI
    tasks: "Tasks",
    calendar: "Calendar",
    financial: "Financial",
    users: "Users",
    signOut: "Sign Out",
    name: "Name",
    email: "Email",
    role: "Role",
    
    // Job Status
    pending: "Pending",
    inProgress: "In Progress",
    review: "Under Review",
    completed: "Completed",
    delivered: "Delivered",
    handovered: "Handed Over",
    
    // Job Progress & Client View
    jobProgress: "Job Progress",
    complete: "Complete",
    projectValue: "Project Value",
    projectReadyForReview: "Project Ready for Review!",
    reviewFinalDeliverables: "Please review the final deliverables below. Once you're satisfied with the work, click 'Accept & Complete' to finalize the project.",
    acceptCompleteProject: "Accept & Complete Project",
    projectCompleted: "Project Completed!",
    projectDeliveredSuccessfully: "Your project has been delivered successfully. You can access all final files below.",
    
    // Dashboard Layout
    creativeStudio: "Creative Studio",
    digitalDesign: "Digital Design",
    innovation: "Innovation",
    creativity: "Creativity",
    inspiration: "Inspiration",
    
    // Calendar
    calendarView: "Calendar View",
    datesWithTasks: "Dates with Tasks",
    noTasksScheduled: "No tasks scheduled",
    scheduledTasks: "Scheduled Tasks",
    type: "Type",
    taskScheduling: "Task Scheduling",
    
    // File Upload
    attachFilesOrLinks: "Attach Files or Links",
    uploadFile: "Upload File",
    cloudDriveLink: "Cloud Drive Link",
    cloudDriveLinkPlaceholder: "Paste Google Drive, Dropbox, or OneDrive link here...",

    // Dashboard
    welcome: "Welcome",
    totalJobs: "Total Jobs",
    activeJobs: "Active Jobs",
    totalClients: "Total Clients",
    totalRevenue: "Total Revenue",
    recentJobs: "Recent Jobs",
    viewAllJobs: "View All Jobs",
    noJobsCreatedYet: "No jobs created yet",
    createNewJob: "Create New Job",
    clientsOverview: "Clients Overview",
    paymentsOverview: "Payments Overview",
    clientName: "Client Name",
    amount: "Amount",
    paymentDate: "Payment Date",
    paymentMethod: "Payment Method",
    noPaymentsReceivedYet: "No payments received yet",
    viewAllPayments: "View All Payments",
    jobManagement: "Job Management",
    createNewClient: "Create New Client",
    createNewTeamMember: "Create New Team Member",
    teamManagement: "Team Management",
    clientManagement: "Client Management",
    paymentManagement: "Payment Management",
    fileManagement: "File Management",
    settingsManagement: "Settings Management",
    logoutConfirmation: "Are you sure you want to logout?",
    logoutConfirmationDescription: "You will be redirected to the login page.",
    confirm: "Confirm",
    jobType: "Job Type",
    selectJobType: "Select job type",
    photoSession: "Photo Session",
    videoEditing: "Video Editing",
    design: "Design",
    client: "Client",
    selectClient: "Select client",
    assignedTo: "Assigned To",
    selectTeamMember: "Select team member",
    jobMarkedAsCompleted: "Job marked as completed",
    failedToMarkAsCompleted: "Failed to mark as completed",
    jobCreatedSuccessfully: "Job created successfully",
    failedToCreateJob: "Failed to create job",

    // JobFilesDisplay
    finalDeliverables: "Final Deliverables",
    jobFiles: "Job Files",
    loadingFiles: "Loading files...",
    noFinalDeliverablesYet: "No final deliverables yet",
    noFilesUploaded: "No files uploaded",
    final: "Final",
    uploadedBy: "Uploaded by",
    open: "Open",
    download: "Download",

    // JobForm
    createJob: "Create Job",

    // JobManagement
    due: "Due",

    // JobTypeSelector
    singleJob: "Single Job",
    createStandaloneJob: "Create a standalone job",
    workflowPackage: "Workflow Package",
    createCompleteWorkflow: "Create a complete workflow",

    // JobWorkflowActions
    markAsInProgress: "Mark as In Progress",
    markAsReview: "Mark as Review",
    markAsCompleted: "Mark as Completed",
    moveToNextStage: "Move to Next Stage",
    workflowUpdated: "Workflow updated successfully",
    workflowUpdateFailed: "Failed to update workflow",

    // JobWorkflowSelector
    workflowTemplate: "Workflow Template",
    selectWorkflowTemplate: "Select workflow template",
    standardPhotoWorkflow: "Standard Photo Workflow",
    videoEditingWorkflow: "Video Editing Workflow",
    designWorkflow: "Design Workflow",
    customWorkflow: "Custom Workflow",

    // LanguageSelector
    selectLanguage: "Select Language",
    english: "English",
    arabic: "Arabic",

    // LoginForm
    emailAddress: "Email Address",
    password: "Password",
    enterEmailAddress: "Enter your email address",
    enterPassword: "Enter your password",
    loginSuccess: "Login successful",
    loginError: "Login failed",
    loggingIn: "Logging in...",

    // PackageManagement
    createPackage: "Create Package",
    editPackageSuccess: "Package updated successfully",
    deletePackage: "Delete Package",

    // PaymentManagement
    createPayment: "Create Payment",
    totalReceived: "Total Received",
    thisMonth: "This Month",
    pendingAmount: "Pending Amount",

    // PaymentRequestManagement
    totalRequested: "Total Requested",
    totalPaid: "Total Paid",
    totalPending: "Total Pending",

    // ProtectedRoute
    accessDenied: "Access Denied",
    insufficientPermissions: "You don't have sufficient permissions to access this page",
    goBack: "Go Back",

    // Sidebar
    collapsed: "Collapsed",
    expanded: "Expanded",

    // TasksCalendarView
    tasksCalendar: "Tasks Calendar",
    today: "Today",
    week: "Week",
    month: "Month",
    noEventsToday: "No events today",

    // TasksMatrixView
    tasksMatrix: "Tasks Matrix",
    urgent: "Urgent",
    notUrgent: "Not Urgent",
    important: "Important",
    notImportant: "Not Important",

    // UserManagement
    createUser: "Create User",
    userCreatedSuccessfully: "User created successfully",
    userCreationFailed: "Failed to create user",
    userUpdatedSuccessfully: "User updated successfully",
    userUpdateFailed: "Failed to update user",
    userDeletedSuccessfully: "User deleted successfully",
    userDeletionFailed: "Failed to delete user",
    confirmDeleteUser: "Are you sure you want to delete this user?",
    thisActionCannotBeUndone: "This action cannot be undone",

    // Dashboard components
    overview: "Overview",
    statistics: "Statistics",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    upcomingTasks: "Upcoming Tasks",
    teamPerformance: "Team Performance",
    clientSatisfaction: "Client Satisfaction",
    monthlyRevenue: "Monthly Revenue",
    projectsCompleted: "Projects Completed",
    averageCompletionTime: "Average Completion Time",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",

    // Settings
    profileInformation: "Profile Information",
    languageSettings: "Language Settings",

    // Error handling
    errorLoadingData: "Error loading data",

    // Additional general keys
    add: "Add",
    update: "Update",
    create: "Create",
    submit: "Submit",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    ascending: "Ascending",
    descending: "Descending",
    noData: "No data available",
    noResults: "No results found",
    refresh: "Refresh",
    retry: "Retry",
    continue: "Continue",
    finish: "Finish",
    start: "Start",
    stop: "Stop",
    pause: "Pause",
    resume: "Resume",
    reset: "Reset",
    clear: "Clear",
    apply: "Apply",
    approve: "Approve",
    reject: "Reject",
    accept: "Accept",
    decline: "Decline",
    enable: "Enable",
    disable: "Disable",
    show: "Show",
    hide: "Hide",
    expand: "Expand",
    collapse: "Collapse",
    maximize: "Maximize",
    minimize: "Minimize",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit Fullscreen",
    copy: "Copy",
    paste: "Paste",
    cut: "Cut",
    undo: "Undo",
    redo: "Redo",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    import: "Import",
    export: "Export",
    print: "Print",
    share: "Share",
    send: "Send",
    receive: "Receive",
    upload: "Upload",
    sync: "Sync",
    backup: "Backup",
    restore: "Restore",
    archive: "Archive",
    unarchive: "Unarchive",
    favorite: "Favorite",
    unfavorite: "Unfavorite",
    bookmark: "Bookmark",
    unbookmark: "Unbookmark",
    like: "Like",
    unlike: "Unlike",
    follow: "Follow",
    unfollow: "Unfollow",
    subscribe: "Subscribe",
    unsubscribe: "Unsubscribe",
    notify: "Notify",
    mute: "Mute",
    unmute: "Unmute",
    block: "Block",
    unblock: "Unblock",
    report: "Report",
    flag: "Flag",
    unflag: "Unflag",
  },
  ar: {
    // General
    success: "نجاح",
    error: "خطأ",
    home: "الرئيسية",
    dashboard: "لوحة التحكم",
    jobs: "المهام",
    clients: "العملاء",
    team: "الفريق",
    payments: "المدفوعات",
    files: "الملفات",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    signup: "اشتراك",
    title: "العنوان",
    description: "الوصف",
    optional: "اختياري",
    enterTitle: "أدخل العنوان",
    enterDescription: "أدخل الوصف",
    price: "السعر",
    enterPrice: "أدخل السعر",
    dueDate: "تاريخ الاستحقاق",
    sessionDate: "تاريخ الجلسة",
    selectDate: "اختر تاريخ",
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    viewDetails: "عرض التفاصيل",
    unassigned: "غير معين",
    processing: "جاري المعالجة...",
    loading: "جاري التحميل...",
    
    // Navigation and UI
    tasks: "المهام",
    calendar: "التقويم",
    financial: "المالية",
    users: "المستخدمون",
    signOut: "تسجيل الخروج",
    name: "الاسم",
    email: "البريد الإلكتروني",
    role: "الدور",
    
    // Job Status
    pending: "قيد الانتظار",
    inProgress: "قيد التنفيذ",
    review: "قيد المراجعة",
    completed: "مكتمل",
    delivered: "تم التسليم",
    handovered: "تم التسليم النهائي",
    
    // Job Progress & Client View
    jobProgress: "تقدم المهمة",
    complete: "مكتمل",
    projectValue: "قيمة المشروع",
    projectReadyForReview: "مشروعك جاهز للمراجعة!",
    reviewFinalDeliverables: "يرجى مراجعة التسليمات النهائية أدناه. بمجرد أن تصبح راضيًا عن العمل، انقر على 'قبول وإكمال' لإنهاء المشروع.",
    acceptCompleteProject: "قبول وإكمال المشروع",
    projectCompleted: "تم إكمال المشروع!",
    projectDeliveredSuccessfully: "تم تسليم مشروعك بنجاح. يمكنك الوصول إلى جميع الملفات النهائية أدناه.",
    
    // Dashboard Layout
    creativeStudio: "الاستوديو الإبداعي",
    digitalDesign: "التصميم الرقمي",
    innovation: "الابتكار",
    creativity: "الإبداع",
    inspiration: "الإلهام",
    
    // Calendar
    calendarView: "عرض التقويم",
    datesWithTasks: "التواريخ التي تحتوي على مهام",
    noTasksScheduled: "لا توجد مهام مجدولة",
    scheduledTasks: "المهام المجدولة",
    type: "النوع",
    taskScheduling: "جدولة المهام",
    
    // File Upload
    attachFilesOrLinks: "إرفاق ملفات أو روابط",
    uploadFile: "رفع ملف",
    cloudDriveLink: "رابط التخزين السحابي",
    cloudDriveLinkPlaceholder: "الصق رابط Google Drive أو Dropbox أو OneDrive هنا...",

    // Dashboard
    welcome: "مرحبا",
    totalJobs: "إجمالي المهام",
    activeJobs: "المهام النشطة",
    totalClients: "إجمالي العملاء",
    totalRevenue: "إجمالي الإيرادات",
    recentJobs: "المهام الأخيرة",
    viewAllJobs: "عرض جميع المهام",
    noJobsCreatedYet: "لم يتم إنشاء أي مهام بعد",
    createNewJob: "إنشاء مهمة جديدة",
    clientsOverview: "نظرة عامة على العملاء",
    paymentsOverview: "نظرة عامة على المدفوعات",
    clientName: "اسم العميل",
    amount: "المبلغ",
    paymentDate: "تاريخ الدفع",
    paymentMethod: "طريقة الدفع",
    noPaymentsReceivedYet: "لم يتم استلام أي مدفوعات بعد",
    viewAllPayments: "عرض جميع المدفوعات",
    jobManagement: "إدارة المهام",
    createNewClient: "إنشاء عميل جديد",
    createNewTeamMember: "إنشاء عضو فريق جديد",
    teamManagement: "إدارة الفريق",
    clientManagement: "إدارة العملاء",
    paymentManagement: "إدارة المدفوعات",
    fileManagement: "إدارة الملفات",
    settingsManagement: "إدارة الإعدادات",
    logoutConfirmation: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
    logoutConfirmationDescription: "سيتم إعادة توجيهك إلى صفحة تسجيل الدخول.",
    confirm: "تأكيد",
    jobType: "نوع المهمة",
    selectJobType: "اختر نوع المهمة",
    photoSession: "جلسة تصوير",
    videoEditing: "تحرير الفيديو",
    design: "تصميم",
    client: "عميل",
    selectClient: "اختر عميل",
    assignedTo: "تعيين إلى",
    selectTeamMember: "اختر عضو فريق",
    jobMarkedAsCompleted: "تم وضع علامة على المهمة كمكتملة",
    failedToMarkAsCompleted: "فشل في وضع علامة كمكتملة",
    jobCreatedSuccessfully: "تم إنشاء المهمة بنجاح",
    failedToCreateJob: "فشل في إنشاء المهمة",

    // JobFilesDisplay
    finalDeliverables: "التسليمات النهائية",
    jobFiles: "ملفات المهمة",
    loadingFiles: "جاري تحميل الملفات...",
    noFinalDeliverablesYet: "لا توجد تسليمات نهائية بعد",
    noFilesUploaded: "لم يتم رفع أي ملفات",
    final: "نهائي",
    uploadedBy: "رفع بواسطة",
    open: "فتح",
    download: "تحميل",

    // JobForm
    createJob: "إنشاء مهمة",

    // JobManagement
    due: "مستحق",

    // JobTypeSelector
    singleJob: "مهمة واحدة",
    createStandaloneJob: "إنشاء مهمة مستقلة",
    workflowPackage: "حزمة سير العمل",
    createCompleteWorkflow: "إنشاء سير عمل كامل",

    // JobWorkflowActions
    markAsInProgress: "وضع علامة قيد التنفيذ",
    markAsReview: "وضع علامة قيد المراجعة",
    markAsCompleted: "وضع علامة كمكتمل",
    moveToNextStage: "الانتقال للمرحلة التالية",
    workflowUpdated: "تم تحديث سير العمل بنجاح",
    workflowUpdateFailed: "فشل في تحديث سير العمل",

    // JobWorkflowSelector
    workflowTemplate: "قالب سير العمل",
    selectWorkflowTemplate: "اختر قالب سير العمل",
    standardPhotoWorkflow: "سير عمل التصوير القياسي",
    videoEditingWorkflow: "سير عمل تحرير الفيديو",
    designWorkflow: "سير عمل التصميم",
    customWorkflow: "سير عمل مخصص",

    // LanguageSelector
    selectLanguage: "اختر اللغة",
    english: "الإنجليزية",
    arabic: "العربية",

    // LoginForm
    emailAddress: "عنوان البريد الإلكتروني",
    password: "كلمة المرور",
    enterEmailAddress: "أدخل عنوان بريدك الإلكتروني",
    enterPassword: "أدخل كلمة المرور",
    loginSuccess: "تم تسجيل الدخول بنجاح",
    loginError: "فشل في تسجيل الدخول",
    loggingIn: "جاري تسجيل الدخول...",

    // PackageManagement
    createPackage: "إنشاء باقة",
    editPackageSuccess: "تم تحديث الباقة بنجاح",
    deletePackage: "حذف الباقة",

    // PaymentManagement
    createPayment: "إنشاء دفعة",
    totalReceived: "إجمالي المستلم",
    thisMonth: "هذا الشهر",
    pendingAmount: "المبلغ المعلق",

    // PaymentRequestManagement
    totalRequested: "إجمالي المطلوب",
    totalPaid: "إجمالي المدفوع",
    totalPending: "إجمالي المعلق",

    // ProtectedRoute
    accessDenied: "تم رفض الوصول",
    insufficientPermissions: "ليس لديك صلاحيات كافية للوصول إلى هذه الصفحة",
    goBack: "العودة",

    // Sidebar
    collapsed: "مطوي",
    expanded: "موسع",

    // TasksCalendarView
    tasksCalendar: "تقويم المهام",
    today: "اليوم",
    week: "أسبوع",
    month: "شهر",
    noEventsToday: "لا توجد أحداث اليوم",

    // TasksMatrixView
    tasksMatrix: "مصفوفة المهام",
    urgent: "عاجل",
    notUrgent: "غير عاجل",
    important: "مهم",
    notImportant: "غير مهم",

    // UserManagement
    createUser: "إنشاء مستخدم",
    userCreatedSuccessfully: "تم إنشاء المستخدم بنجاح",
    userCreationFailed: "فشل في إنشاء المستخدم",
    userUpdatedSuccessfully: "تم تحديث المستخدم بنجاح",
    userUpdateFailed: "فشل في تحديث المستخدم",
    userDeletedSuccessfully: "تم حذف المستخدم بنجاح",
    userDeletionFailed: "فشل في حذف المستخدم",
    confirmDeleteUser: "هل أنت متأكد أنك تريد حذف هذا المستخدم؟",
    thisActionCannotBeUndone: "لا يمكن التراجع عن هذا الإجراء",

    // Dashboard components
    overview: "نظرة عامة",
    statistics: "الإحصائيات",
    recentActivity: "النشاط الأخير",
    quickActions: "الإجراءات السريعة",
    upcomingTasks: "المهام القادمة",
    teamPerformance: "أداء الفريق",
    clientSatisfaction: "رضا العملاء",
    monthlyRevenue: "الإيرادات الشهرية",
    projectsCompleted: "المشاريع المكتملة",
    averageCompletionTime: "متوسط وقت الإنجاز",
    days: "أيام",
    hours: "ساعات",
    minutes: "دقائق",
    seconds: "ثواني",

    // Settings
    profileInformation: "معلومات الملف الشخصي",
    languageSettings: "إعدادات اللغة",

    // Error handling
    errorLoadingData: "خطأ في تحميل البيانات",

    // Additional general keys
    add: "إضافة",
    update: "تحديث",
    create: "إنشاء",
    submit: "إرسال",
    close: "إغلاق",
    back: "العودة",
    next: "التالي",
    previous: "السابق",
    search: "بحث",
    filter: "تصفية",
    sort: "ترتيب",
    ascending: "تصاعدي",
    descending: "تنازلي",
    noData: "لا توجد بيانات متاحة",
    noResults: "لم يتم العثور على نتائج",
    refresh: "تحديث",
    retry: "إعادة المحاولة",
    continue: "متابعة",
    finish: "إنهاء",
    start: "بدء",
    stop: "إيقاف",
    pause: "إيقاف مؤقت",
    resume: "استئناف",
    reset: "إعادة تعيين",
    clear: "مسح",
    apply: "تطبيق",
    approve: "موافقة",
    reject: "رفض",
    accept: "قبول",
    decline: "رفض",
    enable: "تفعيل",
    disable: "تعطيل",
    show: "إظهار",
    hide: "إخفاء",
    expand: "توسيع",
    collapse: "طي",
    maximize: "تكبير",
    minimize: "تصغير",
    fullscreen: "ملء الشاشة",
    exitFullscreen: "الخروج من ملء الشاشة",
    copy: "نسخ",
    paste: "لصق",
    cut: "قص",
    undo: "تراجع",
    redo: "إعادة",
    selectAll: "تحديد الكل",
    deselectAll: "إلغاء تحديد الكل",
    import: "استيراد",
    export: "تصدير",
    print: "طباعة",
    share: "مشاركة",
    send: "إرسال",
    receive: "استقبال",
    upload: "رفع",
    sync: "مزامنة",
    backup: "نسخ احتياطي",
    restore: "استعادة",
    archive: "أرشفة",
    unarchive: "إلغاء الأرشفة",
    favorite: "مفضلة",
    unfavorite: "إلغاء المفضلة",
    bookmark: "إشارة مرجعية",
    unbookmark: "إلغاء الإشارة المرجعية",
    like: "إعجاب",
    unlike: "إلغاء الإعجاب",
    follow: "متابعة",
    unfollow: "إلغاء المتابعة",
    subscribe: "اشتراك",
    unsubscribe: "إلغاء الاشتراك",
    notify: "إشعار",
    mute: "كتم",
    unmute: "إلغاء الكتم",
    block: "حظر",
    unblock: "إلغاء الحظر",
    report: "إبلاغ",
    flag: "علامة",
    unflag: "إلغاء العلامة",
  }
};

export type Locale = keyof typeof translations;

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(key: TranslationKey, language: Language): string {
  return translations[language][key] || translations.en[key] || key;
}
