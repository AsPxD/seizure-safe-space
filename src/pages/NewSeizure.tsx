import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

const seizureSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  seizureType: z.string().min(1, 'Seizure type is required'),
  duration: z.string().optional(),
  triggers: z.string().optional(),
  notes: z.string().optional(),
});

type SeizureFormData = z.infer<typeof seizureSchema>;

const seizureTypes = [
  'Tonic-Clonic',
  'Focal',
  'Absence',
  'Myoclonic',
  'Atonic',
  'Other'
];

export default function NewSeizure() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<SeizureFormData>({
    resolver: zodResolver(seizureSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      seizureType: '',
      duration: '',
      triggers: '',
      notes: '',
    },
  });

  const onSubmit = async (data: SeizureFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const dateTime = new Date(`${data.date}T${data.time}`).toISOString();
      
      const { error } = await supabase
        .from('seizures')
        .insert({
          user_id: user.id,
          date_time: dateTime,
          seizure_type: data.seizureType,
          duration_minutes: data.duration ? parseInt(data.duration) : null,
          triggers: data.triggers || null,
          notes: data.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Seizure recorded",
        description: "Your seizure event has been saved successfully.",
        className: "animate-success",
      });

      navigate('/diary');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving seizure",
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
          onClick={() => navigate('/diary')}
          className="animate-gentle"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Record Seizure</h1>
          <p className="text-muted-foreground">Log details about your seizure event</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seizure Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register('date')}
                  disabled={loading}
                />
                {form.formState.errors.date && (
                  <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  {...form.register('time')}
                  disabled={loading}
                />
                {form.formState.errors.time && (
                  <p className="text-sm text-destructive">{form.formState.errors.time.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seizureType">Seizure Type</Label>
              <Select
                value={form.watch('seizureType')}
                onValueChange={(value) => form.setValue('seizureType', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select seizure type" />
                </SelectTrigger>
                <SelectContent>
                  {seizureTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.seizureType && (
                <p className="text-sm text-destructive">{form.formState.errors.seizureType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g. 2"
                {...form.register('duration')}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggers">Possible Triggers</Label>
              <Input
                id="triggers"
                placeholder="e.g. lack of sleep, stress, flashing lights"
                {...form.register('triggers')}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details about the seizure..."
                rows={4}
                {...form.register('notes')}
                disabled={loading}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/diary')}
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
                Save Seizure
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}