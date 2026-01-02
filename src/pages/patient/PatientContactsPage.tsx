import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Users, UserPlus, Camera, Upload, X, Trash2 } from 'lucide-react';
import { getPatientByProfileId, getKnownFaces, createKnownFace, deleteKnownFace } from '@/db/api';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newContact, setNewContact] = useState({
    person_name: '',
    relationship: '',
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotoUrl(result);
      toast({
        title: 'Photo Added',
        description: 'Photo uploaded successfully',
      });
    };
    reader.onerror = () => {
      toast({
        title: 'Upload Failed',
        description: 'Could not read the image file',
        variant: 'destructive',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    
    console.log('🗑️ Deleting contact:', contactToDelete);
    const success = await deleteKnownFace(contactToDelete);
    
    if (success) {
      toast({
        title: 'Contact Deleted',
        description: 'Contact has been removed successfully.',
      });
      console.log('✅ Contact deleted successfully');
      loadData();
    } else {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete contact. Please try again.',
        variant: 'destructive',
      });
      console.error('❌ Failed to delete contact');
    }
    
    setDeleteDialogOpen(false);
    setContactToDelete(null);
  };

  const openDeleteDialog = (contactId: string) => {
    setContactToDelete(contactId);
    setDeleteDialogOpen(true);
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
      face_encoding: null,
      photo_url: photoUrl,
    });

    if (contact) {
      toast({
        title: 'Contact Added',
        description: `${newContact.person_name} has been added to your contacts`,
      });
      setDialogOpen(false);
      setNewContact({ person_name: '', relationship: '' });
      setPhotoUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add New Contact</DialogTitle>
                <DialogDescription className="text-base">
                  Save information about someone you know
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Photo Upload Section */}
                <div className="space-y-3">
                  <Label className="text-base">Photo (Optional)</Label>
                  <div className="flex flex-col items-center gap-3">
                    {photoUrl ? (
                      <div className="relative">
                        <img 
                          src={photoUrl} 
                          alt="Contact photo" 
                          className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 rounded-full w-8 h-8"
                          onClick={handleRemovePhoto}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-muted border-4 border-dashed border-border flex items-center justify-center">
                        <Camera className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <Button
                      type="button"
                      variant={photoUrl ? "outline" : "default"}
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {photoUrl ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="person_name" className="text-base">Name *</Label>
                  <Input
                    id="person_name"
                    value={newContact.person_name}
                    onChange={(e) => setNewContact({ ...newContact, person_name: e.target.value })}
                    placeholder="John Smith"
                    className="text-lg h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship" className="text-base">Relationship</Label>
                  <Input
                    id="relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    placeholder="Friend, Doctor, Neighbor, etc."
                    className="text-lg h-12"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setDialogOpen(false);
                      setNewContact({ person_name: '', relationship: '' });
                      setPhotoUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }} 
                    className="flex-1 h-12"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateContact} 
                    className="flex-1 h-12"
                    disabled={!newContact.person_name.trim()}
                  >
                    Add Contact
                  </Button>
                </div>
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
                    {contact.photo_url ? (
                      <img 
                        src={contact.photo_url} 
                        alt={contact.person_name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-primary">
                          {getInitials(contact.person_name)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{contact.person_name}</CardTitle>
                      {contact.relationship && (
                        <CardDescription className="text-lg mt-1">
                          {contact.relationship}
                        </CardDescription>
                      )}
                      <p className="text-sm text-muted-foreground mt-3">
                        Added {new Date(contact.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Button
                      onClick={() => openDeleteDialog(contact.id)}
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This will remove their face recognition data and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
