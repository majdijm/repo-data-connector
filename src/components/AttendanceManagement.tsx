import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, User, CheckCircle, XCircle, AlertTriangle, Users, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time?: string;
  work_date: string;
  notes?: string;
  created_at: string;
  users?: {
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AttendanceManagement = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedUser, setSelectedUser] = useState('all');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const { userProfile } = useAuth();
  const { canViewAttendance, isAdmin, isManager } = useRoleAccess();

  useEffect(() => {
    fetchUsers();
    fetchAttendanceRecords();
    fetchTodayAttendance();
  }, [selectedDate, selectedUser]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .neq('role', 'client')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    if (!canViewAttendance()) return;

    try {
      setLoading(true);
      let query = supabase
        .from('attendance')
        .select(`
          id,
          user_id,
          check_in_time,
          check_out_time,
          work_date,
          notes,
          created_at,
          users!attendance_user_id_fkey (
            name,
            email
          )
        `)
        .eq('work_date', selectedDate)
        .order('check_in_time', { ascending: false });

      if (selectedUser !== 'all') {
        query = query.eq('user_id', selectedUser);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    if (!userProfile?.id) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('work_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setTodayRecord(data);
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!userProfile?.id || todayRecord) return;

    try {
      const { error } = await supabase
        .from('attendance')
        .insert({
          user_id: userProfile.id,
          notes: checkInNotes || null
        });

      if (error) throw error;
      
      setCheckInNotes('');
      fetchTodayAttendance();
      fetchAttendanceRecords();
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

      if (error) throw error;
      
      fetchTodayAttendance();
      fetchAttendanceRecords();
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

  const getAttendanceStatus = (record: AttendanceRecord) => {
    if (!record.check_out_time) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
    }
    
    const hours = (new Date(record.check_out_time).getTime() - new Date(record.check_in_time).getTime()) / (1000 * 60 * 60);
    
    if (hours >= 8) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Full Day</Badge>;
    } else if (hours >= 4) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Half Day</Badge>;
    } else {
      return <Badge variant="destructive">Short Day</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Clock size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Attendance Management</h1>
            <p className="text-blue-100 mt-1">Track employee work hours and attendance</p>
          </div>
        </div>
      </div>

      {/* Employee Check-in/Check-out Section */}
      {!canViewAttendance() && (
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span>My Attendance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {todayRecord ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You checked in at {format(new Date(todayRecord.check_in_time), 'HH:mm')}
                    {todayRecord.check_out_time && 
                      ` and checked out at ${format(new Date(todayRecord.check_out_time), 'HH:mm')}`
                    }
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Work Hours Today</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {calculateWorkHours(todayRecord.check_in_time, todayRecord.check_out_time)}
                    </p>
                  </div>
                  {!todayRecord.check_out_time && (
                    <Button onClick={handleCheckOut} className="bg-red-600 hover:bg-red-700">
                      <XCircle className="h-4 w-4 mr-2" />
                      Check Out
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Check-in Notes (Optional)</label>
                  <Textarea
                    placeholder="Any notes for today's work..."
                    value={checkInNotes}
                    onChange={(e) => setCheckInNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                
                <Button onClick={handleCheckIn} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Check In for Today
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Management Section for Managers/Admins */}
      {canViewAttendance() && (
        <>
          {/* Filters */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Employee</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="border-2">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Attendance Records - {format(new Date(selectedDate), 'MMMM dd, yyyy')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {attendanceRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No attendance records for this date</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {attendanceRecords.map(record => (
                    <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{record.users?.name}</h3>
                            <p className="text-gray-500 text-sm">{record.users?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Check In</p>
                            <p className="text-lg font-semibold text-green-700">
                              {format(new Date(record.check_in_time), 'HH:mm')}
                            </p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Check Out</p>
                            <p className="text-lg font-semibold text-red-700">
                              {record.check_out_time ? 
                                format(new Date(record.check_out_time), 'HH:mm') : 
                                '-'
                              }
                            </p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Hours</p>
                            <p className="text-lg font-semibold text-blue-700">
                              {calculateWorkHours(record.check_in_time, record.check_out_time)}
                            </p>
                          </div>
                          
                          {getAttendanceStatus(record)}
                        </div>
                      </div>
                      
                      {record.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {record.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AttendanceManagement;