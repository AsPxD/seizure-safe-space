import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface Seizure {
  id: string;
  date_time: string;
  seizure_type: string;
  duration_minutes: number | null;
  triggers: string | null;
  notes: string | null;
}

export default function SeizureDiary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [seizures, setSeizures] = useState<Seizure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSeizures();
    }
  }, [user]);

  const loadSeizures = async () => {
    try {
      const { data, error } = await supabase
        .from('seizures')
        .select('*')
        .order('date_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSeizures(data || []);
    } catch (error) {
      console.error('Error loading seizures:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeizureTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tonic-clonic':
        return 'bg-destructive text-destructive-foreground';
      case 'focal':
        return 'bg-warning text-warning-foreground';
      case 'absence':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seizure Diary</h1>
          <p className="text-muted-foreground">Track and monitor your seizure events</p>
        </div>
        <Button onClick={() => navigate('/diary/new')} className="animate-gentle">
          <Plus className="h-4 w-4 mr-2" />
          Log Seizure
        </Button>
      </div>

      {seizures.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No seizures recorded yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your seizure events to better understand patterns
            </p>
            <Button onClick={() => navigate('/diary/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Record Your First Seizure
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {seizures.map((seizure) => (
            <Card key={seizure.id} className="animate-gentle hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      <p className="font-semibold text-sm">
                        {format(new Date(seizure.date_time), 'PPP')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(seizure.date_time), 'p')}
                      </p>
                    </div>
                  </div>
                  <Badge className={getSeizureTypeColor(seizure.seizure_type)}>
                    {seizure.seizure_type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  {seizure.duration_minutes && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {seizure.duration_minutes} min{seizure.duration_minutes !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  {seizure.triggers && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{seizure.triggers}</span>
                    </div>
                  )}
                </div>

                {seizure.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">Notes:</p>
                    <p className="text-sm mt-1">{seizure.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}