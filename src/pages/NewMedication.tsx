import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  time_of_day: z.string().optional(),
  reminder_enabled: z.boolean(),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

export default function NewMedication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      dosage: '',
      frequency: '',
      time_of_day: '',
      reminder_enabled: true,
    },
  });

  const onSubmit = async (data: MedicationFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('medications')
        .insert({
          user_id: user.id,
          name: data.name,
          dosage: data.dosage,
          frequency: data.frequency,
          time_of_day: data.time_of_day || null,
          reminder_enabled: data.reminder_enabled,
          active: true,
        });

      if (error) throw error;

      toast({
        title: "Medication added",
        description: "Your medication has been added successfully.",
        className: "animate-success",
      });

      navigate('/medications');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding medication",
        description: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/medications')}
          className="animate-gentle"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add Medication</h1>
          <p className="text-muted-foreground">Add a new medication to your list</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medication Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Medication Name</Label>
              <Input
                id="name"
                placeholder="e.g. Keppra, Lamictal, Dilantin"
                {...form.register('name')}
                disabled={loading}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g. 500mg, 1 tablet, 2.5ml"
                {...form.register('dosage')}
                disabled={loading}
              />
              {form.formState.errors.dosage && (
                <p className="text-sm text-destructive">{form.formState.errors.dosage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={form.watch('frequency')}
                onValueChange={(value) => form.setValue('frequency', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How often do you take this?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once daily">Once daily</SelectItem>
                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                  <SelectItem value="Every other day">Every other day</SelectItem>
                  <SelectItem value="As needed">As needed</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.frequency && (
                <p className="text-sm text-destructive">{form.formState.errors.frequency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Preferred Time (Optional)</Label>
              <Input
                id="time"
                type="time"
                {...form.register('time_of_day')}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Set a preferred time for daily medications
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="reminder_enabled" className="text-sm font-medium">
                  Enable Reminders
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notifications when it's time to take this medication
                </p>
              </div>
              <Switch
                id="reminder_enabled"
                checked={form.watch('reminder_enabled')}
                onCheckedChange={(checked) => form.setValue('reminder_enabled', checked)}
                disabled={loading}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/medications')}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 animate-gentle"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Add Medication
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}