
export type TranslationKey = 
  | 'welcome'
  | 'loading'
  | 'error'
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
  | 'payments';

export type TranslationKeys = {
  [K in TranslationKey]: string;
};

const translations: Record<string, TranslationKeys> = {
  en: {
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
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
    price: 'Price'
  },
  ar: {
    welcome: 'أهلاً وسهلاً',
    loading: 'جارٍ التحميل...',
    error: 'خطأ',
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
    price: 'السعر'
  }
};

export const getTranslation = (key: TranslationKey, language: string = 'en'): string => {
  return translations[language]?.[key] || translations['en'][key] || key;
};
