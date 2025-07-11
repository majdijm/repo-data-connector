export type Language = 'en' | 'ar';

export type TranslationKey = 
  | 'welcome'
  | 'loading'
  | 'error'
  | 'errorLoadingData'
  | 'dashboard'
  | 'jobs'
  | 'clients'
  | 'users'
  | 'payments'
  | 'settings'
  | 'logout'
  | 'login'
  | 'email'
  | 'password'
  | 'name'
  | 'role'
  | 'admin'
  | 'receptionist'
  | 'photographer'
  | 'designer'
  | 'editor'
  | 'client'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'review'
  | 'delivered'
  | 'save'
  | 'cancel'
  | 'delete'
  | 'edit'
  | 'create'
  | 'update'
  | 'view'
  | 'search'
  | 'filter'
  | 'sort'
  | 'export'
  | 'import'
  | 'print'
  | 'download'
  | 'upload'
  | 'close'
  | 'open'
  | 'add'
  | 'remove'
  | 'clear'
  | 'reset'
  | 'submit'
  | 'confirm'
  | 'yes'
  | 'no'
  | 'ok'
  | 'back'
  | 'next'
  | 'previous'
  | 'home'
  | 'profile'
  | 'account'
  | 'preferences'
  | 'notifications'
  | 'help'
  | 'about'
  | 'contact'
  | 'support'
  | 'feedback'
  | 'report'
  | 'bug'
  | 'feature'
  | 'suggestion'
  | 'improvement'
  | 'changelog'
  | 'version'
  | 'license'
  | 'privacy'
  | 'terms'
  | 'cookie'
  | 'language'
  | 'theme'
  | 'dark'
  | 'light'
  | 'auto'
  | 'calendar'
  | 'date'
  | 'time'
  | 'today'
  | 'tomorrow'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'year'
  | 'hour'
  | 'minute'
  | 'second'
  | 'am'
  | 'pm'
  | 'creativeStudio'
  | 'digitalDesign'
  | 'innovation'
  | 'creativity'
  | 'inspiration'
  | 'workflowStageCompleted'
  | 'failedToCompleteStage'
  | 'jobMarkedAsCompleted'
  | 'failedToMarkAsCompleted'
  | 'workflowActions'
  | 'stageNotes'
  | 'addNotesForNextStage'
  | 'moveToNextStage'
  | 'markAsCompleted'
  | 'clientPortalSubtitle'
  | 'totalJobs'
  | 'active'
  | 'completedJobs'
  | 'totalPaid'
  | 'accountBalance'
  | 'outstanding'
  | 'paid'
  | 'recentJobs'
  | 'noJobsFound'
  | 'contactUsForNewProjects'
  | 'dueDate'
  | 'recentPayments'
  | 'type'
  | 'price'
  | 'calendarView'
  | 'datesWithTasks'
  | 'selectDate'
  | 'noTasksScheduled'
  | 'scheduledTasks'
  | 'viewDetails'
  | 'failedToFetchJobs'
  | 'success'
  | 'loaded'
  | 'jobsCount'
  | 'unknownError'
  | 'confirmDeleteJob'
  | 'jobDeletedSuccessfully'
  | 'failedToDeleteJob'
  | 'jobStatusUpdatedSuccessfully'
  | 'failedToUpdateJobStatus'
  | 'unknown'
  | 'noPermissionToViewJobs'
  | 'loadingJobs'
  | 'myJobs'
  | 'jobManagement'
  | 'createJob'
  | 'createNewJob'
  | 'noJobsAssignedYet'
  | 'noJobsCreatedYet'
  | 'workflow'
  | 'step'
  | 'assigned'
  | 'unassigned'
  | 'due'
  | 'noDueDate'
  | 'description'
  | 'status'
  | 'editJob'
  | 'english'
  | 'arabic'
  | 'tasks'
  | 'files'
  | 'financial'
  | 'signOut'
  | 'taskScheduling'
  | 'profileInformation'
  | 'languageSettings'
  | 'selectLanguage'
  | 'inProgress'
  | 'jobOverview'
  | 'totalProjectsThisMonth'
  | 'totalCompletedProjects'
  | 'totalRevenueThisMonth'
  | 'totalPendingPayments'
  | 'allJobs'
  | 'recentActivity'
  | 'clientPortal'
  | 'myTasks'
  | 'designTasks'
  | 'photoSessionJobs'
  | 'videoEditingJobs'
  | 'designJobs'
  | 'editingTasks'
  | 'portfolioShowcase'
  | 'taskSummary'
  | 'completedToday'
  | 'pendingTasks'
  | 'inReviewTasks'
  | 'creativeProjects'
  | 'upcomingDeadlines'
  | 'noTasksDue'
  | 'workflowOverview'
  | 'jobsInProgress'
  | 'jobsCompleted'
  | 'averageCompletionTime'
  | 'days'
  | 'hours'
  | 'quickActions'
  | 'addNewClient'
  | 'viewAllJobs'
  | 'generateReport'
  | 'monthlyRevenue'
  | 'activeProjects'
  | 'teamMembers'
  | 'completionRate'
  | 'currentTasks'
  | 'dueSoon'
  | 'overdue'
  | 'overdueByDays'
  | 'performanceMetrics'
  | 'projectsCompleted'
  | 'averageRating'
  | 'clientSatisfaction'
  | 'availableJobs'
  | 'applyNow'
  | 'jobsAssigned'
  | 'portfolioHighlights'
  | 'recentWork'
  | 'skills'
  | 'availability'
  | 'available'
  | 'unavailable'
  | 'busy'
  | 'vacation'
  | 'workload'
  | 'clientManagement'
  | 'newClientRegistrations'
  | 'totalActiveClients'
  | 'clientRetentionRate'
  | 'upcomingAppointments'
  | 'todaysSchedule'
  | 'appointments'
  | 'schedule'
  | 'bookNewAppointment'
  | 'manageClients'
  | 'editProfile'
  | 'changePassword'
  | 'notificationSettings'
  | 'themeSettings'
  | 'lightMode'
  | 'darkMode'
  | 'systemDefault'
  | 'emailNotifications'
  | 'pushNotifications'
  | 'smsNotifications'
  | 'enableNotifications'
  | 'disableNotifications'
  | 'saveSettings'
  | 'settingsSaved'
  | 'failedToSaveSettings';

export type TranslationKeys = {
  [K in TranslationKey]: string;
};

const translations: Record<string, TranslationKeys> = {
  en: {
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
    errorLoadingData: 'Error loading data',
    dashboard: 'Dashboard',
    jobs: 'Jobs',
    clients: 'Clients',
    users: 'Users',
    payments: 'Payments',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    role: 'Role',
    admin: 'Admin',
    receptionist: 'Receptionist',
    photographer: 'Photographer',
    designer: 'Designer',
    editor: 'Editor',
    client: 'Client',
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    review: 'Review',
    delivered: 'Delivered',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    export: 'Export',
    import: 'Import',
    print: 'Print',
    download: 'Download',
    upload: 'Upload',
    close: 'Close',
    open: 'Open',
    add: 'Add',
    remove: 'Remove',
    clear: 'Clear',
    reset: 'Reset',
    submit: 'Submit',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    home: 'Home',
    profile: 'Profile',
    account: 'Account',
    preferences: 'Preferences',
    notifications: 'Notifications',
    help: 'Help',
    about: 'About',
    contact: 'Contact',
    support: 'Support',
    feedback: 'Feedback',
    report: 'Report',
    bug: 'Bug',
    feature: 'Feature',
    suggestion: 'Suggestion',
    improvement: 'Improvement',
    changelog: 'Changelog',
    version: 'Version',
    license: 'License',
    privacy: 'Privacy',
    terms: 'Terms',
    cookie: 'Cookie',
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    auto: 'Auto',
    calendar: 'Calendar',
    date: 'Date',
    time: 'Time',
    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second',
    am: 'AM',
    pm: 'PM',
    creativeStudio: 'Creative Studio',
    digitalDesign: 'Digital Design',
    innovation: 'Innovation',
    creativity: 'Creativity',
    inspiration: 'Inspiration',
    workflowStageCompleted: 'Workflow stage completed successfully',
    failedToCompleteStage: 'Failed to complete workflow stage',
    jobMarkedAsCompleted: 'Job marked as completed',
    failedToMarkAsCompleted: 'Failed to mark job as completed',
    workflowActions: 'Workflow Actions',
    stageNotes: 'Stage Notes',
    addNotesForNextStage: 'Add notes for next stage (optional)',
    moveToNextStage: 'Move to Next Stage',
    markAsCompleted: 'Mark as Completed',
    clientPortalSubtitle: 'Track your projects and payments',
    totalJobs: 'Total Jobs',
    active: 'Active',
    completedJobs: 'Completed Jobs',
    totalPaid: 'Total Paid',
    accountBalance: 'Account Balance',
    outstanding: 'Outstanding',
    paid: 'Paid',
    recentJobs: 'Recent Jobs',
    noJobsFound: 'No jobs found',
    contactUsForNewProjects: 'Contact us for new projects',
    dueDate: 'Due Date',
    recentPayments: 'Recent Payments',
    type: 'Type',
    price: 'Price',
    calendarView: 'Calendar View',
    datesWithTasks: 'Dates with Tasks',
    selectDate: 'Select Date',
    noTasksScheduled: 'No tasks scheduled for this date',
    scheduledTasks: 'Scheduled Tasks',
    viewDetails: 'View Details',
    failedToFetchJobs: 'Failed to fetch jobs',
    success: 'Success',
    loaded: 'Loaded',
    jobsCount: 'jobs',
    unknownError: 'Unknown error',
    confirmDeleteJob: 'Are you sure you want to delete this job?',
    jobDeletedSuccessfully: 'Job deleted successfully',
    failedToDeleteJob: 'Failed to delete job',
    jobStatusUpdatedSuccessfully: 'Job status updated successfully',
    failedToUpdateJobStatus: 'Failed to update job status',
    unknown: 'Unknown',
    noPermissionToViewJobs: 'You do not have permission to view jobs.',
    loadingJobs: 'Loading Jobs...',
    myJobs: 'My Jobs',
    jobManagement: 'Job Management',
    createJob: 'Create Job',
    createNewJob: 'Create New Job',
    noJobsAssignedYet: 'No jobs assigned to you yet.',
    noJobsCreatedYet: 'No jobs created yet.',
    workflow: 'Workflow',
    step: 'Step',
    assigned: 'Assigned',
    unassigned: 'Unassigned',
    due: 'Due',
    noDueDate: 'No Due Date',
    description: 'Description',
    status: 'Status',
    editJob: 'Edit Job',
    english: 'English',
    arabic: 'Arabic',
    tasks: 'Tasks',
    files: 'Files',
    financial: 'Financial',
    signOut: 'Sign Out',
    taskScheduling: 'Task Scheduling',
    profileInformation: 'Profile Information',
    languageSettings: 'Language Settings',
    selectLanguage: 'Select Language',
    inProgress: 'In Progress',
    jobOverview: 'Job Overview',
    totalProjectsThisMonth: 'Total Projects This Month',
    totalCompletedProjects: 'Total Completed Projects',
    totalRevenueThisMonth: 'Total Revenue This Month',
    totalPendingPayments: 'Total Pending Payments',
    allJobs: 'All Jobs',
    recentActivity: 'Recent Activity',
    clientPortal: 'Client Portal',
    myTasks: 'My Tasks',
    designTasks: 'Design Tasks',
    photoSessionJobs: 'Photo Session Jobs',
    videoEditingJobs: 'Video Editing Jobs',
    designJobs: 'Design Jobs',
    editingTasks: 'Editing Tasks',
    portfolioShowcase: 'Portfolio Showcase',
    taskSummary: 'Task Summary',
    completedToday: 'Completed Today',
    pendingTasks: 'Pending Tasks',
    inReviewTasks: 'In Review Tasks',
    creativeProjects: 'Creative Projects',
    upcomingDeadlines: 'Upcoming Deadlines',
    noTasksDue: 'No tasks due',
    workflowOverview: 'Workflow Overview',
    jobsInProgress: 'Jobs In Progress',
    jobsCompleted: 'Jobs Completed',
    averageCompletionTime: 'Average Completion Time',
    days: 'Days',
    hours: 'Hours',
    quickActions: 'Quick Actions',
	addNewClient: 'Add New Client',
	viewAllJobs: 'View All Jobs',
	generateReport: 'Generate Report',
	monthlyRevenue: 'Monthly Revenue',
	activeProjects: 'Active Projects',
	teamMembers: 'Team Members',
	completionRate: 'Completion Rate',
    currentTasks: 'Current Tasks',
    dueSoon: 'Due Soon',
    overdue: 'Overdue',
    overdueByDays: 'Overdue By Days',
    performanceMetrics: 'Performance Metrics',
    projectsCompleted: 'Projects Completed',
    averageRating: 'Average Rating',
    clientSatisfaction: 'Client Satisfaction',
    availableJobs: 'Available Jobs',
    applyNow: 'Apply Now',
    jobsAssigned: 'Jobs Assigned',
    portfolioHighlights: 'Portfolio Highlights',
    recentWork: 'Recent Work',
    skills: 'Skills',
    availability: 'Availability',
    available: 'Available',
    unavailable: 'Unavailable',
    busy: 'Busy',
    vacation: 'Vacation',
    workload: 'Workload',
    clientManagement: 'Client Management',
    newClientRegistrations: 'New Client Registrations',
    totalActiveClients: 'Total Active Clients',
    clientRetentionRate: 'Client Retention Rate',
    upcomingAppointments: 'Upcoming Appointments',
    todaysSchedule: 'Today\'s Schedule',
    appointments: 'Appointments',
    schedule: 'Schedule',
    bookNewAppointment: 'Book New Appointment',
    manageClients: 'Manage Clients',
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',
    notificationSettings: 'Notification Settings',
    themeSettings: 'Theme Settings',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    systemDefault: 'System Default',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    smsNotifications: 'SMS Notifications',
    enableNotifications: 'Enable Notifications',
    disableNotifications: 'Disable Notifications',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings Saved',
    failedToSaveSettings: 'Failed to Save Settings',
  },
  ar: {
    welcome: 'أهلاً وسهلاً',
    loading: 'جارٍ التحميل...',
    error: 'خطأ',
    errorLoadingData: 'خطأ في تحميل البيانات',
    dashboard: 'لوحة التحكم',
    jobs: 'المهام',
    clients: 'العملاء',
    users: 'المستخدمون',
    payments: 'المدفوعات',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    name: 'الاسم',
    role: 'الدور',
    admin: 'مدير',
    receptionist: 'موظف استقبال',
    photographer: 'مصور',
    designer: 'مصمم',
    editor: 'محرر',
    client: 'عميل',
    pending: 'في الانتظار',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    review: 'مراجعة',
    delivered: 'مُسلم',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    create: 'إنشاء',
    update: 'تحديث',
    view: 'عرض',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    export: 'تصدير',
    import: 'استيراد',
    print: 'طباعة',
    download: 'تحميل',
    upload: 'رفع',
    close: 'إغلاق',
    open: 'فتح',
    add: 'إضافة',
    remove: 'إزالة',
    clear: 'مسح',
    reset: 'إعادة تعيين',
    submit: 'إرسال',
    confirm: 'تأكيد',
    yes: 'نعم',
    no: 'لا',
    ok: 'موافق',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    home: 'الرئيسية',
    profile: 'الملف الشخصي',
    account: 'الحساب',
    preferences: 'التفضيلات',
    notifications: 'الإشعارات',
    help: 'المساعدة',
    about: 'حول',
    contact: 'اتصل بنا',
    support: 'الدعم',
    feedback: 'التعليقات',
    report: 'تقرير',
    bug: 'خلل',
    feature: 'ميزة',
    suggestion: 'اقتراح',
    improvement: 'تحسين',
    changelog: 'سجل التغييرات',
    version: 'الإصدار',
    license: 'الترخيص',
    privacy: 'الخصوصية',
    terms: 'الشروط',
    cookie: 'ملف تعريف الارتباط',
    language: 'اللغة',
    theme: 'المظهر',
    dark: 'داكن',
    light: 'فاتح',
    auto: 'تلقائي',
    calendar: 'التقويم',
    date: 'التاريخ',
    time: 'الوقت',
    today: 'اليوم',
    tomorrow: 'غداً',
    yesterday: 'أمس',
    week: 'الأسبوع',
    month: 'الشهر',
    year: 'السنة',
    hour: 'الساعة',
    minute: 'الدقيقة',
    second: 'الثانية',
    am: 'ص',
    pm: 'م',
    creativeStudio: 'الاستوديو الإبداعي',
    digitalDesign: 'التصميم الرقمي',
    innovation: 'الابتكار',
    creativity: 'الإبداع',
    inspiration: 'الإلهام',
    workflowStageCompleted: 'تم إكمال مرحلة سير العمل بنجاح',
    failedToCompleteStage: 'فشل في إكمال مرحلة سير العمل',
    jobMarkedAsCompleted: 'تم وضع علامة على المهمة كمكتملة',
    failedToMarkAsCompleted: 'فشل في وضع علامة المهمة كمكتملة',
    workflowActions: 'إجراءات سير العمل',
    stageNotes: 'ملاحظات المرحلة',
    addNotesForNextStage: 'أضف ملاحظات للمرحلة التالية (اختياري)',
    moveToNextStage: 'الانتقال للمرحلة التالية',
    markAsCompleted: 'تحديد كمكتمل',
    clientPortalSubtitle: 'تتبع مشاريعك ومدفوعاتك',
    totalJobs: 'إجمالي المهام',
    active: 'نشط',
    completedJobs: 'المهام المكتملة',
    totalPaid: 'إجمالي المدفوع',
    accountBalance: 'رصيد الحساب',
    outstanding: 'المستحق',
    paid: 'مدفوع',
    recentJobs: 'المهام الأخيرة',
    noJobsFound: 'لم يتم العثور على مهام',
    contactUsForNewProjects: 'اتصل بنا للمشاريع الجديدة',
    dueDate: 'تاريخ الاستحقاق',
    recentPayments: 'المدفوعات الأخيرة',
    type: 'النوع',
    price: 'السعر',
    calendarView: 'عرض التقويم',
    datesWithTasks: 'تواريخ مع مهام',
    selectDate: 'اختر تاريخ',
    noTasksScheduled: 'لا توجد مهام مقررة لهذا التاريخ',
    scheduledTasks: 'المهام المقررة',
    viewDetails: 'عرض التفاصيل',
    failedToFetchJobs: 'فشل في جلب المهام',
    success: 'نجاح',
    loaded: 'تم التحميل',
    jobsCount: 'المهام',
    unknownError: 'خطأ غير معروف',
    confirmDeleteJob: 'هل أنت متأكد أنك تريد حذف هذه المهمة؟',
    jobDeletedSuccessfully: 'تم حذف المهمة بنجاح',
    failedToDeleteJob: 'فشل في حذف المهمة',
    jobStatusUpdatedSuccessfully: 'تم تحديث حالة المهمة بنجاح',
    failedToUpdateJobStatus: 'فشل في تحديث حالة المهمة',
    unknown: 'غير معروف',
    noPermissionToViewJobs: 'ليس لديك صلاحية عرض المهام.',
    loadingJobs: 'جارٍ تحميل المهام...',
    myJobs: 'مهامي',
    jobManagement: 'إدارة المهام',
    createJob: 'إنشاء مهمة',
    createNewJob: 'إنشاء مهمة جديدة',
    noJobsAssignedYet: 'لا توجد مهام مخصصة لك حتى الآن.',
    noJobsCreatedYet: 'لا توجد مهام تم إنشاؤها حتى الآن.',
    workflow: 'سير العمل',
    step: 'خطوة',
    assigned: 'مُسندة',
    unassigned: 'غير مُسندة',
    due: 'مستحق',
    noDueDate: 'لا يوجد تاريخ استحقاق',
    description: 'الوصف',
    status: 'الحالة',
    editJob: 'تعديل المهمة',
    english: 'الإنجليزية',
    arabic: 'العربية',
    tasks: 'مهام',
    files: 'ملفات',
    financial: 'مالي',
    signOut: 'تسجيل الخروج',
    taskScheduling: 'جدولة المهام',
    profileInformation: 'معلومات الملف الشخصي',
    languageSettings: 'إعدادات اللغة',
    selectLanguage: 'اختر اللغة',
    inProgress: 'قيد التقدم',
    jobOverview: 'نظرة عامة على المهمة',
    totalProjectsThisMonth: 'إجمالي المشاريع هذا الشهر',
    totalCompletedProjects: 'إجمالي المشاريع المكتملة',
    totalRevenueThisMonth: 'إجمالي الإيرادات هذا الشهر',
    totalPendingPayments: 'إجمالي المدفوعات المعلقة',
    allJobs: 'جميع المهام',
    recentActivity: 'النشاط الأخير',
    clientPortal: 'بوابة العميل',
	myTasks: 'مهامي',
	designTasks: 'مهام التصميم',
	photoSessionJobs: 'وظائف جلسة التصوير',
	videoEditingJobs: 'وظائف تحرير الفيديو',
	designJobs: 'وظائف التصميم',
	editingTasks: 'مهام التحرير',
	portfolioShowcase: 'عرض المحفظة',
	taskSummary: 'ملخص المهمة',
	completedToday: 'اكتمل اليوم',
	pendingTasks: 'المهام المعلقة',
	inReviewTasks: 'المهام قيد المراجعة',
	creativeProjects: 'المشاريع الإبداعية',
	upcomingDeadlines: 'المواعيد النهائية القادمة',
	noTasksDue: 'لا توجد مهام مستحقة',
	workflowOverview: 'نظرة عامة على سير العمل',
	jobsInProgress: 'الوظائف قيد التقدم',
	jobsCompleted: 'الوظائف المكتملة',
	averageCompletionTime: 'متوسط ​​وقت الإنجاز',
	days: 'أيام',
	hours: 'ساعات',
	quickActions: 'إجراءات سريعة',
	addNewClient: 'أضف عميل جديد',
	viewAllJobs: 'عرض جميع الوظائف',
	generateReport: 'إنشاء تقرير',
	monthlyRevenue: 'الإيرادات الشهرية',
	activeProjects: 'المشاريع النشطة',
	teamMembers: 'أعضاء الفريق',
	completionRate: 'معدل الإنجاز',
    currentTasks: 'المهام الحالية',
    dueSoon: 'قريبًا',
    overdue: 'متأخر',
    overdueByDays: 'متأخرة منذ أيام',
    performanceMetrics: 'مقاييس الأداء',
    projectsCompleted: 'المشاريع المكتملة',
    averageRating: 'متوسط التقييم',
    clientSatisfaction: 'رضا العملاء',
    availableJobs: 'الوظائف المتاحة',
    applyNow: 'قدم الآن',
    jobsAssigned: 'الوظائف المعينة',
    portfolioHighlights: 'أبرز المحفظة',
    recentWork: 'أعمال حديثة',
    skills: 'مهارات',
    availability: 'توفر',
    available: 'متاح',
    unavailable: 'غير متاح',
    busy: 'مشغول',
    vacation: 'إجازة',
    workload: 'حجم العمل',
    clientManagement: 'إدارة العملاء',
    newClientRegistrations: 'تسجيلات عملاء جدد',
    totalActiveClients: 'إجمالي العملاء النشطين',
    clientRetentionRate: 'معدل الاحتفاظ بالعملاء',
    upcomingAppointments: 'المواعيد القادمة',
    todaysSchedule: 'جدول اليوم',
    appointments: 'المواعيد',
    schedule: 'جدول',
    bookNewAppointment: 'حجز موعد جديد',
    manageClients: 'إدارة العملاء',
    editProfile: 'تعديل الملف الشخصي',
    changePassword: 'تغيير كلمة المرور',
    notificationSettings: 'إعدادات الإشعارات',
    themeSettings: 'إعدادات المظهر',
    lightMode: 'الوضع الفاتح',
    darkMode: 'الوضع الداكن',
    systemDefault: 'الوضع الافتراضي للنظام',
    emailNotifications: 'إشعارات البريد الإلكتروني',
    pushNotifications: 'إشعارات الدفع',
    smsNotifications: 'إشعارات الرسائل القصيرة',
    enableNotifications: 'تمكين الإشعارات',
    disableNotifications: 'تعطيل الإشعارات',
    saveSettings: 'حفظ الإعدادات',
    settingsSaved: 'تم حفظ الإعدادات',
    failedToSaveSettings: 'فشل حفظ الإعدادات',
  }
};

export const getTranslation = (key: TranslationKey, language: string = 'en'): string => {
  return translations[language]?.[key] || translations['en'][key] || key;
};

export const isRTL = (language: Language): boolean => {
  return language === 'ar';
};
