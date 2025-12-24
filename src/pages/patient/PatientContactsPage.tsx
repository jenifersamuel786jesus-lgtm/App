import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Users, UserPlus } from 'lucide-react';
import { getPatientByProfileId, getKnownFaces, createKnownFace } from '@/db/api';
import type { Patient, KnownFace } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function PatientContactsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [contacts, setContacts] = useState<KnownFace[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    person_name: '',
    relationship: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    const patientData = await getPatientByProfileId(profile.id);
    if (patientData) {
      setPatient(patientData);
      const contactsData = await getKnownFaces(patientData.id);
      setContacts(contactsData);
    }
    setLoading(false);
  };

  const handleCreateContact = async () => {
    if (!patient || !newContact.person_name) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the person\'s name',
        variant: 'destructive',
      });
      return;
    }

    const contact = await createKnownFace({
      patient_id: patient.id,
      person_name: newContact.person_name,
      relationship: newContact.relationship || null,
      notes: newContact.notes || null,
      face_encoding: null,
    });

    if (contact) {
      toast({
        title: 'Contact Added',
        description: `${newContact.person_name} has been added to your contacts`,
      });
      setDialogOpen(false);
      setNewContact({ person_name: '', relationship: '', notes: '' });
      loadData();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">My Contacts</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-14 px-6">
                <Plus className="w-5 h-5 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>Save information about someone you know</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="person_name">Name *</Label>
                  <Input
                    id="person_name"
                    value={newContact.person_name}
                    onChange={(e) => setNewContact({ ...newContact, person_name: e.target.value })}
                    placeholder="John Smith"
                    className="text-lg h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    placeholder="Friend, Doctor, Neighbor, etc."
                    className="text-lg h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                    placeholder="Any helpful information to remember..."
                    className="text-lg min-h-24"
                  />
                </div>
                <Button onClick={handleCreateContact} className="w-full h-12" size="lg">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Contacts Yet</h3>
              <p className="text-muted-foreground mb-6">
                Add people you know so you can remember them better
              </p>
              <Button onClick={() => setDialogOpen(true)} size="lg" className="h-14 px-8">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-primary">
                        {getInitials(contact.person_name)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{contact.person_name}</CardTitle>
                      {contact.relationship && (
                        <CardDescription className="text-lg mt-1">
                          {contact.relationship}
                        </CardDescription>
                      )}
                      {contact.notes && (
                        <p className="text-muted-foreground mt-3 text-base">{contact.notes}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-3">
                        Added {new Date(contact.added_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
