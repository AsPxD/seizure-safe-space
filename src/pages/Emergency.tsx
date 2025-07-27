import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Heart, 
  Clock, 
  User, 
  FileText,
  Navigation,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
}

export default function Emergency() {
  const { user } = useAuth();
  const [sosPressed, setSosPressed] = useState(false);
  const [location, setLocation] = useState<string>('Locating...');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    is_primary: false
  });

  useEffect(() => {
    if (user) {
      loadEmergencyContacts();
    }
  }, [user]);

  const loadEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('is_primary', { ascending: false })
        .order('created_at');

      if (error) throw error;
      setEmergencyContacts(data || []);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load emergency contacts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveContact = async () => {
    if (!user) return;

    try {
      if (editingContact) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update({
            name: formData.name,
            phone: formData.phone,
            relationship: formData.relationship,
            is_primary: formData.is_primary,
          })
          .eq('id', editingContact.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Emergency contact updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({
            user_id: user.id,
            name: formData.name,
            phone: formData.phone,
            relationship: formData.relationship,
            is_primary: formData.is_primary,
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Emergency contact added successfully.",
        });
      }

      setIsDialogOpen(false);
      setEditingContact(null);
      setFormData({ name: '', phone: '', relationship: '', is_primary: false });
      loadEmergencyContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "Failed to save emergency contact.",
        variant: "destructive",
      });
    }
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      is_primary: contact.is_primary,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Emergency contact deleted successfully.",
      });
      
      loadEmergencyContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete emergency contact.",
        variant: "destructive",
      });
    }
  };

  const getContactIcon = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'emergency':
      case 'emergency services':
        return <AlertTriangle className="h-4 w-4 text-emergency" />;
      case 'doctor':
      case 'primary doctor':
        return <Heart className="h-4 w-4 text-primary" />;
      default:
        return <User className="h-4 w-4 text-accent" />;
    }
  };

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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Emergency Contacts</span>
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingContact(null);
                    setFormData({ name: '', phone: '', relationship: '', is_primary: false });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Emergency Services">Emergency Services</SelectItem>
                        <SelectItem value="Primary Doctor">Primary Doctor</SelectItem>
                        <SelectItem value="Family Member">Family Member</SelectItem>
                        <SelectItem value="Friend">Friend</SelectItem>
                        <SelectItem value="Caregiver">Caregiver</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="primary"
                      type="checkbox"
                      checked={formData.is_primary}
                      onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                    />
                    <Label htmlFor="primary">Primary emergency contact</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveContact}>
                      {editingContact ? 'Update' : 'Add'} Contact
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading contacts...</div>
            </div>
          ) : emergencyContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No emergency contacts added yet.
            </div>
          ) : (
            emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getContactIcon(contact.relationship)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">{contact.name}</p>
                      {contact.is_primary && (
                        <Badge variant="secondary" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                    <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${contact.phone}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditContact(contact)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
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