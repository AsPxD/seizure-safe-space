-- Create education content table
CREATE TABLE public.education_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'article', 'video', 'tip'
  video_url TEXT,
  image_url TEXT,
  read_time_minutes INTEGER,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medication logs for tracking adherence
CREATE TABLE public.medication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medication_id UUID NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_time TIME NOT NULL,
  status TEXT NOT NULL, -- 'taken', 'missed', 'late'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency contacts table
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.education_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Education content policies (public read)
CREATE POLICY "Everyone can view education content" 
ON public.education_content 
FOR SELECT 
USING (true);

-- Medication logs policies
CREATE POLICY "Users can view their own medication logs" 
ON public.medication_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medication logs" 
ON public.medication_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication logs" 
ON public.medication_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medication logs" 
ON public.medication_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Emergency contacts policies
CREATE POLICY "Users can view their own emergency contacts" 
ON public.emergency_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emergency contacts" 
ON public.emergency_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts" 
ON public.emergency_contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts" 
ON public.emergency_contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_education_content_updated_at
BEFORE UPDATE ON public.education_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample education content
INSERT INTO public.education_content (title, content, category, featured, read_time_minutes) VALUES
('Understanding Seizure Types', 'Learn about different types of seizures including focal, generalized, and unknown onset seizures. Understanding your seizure type helps with treatment planning.', 'article', true, 5),
('Seizure First Aid', 'Essential steps to help someone during a seizure: Stay calm, keep them safe, time the seizure, turn them on their side, stay with them until they recover.', 'article', true, 3),
('Medication Adherence Tips', 'Taking medications consistently is crucial for seizure control. Set reminders, use pill organizers, and never stop suddenly without consulting your doctor.', 'article', false, 4),
('Recognizing Seizure Triggers', 'Common triggers include stress, lack of sleep, flashing lights, illness, and missed medications. Keeping a diary helps identify your personal triggers.', 'article', false, 6),
('Living with Epilepsy', 'A comprehensive guide to managing daily life with epilepsy, including work, relationships, and maintaining independence.', 'article', false, 8),
('Seizure Safety at Home', 'Learn how to make your home environment safer to reduce injury risk during seizures.', 'tip', false, 2);