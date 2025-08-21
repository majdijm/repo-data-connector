import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time?: string;
  work_date: string;
  notes?: string;
}

const AttendanceWidget = () => {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.id) {
      fetchTodayAttendance();
    }
  }, [userProfile]);

  const fetchTodayAttendance = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('work_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching attendance:', error);
        return;
      }
      
      setTodayRecord(data);
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!userProfile?.id || todayRecord) return;

    try {
      const { error } = await supabase
        .from('attendance')
        .insert({
          user_id: userProfile.id
        });

      if (error) {
        console.error('Error checking in:', error);
        return;
      }
      
      fetchTodayAttendance();
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord || todayRecord.check_out_time) return;

    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out_time: new Date().toISOString()
        })
        .eq('id', todayRecord.id);

      if (error) {
        console.error('Error checking out:', error);
        return;
      }
      
      fetchTodayAttendance();
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const calculateWorkHours = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return 'In Progress';
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return `${diff.toFixed(1)} hours`;
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-blue-600" />
          Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayRecord ? (
          <>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Check In</p>
                <p className="font-semibold text-green-700">
                  {format(new Date(todayRecord.check_in_time), 'HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check Out</p>
                <p className="font-semibold text-red-700">
                  {todayRecord.check_out_time ? 
                    format(new Date(todayRecord.check_out_time), 'HH:mm') : 
                    '-'
                  }
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Work Hours</p>
              <p className="text-xl font-bold text-blue-600">
                {calculateWorkHours(todayRecord.check_in_time, todayRecord.check_out_time)}
              </p>
            </div>

            {!todayRecord.check_out_time ? (
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800">Currently Working</Badge>
                <Button 
                  onClick={handleCheckOut} 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Check Out
                </Button>
              </div>
            ) : (
              <Badge className="w-full justify-center bg-green-100 text-green-800">
                Day Complete
              </Badge>
            )}
          </>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-gray-600">Haven't checked in today</p>
            <Button 
              onClick={handleCheckIn} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Check In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceWidget;