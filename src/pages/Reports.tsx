import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Pill, AlertCircle, Download } from 'lucide-react';
import { format, subDays, subMonths, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface SeizureData {
  id: string;
  date_time: string;
  seizure_type: string;
  duration_minutes: number;
}

interface MedicationLog {
  taken_at: string;
  status: string;
  medication_id: string;
}

interface Medication {
  id: string;
  name: string;
}

export default function Reports() {
  const { user } = useAuth();
  const [seizures, setSeizures] = useState<SeizureData[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Load seizures
      const { data: seizureData } = await supabase
        .from('seizures')
        .select('id, date_time, seizure_type, duration_minutes')
        .gte('date_time', startDate.toISOString())
        .order('date_time', { ascending: true });

      // Load medications
      const { data: medicationData } = await supabase
        .from('medications')
        .select('id, name')
        .eq('active', true);

      // Load medication logs
      const { data: logData } = await supabase
        .from('medication_logs')
        .select('taken_at, status, medication_id')
        .gte('taken_at', startDate.toISOString());

      setSeizures(seizureData || []);
      setMedications(medicationData || []);
      setMedicationLogs(logData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeizureFrequencyData = () => {
    const days = parseInt(timeRange);
    const startDate = subDays(new Date(), days);
    const interval = eachDayOfInterval({ start: startDate, end: new Date() });
    
    return interval.map(date => {
      const daySeizures = seizures.filter(s => 
        format(new Date(s.date_time), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      return {
        date: format(date, 'MMM dd'),
        count: daySeizures.length,
        fullDate: format(date, 'yyyy-MM-dd')
      };
    });
  };

  const getSeizureTypeData = () => {
    const typeCount = seizures.reduce((acc, seizure) => {
      acc[seizure.seizure_type] = (acc[seizure.seizure_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];
    
    return Object.entries(typeCount).map(([type, count], index) => ({
      name: type,
      value: count,
      fill: colors[index % colors.length]
    }));
  };

  const getMedicationAdherence = () => {
    const totalLogs = medicationLogs.length;
    const takenLogs = medicationLogs.filter(log => log.status === 'taken').length;
    return totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 0;
  };

  const getAverageDuration = () => {
    const durationsWithValue = seizures.filter(s => s.duration_minutes);
    if (durationsWithValue.length === 0) return 0;
    const total = durationsWithValue.reduce((sum, s) => sum + s.duration_minutes, 0);
    return Math.round(total / durationsWithValue.length);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const seizureFrequencyData = getSeizureFrequencyData();
  const seizureTypeData = getSeizureTypeData();
  const adherenceRate = getMedicationAdherence();
  const averageDuration = getAverageDuration();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Reports</h1>
          <p className="text-muted-foreground">Analyze your seizure patterns and medication adherence</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-gentle">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{seizures.length}</p>
                <p className="text-sm text-muted-foreground">Total Seizures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-gentle">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageDuration}m</p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-gentle">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <Pill className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adherenceRate}%</p>
                <p className="text-sm text-muted-foreground">Med Adherence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-gentle">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-muted/50 rounded-full">
                <Calendar className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{timeRange}</p>
                <p className="text-sm text-muted-foreground">Days Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-gentle">
          <CardHeader>
            <CardTitle>Seizure Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={seizureFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-gentle">
          <CardHeader>
            <CardTitle>Seizure Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={seizureTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {seizureTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {seizureTypeData.map((entry, index) => (
                <Badge key={entry.name} variant="outline" className="text-xs">
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: entry.fill }}
                  />
                  {entry.name} ({entry.value})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="animate-gentle">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {seizures.slice(0, 5).map((seizure) => (
              <div key={seizure.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">{seizure.seizure_type} seizure</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(seizure.date_time), 'PPp')}
                    </p>
                  </div>
                </div>
                {seizure.duration_minutes && (
                  <Badge variant="outline">{seizure.duration_minutes}m</Badge>
                )}
              </div>
            ))}
            {seizures.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No seizures recorded in the selected time period
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}