import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Pill, Clock } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string;
  reminder_enabled: boolean;
}

export const useMedicineNotifications = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadMedications = async () => {
      const { data } = await supabase
        .from('medications')
        .select('*')
        .eq('reminder_enabled', true);
      
      if (data) setMedications(data);
    };

    loadMedications();

    // Check for notifications every minute
    const interval = setInterval(() => {
      checkMedicineTime();
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const checkMedicineTime = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    medications.forEach((medication) => {
      if (medication.time_of_day === currentTime) {
        showMedicineNotification(medication);
      }
    });
  };

  const showMedicineNotification = (medication: Medication) => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Time for ${medication.name}`, {
        body: `Take ${medication.dosage} - ${medication.frequency}`,
        icon: '/favicon.ico',
        tag: medication.id,
      });
    }

    // Toast notification
    toast({
      title: (
        <div className="flex items-center space-x-2">
          <Pill className="h-5 w-5 text-primary" />
          <span>Medicine Reminder</span>
        </div>
      ) as any,
      description: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className="font-semibold">{medication.name}</span>
          </div>
          <p>Dosage: {medication.dosage}</p>
          <p>Frequency: {medication.frequency}</p>
          <p className="text-sm text-muted-foreground">
            Time: {medication.time_of_day}
          </p>
        </div>
      ) as any,
      duration: 10000,
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return { requestNotificationPermission };
};