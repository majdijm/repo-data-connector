
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';
import { useJobWorkflow } from '@/hooks/useJobWorkflow';
import { useTranslation } from '@/hooks/useTranslation';
import JobFilesDisplay from './JobFilesDisplay';
import JobComments from './JobComments';

interface Job {
  id: string;
  title: string;
  status: string;
  description?: string;
  due_date?: string;
  price?: number;
  clients?: {
    name: string;
  };
}

interface ClientJobProgressProps {
  job: Job;
  onJobUpdate?: () => void;
}

const ClientJobProgress: React.FC<ClientJobProgressProps> = ({ job, onJobUpdate }) => {
  const { updateJobProgress, isLoading } = useJobWorkflow();
  const { t } = useTranslation();

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 10;
      case 'in_progress': return 50;
      case 'review': return 80;
      case 'completed': return 95;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
      case 'review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: t('pending') || 'معلق',
      in_progress: t('inProgress') || 'قيد التنفيذ',
      review: t('review') || 'مراجعة',
      completed: t('completed') || 'مكتمل',
      delivered: t('delivered') || 'تم التسليم'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const handleAcceptJob = async () => {
    try {
      const success = await updateJobProgress(job.id, 'delivered');
      if (success && onJobUpdate) {
        onJobUpdate(); // Trigger parent component to refresh data
      }
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  const progress = getProgressPercentage(job.status);
  const showAcceptButton = job.status === 'completed';
  const showFinalDeliverables = ['completed', 'delivered'].includes(job.status);

  return (
    <div className="space-y-6">
      {/* Job Progress Overview */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-3">
            {getStatusIcon(job.status)}
            <div>
              <h2 className="text-xl font-bold">{job.title}</h2>
              <p className="text-blue-100 text-sm">{t('jobProgress') || 'تقدم الوظيفة'}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(job.status)} text-sm px-3 py-1`}>
                {getStatusText(job.status)}
              </Badge>
              <span className="text-sm text-gray-600">
                {progress}% {t('complete') || 'مكتمل'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {job.price && (
                <div>
                  <p className="text-sm text-gray-600">{t('projectValue') || 'قيمة المشروع'}</p>
                  <p className="font-semibold text-lg text-green-600">${job.price}</p>
                </div>
              )}
              {job.due_date && (
                <div>
                  <p className="text-sm text-gray-600">{t('dueDate') || 'تاريخ الاستحقاق'}</p>
                  <p className="font-semibold">{new Date(job.due_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {job.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{job.description}</p>
              </div>
            )}

            {/* Accept Job Button */}
            {showAcceptButton && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">
                    {t('projectReadyForReview') || 'مشروعك جاهز للمراجعة!'}
                  </h3>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  {t('reviewFinalDeliverables') || 'يرجى مراجعة التسليمات النهائية أدناه. بمجرد أن تصبح راضيًا عن العمل، انقر على "قبول وإكمال" لإنهاء المشروع.'}
                </p>
                <Button
                  onClick={handleAcceptJob}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (t('processing') || 'جاري المعالجة...') : (t('acceptCompleteProject') || 'قبول وإكمال المشروع')}
                </Button>
              </div>
            )}

            {/* Project Completed Message */}
            {job.status === 'delivered' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">
                    {t('projectCompleted') || 'تم إكمال المشروع!'}
                  </h3>
                </div>
                <p className="text-sm text-blue-700">
                  {t('projectDeliveredSuccessfully') || 'تم تسليم مشروعك بنجاح. يمكنك الوصول إلى جميع الملفات النهائية أدناه.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Deliverables - Only show for completed/delivered jobs */}
      {showFinalDeliverables && (
        <JobFilesDisplay jobId={job.id} />
      )}

      {/* Handover Notes - Only show for completed/delivered jobs */}
      {showFinalDeliverables && (
        <JobComments
          jobId={job.id}
          jobTitle={job.title}
          clientName={job.clients?.name}
        />
      )}
    </div>
  );
};

export default ClientJobProgress;
