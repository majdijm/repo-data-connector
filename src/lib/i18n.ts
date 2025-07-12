
export const translations = {
  en: {
    // General translations
    loading: 'Loading...',
    english: 'English',
    arabic: 'Arabic',
    success: 'Success',
    error: 'Error',
    workflowStageCompleted: 'Workflow stage completed successfully',
    failedToCompleteStage: 'Failed to complete workflow stage',
    jobMarkedAsCompleted: 'Job marked as completed',
    failedToMarkAsCompleted: 'Failed to mark job as completed',
    workflowActions: 'Workflow Actions',
    stageNotes: 'Stage Notes',
    addNotesForNextStage: 'Add notes for the next stage...',
    moveToNextStage: 'Move to Next Stage',
    markAsCompleted: 'Mark as Completed',
    jobFiles: 'Job Files',
    noFilesUploaded: 'No files uploaded yet.',

    // Job progress translations
    jobProgress: 'Job Progress',
    complete: 'Complete',
    projectValue: 'Project Value',
    dueDate: 'Due Date',
    projectReadyForReview: 'Your project is ready for review!',
    reviewFinalDeliverables: 'Please review the final deliverables below. Once you\'re satisfied with the work, click "Accept & Complete" to finalize the project.',
    acceptCompleteProject: 'Accept & Complete Project',
    processing: 'Processing...',
    projectCompleted: 'Project Completed!',
    projectDeliveredSuccessfully: 'Your project has been delivered successfully. You can access all final files below.',
    projectAcceptedSuccessfully: 'Project accepted and completed successfully!',
    failedToAcceptProject: 'Failed to accept project. Please try again.',
    
    // Status translations
    pending: 'Pending',
    inProgress: 'In Progress',
    review: 'Review',
    completed: 'Completed',
    delivered: 'Delivered',
    
    // File section translations
    finalDeliverables: 'Final Deliverables',
    handoverNotes: 'Handover Notes',
    noFinalDeliverablesYet: 'No final deliverables available yet. Files will appear here once the work is completed.',
    open: 'Open',
    download: 'Download',
    uploadedBy: 'Uploaded by',
    final: 'Final',
    loadingFiles: 'Loading files...'
  },
  ar: {
    // General translations
    loading: 'جاري التحميل...',
    english: 'الإنجليزية',
    arabic: 'العربية',
    success: 'نجاح',
    error: 'خطأ',
    workflowStageCompleted: 'تم إكمال مرحلة سير العمل بنجاح',
    failedToCompleteStage: 'فشل إكمال مرحلة سير العمل',
    jobMarkedAsCompleted: 'تم وضع علامة "مكتمل" على المهمة',
    failedToMarkAsCompleted: 'فشل وضع علامة "مكتمل" على المهمة',
    workflowActions: 'إجراءات سير العمل',
    stageNotes: 'ملاحظات المرحلة',
    addNotesForNextStage: 'أضف ملاحظات للمرحلة التالية...',
    moveToNextStage: 'الانتقال إلى المرحلة التالية',
    markAsCompleted: 'وضع علامة "مكتمل"',
    jobFiles: 'ملفات الوظيفة',
    noFilesUploaded: 'لم يتم رفع أي ملفات بعد.',

    // Job progress translations
    jobProgress: 'تقدم الوظيفة',
    complete: 'مكتمل',
    projectValue: 'قيمة المشروع',
    dueDate: 'تاريخ الاستحقاق',
    projectReadyForReview: 'مشروعك جاهز للمراجعة!',
    reviewFinalDeliverables: 'يرجى مراجعة التسليمات النهائية أدناه. بمجرد أن تصبح راضيًا عن العمل، انقر على "قبول وإكمال" لإنهاء المشروع.',
    acceptCompleteProject: 'قبول وإكمال المشروع',
    processing: 'جاري المعالجة...',
    projectCompleted: 'تم إكمال المشروع!',
    projectDeliveredSuccessfully: 'تم تسليم مشروعك بنجاح. يمكنك الوصول إلى جميع الملفات النهائية أدناه.',
    projectAcceptedSuccessfully: 'تم قبول المشروع وإكماله بنجاح!',
    failedToAcceptProject: 'فشل في قبول المشروع. يرجى المحاولة مرة أخرى.',
    
    // Status translations
    pending: 'معلق',
    inProgress: 'قيد التنفيذ',
    review: 'مراجعة',
    completed: 'مكتمل',
    delivered: 'تم التسليم',
    
    // File section translations
    finalDeliverables: 'التسليمات النهائية',
    handoverNotes: 'ملاحظات التسليم',
    noFinalDeliverablesYet: 'لا توجد تسليمات نهائية متاحة بعد. ستظهر الملفات هنا بمجرد اكتمال العمل.',
    open: 'فتح',
    download: 'تحميل',
    uploadedBy: 'تم رفعه بواسطة',
    final: 'نهائي',
    loadingFiles: 'جارٍ تحميل الملفات...'
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
