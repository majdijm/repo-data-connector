
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  due_date: string | null;
  description: string | null;
  type: string;
  clients?: {
    name: string;
  };
}

interface CalendarIntegrationProps {
  job: Job;
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ job }) => {
  const { toast } = useToast();

  const generateICSFile = () => {
    if (!job.due_date) {
      toast({
        title: "Error",
        description: "This job doesn't have a due date set",
        variant: "destructive"
      });
      return;
    }

    const startDate = new Date(job.due_date);
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Photography Studio//Job Scheduler//EN
BEGIN:VEVENT
UID:job-${job.id}@photography-studio.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${job.title}${job.clients?.name ? ` - ${job.clients.name}` : ''}
DESCRIPTION:Job Type: ${job.type.replace('_', ' ')}${job.description ? `\\nDescription: ${job.description}` : ''}${job.clients?.name ? `\\nClient: ${job.clients.name}` : ''}
LOCATION:Studio
CATEGORIES:WORK,PHOTOGRAPHY
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT30M
DESCRIPTION:Job reminder: ${job.title}
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `job-${job.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Calendar event file downloaded. Import it into your calendar app."
    });
  };

  const generateGoogleCalendarLink = () => {
    if (!job.due_date) {
      toast({
        title: "Error",
        description: "This job doesn't have a due date set",
        variant: "destructive"
      });
      return;
    }

    const startDate = new Date(job.due_date);
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration

    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = encodeURIComponent(`${job.title}${job.clients?.name ? ` - ${job.clients.name}` : ''}`);
    const details = encodeURIComponent(`Job Type: ${job.type.replace('_', ' ')}${job.description ? `\nDescription: ${job.description}` : ''}${job.clients?.name ? `\nClient: ${job.clients.name}` : ''}`);
    const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=Studio&sf=true&output=xml`;

    window.open(googleCalendarUrl, '_blank');
  };

  if (!job.due_date) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          Add to Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={generateGoogleCalendarLink}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-3 w-3" />
            Google Calendar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={generateICSFile}
            className="flex items-center gap-2"
          >
            <Download className="h-3 w-3" />
            Download .ics
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Due: {new Date(job.due_date).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default CalendarIntegration;
