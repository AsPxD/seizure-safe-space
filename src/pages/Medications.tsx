import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus, Pill, Clock, Edit, Trash2, Bell, BellOff } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string | null;
  active: boolean;
  reminder_enabled: boolean;
}

export default function Medications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMedications();
    }
  }, [user]);

  const loadMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('name');

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = async (medicationId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({ reminder_enabled: enabled })
        .eq('id', medicationId);

      if (error) throw error;

      setMedications(prev =>
        prev.map(med =>
          med.id === medicationId
            ? { ...med, reminder_enabled: enabled }
            : med
        )
      );

      toast({
        title: enabled ? "Reminder enabled" : "Reminder disabled",
        description: `Medication reminder has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating reminder",
        description: error.message,
      });
    }
  };

  const deleteMedication = async (medicationId: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId);

      if (error) throw error;

      setMedications(prev => prev.filter(med => med.id !== medicationId));

      toast({
        title: "Medication deleted",
        description: "The medication has been removed from your list.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting medication",
        description: error.message,
      });
    }
  };

  const getFrequencyBadgeColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return 'bg-success text-success-foreground';
      case 'twice daily':
        return 'bg-primary text-primary-foreground';
      case 'as needed':
        return 'bg-warning text-warning-foreground';
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
          <h1 className="text-2xl font-bold">Medications</h1>
          <p className="text-muted-foreground">Manage your medication schedule</p>
        </div>
        <Button onClick={() => navigate('/medications/new')} className="animate-gentle">
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {medications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No medications added yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your medications to track dosages and set reminders
            </p>
            <Button onClick={() => navigate('/medications/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {medications.map((medication) => (
            <Card key={medication.id} className="animate-gentle hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{medication.name}</h3>
                      {!medication.active && (
                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">
                      <strong>Dosage:</strong> {medication.dosage}
                    </p>
                    <div className="flex items-center space-x-4 mb-3">
                      <Badge className={getFrequencyBadgeColor(medication.frequency)}>
                        {medication.frequency}
                      </Badge>
                      {medication.time_of_day && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{medication.time_of_day}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/medications/edit/${medication.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMedication(medication.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center space-x-2">
                    {medication.reminder_enabled ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      Reminder {medication.reminder_enabled ? 'enabled' : 'disabled'}
                    </span>
                  </div>
                  <Switch
                    checked={medication.reminder_enabled}
                    onCheckedChange={(checked) => toggleReminder(medication.id, checked)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}