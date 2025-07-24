import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Heart, 
  Clock, 
  User, 
  FileText,
  Navigation
} from 'lucide-react';

export default function Emergency() {
  const [sosPressed, setSosPressed] = useState(false);
  const [location, setLocation] = useState<string>('Locating...');

  const handleSOSPress = async () => {
    setSosPressed(true);
    
    // Mock location detection
    setTimeout(() => {
      setLocation('123 Main St, City, State 12345');
    }, 2000);

    // Mock emergency call
    toast({
      title: "Emergency Alert Sent",
      description: "Your emergency contacts have been notified. Help is on the way.",
      className: "animate-success",
    });

    // Reset after 5 seconds
    setTimeout(() => {
      setSosPressed(false);
    }, 5000);
  };

  const emergencyContacts = [
    { name: 'Emergency Services', number: '911', type: 'emergency' },
    { name: 'Dr. Smith', number: '(555) 123-4567', type: 'doctor' },
    { name: 'John Doe (Emergency Contact)', number: '(555) 987-6543', type: 'personal' },
  ];

  const emergencyInstructions = [
    {
      title: 'If someone is having a seizure:',
      steps: [
        'Stay calm and time the seizure',
        'Keep the person safe from injury',
        'Turn them on their side if possible',
        'Do NOT put anything in their mouth',
        'Call 911 if seizure lasts over 5 minutes',
      ]
    },
    {
      title: 'After a seizure:',
      steps: [
        'Stay with the person until fully alert',
        'Speak calmly and reassuringly',
        'Check for injuries',
        'Help them rest and recover',
      ]
    }
  ];

  const medicalInfo = [
    { label: 'Medical ID', value: 'Epilepsy Patient' },
    { label: 'Allergies', value: 'None known' },
    { label: 'Medications', value: 'See medication list' },
    { label: 'Emergency Contact', value: 'John Doe - (555) 987-6543' },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-emergency">Emergency</h1>
        <p className="text-muted-foreground">Quick access to emergency help and information</p>
      </div>

      {/* SOS Button */}
      <Card className="border-emergency/20">
        <CardContent className="p-8 text-center">
          <Button
            size="lg"
            onClick={handleSOSPress}
            disabled={sosPressed}
            className={`w-32 h-32 rounded-full text-xl font-bold ${
              sosPressed 
                ? 'bg-emergency/80 animate-pulse' 
                : 'bg-emergency hover:bg-emergency/90 animate-emergency-pulse'
            }`}
          >
            {sosPressed ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2" />
                <span>Calling...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <span>SOS</span>
              </div>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Press for immediate emergency assistance
          </p>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Current Location</p>
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
            <Button variant="outline" size="sm">
              <Navigation className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Emergency Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {contact.type === 'emergency' ? (
                    <AlertTriangle className="h-4 w-4 text-emergency" />
                  ) : contact.type === 'doctor' ? (
                    <Heart className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-accent" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.number}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${contact.number}`}>
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Medical Information</span>
          </CardTitle>
          <CardDescription>Important information for first responders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {medicalInfo.map((info, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium">{info.label}:</span>
              <span className="text-sm text-muted-foreground">{info.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Instructions */}
      <div className="space-y-4">
        {emergencyInstructions.map((instruction, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{instruction.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {instruction.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">{stepIndex + 1}</span>
                    </div>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}