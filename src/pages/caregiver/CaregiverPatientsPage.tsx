import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Users, UserPlus, QrCode, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getCaregiverByProfileId, getLinkedPatients, findPatientByLinkingCode, linkDevices } from '@/db/api';
import type { Caregiver, PatientWithProfile } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function CaregiverPatientsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [patients, setPatients] = useState<PatientWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkingCode, setLinkingCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    const caregiverData = await getCaregiverByProfileId(profile.id);
    if (caregiverData) {
      setCaregiver(caregiverData);
      const patientsData = await getLinkedPatients(caregiverData.id);
      setPatients(patientsData);
    }
    setLoading(false);
  };

  const handleLinkPatient = async () => {
    console.log('🔗 handleLinkPatient called');
    console.log('Caregiver:', caregiver?.id, caregiver?.full_name);
    console.log('Linking code input:', linkingCode);
    console.log('Linking code trimmed:', linkingCode.trim());
    console.log('Linking code uppercase:', linkingCode.toUpperCase().trim());
    
    if (!caregiver || !linkingCode.trim()) {
      setLinkError('Please enter a linking code');
      console.log('❌ Validation failed: missing caregiver or linking code');
      return;
    }

    setLinking(true);
    setLinkError('');

    try {
      // Find patient by linking code
      const normalizedCode = linkingCode.toUpperCase().trim();
      console.log('🔍 Searching for patient with code:', normalizedCode);
      
      const patient = await findPatientByLinkingCode(normalizedCode);
      
      if (!patient) {
        console.log('❌ No patient found with code:', normalizedCode);
        setLinkError('Invalid linking code. Please check and try again.');
        setLinking(false);
        return;
      }

      console.log('✅ Patient found:', patient.id, patient.full_name);

      // Check if already linked
      const alreadyLinked = patients.some(p => p.id === patient.id);
      if (alreadyLinked) {
        console.log('⚠️ Patient already linked');
        setLinkError('This patient is already linked to your account.');
        setLinking(false);
        return;
      }

      console.log('🔗 Linking devices...');
      // Link devices
      const link = await linkDevices(patient.id, caregiver.id);
      
      if (link) {
        console.log('✅ Devices linked successfully');
        toast({
          title: 'Patient Linked Successfully',
          description: `${patient.full_name} has been added to your patients list.`,
        });
        setDialogOpen(false);
        setLinkingCode('');
        setLinkError('');
        loadData(); // Reload patients list
      } else {
        console.log('❌ Failed to link devices');
        setLinkError('Failed to link patient. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error linking patient:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      setLinkError('An error occurred while linking. Please try again.');
    }

    setLinking(false);
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
    <div className="min-h-screen bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/caregiver/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Users className="w-6 h-6 text-secondary" />
            <h1 className="text-xl font-bold">Manage Patients</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-14 px-6">
                <Plus className="w-5 h-5 mr-2" />
                Link Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">Link New Patient</DialogTitle>
                <DialogDescription className="text-base">
                  Enter the linking code from the patient's device to establish a connection.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-secondary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linking_code" className="text-base">Linking Code *</Label>
                  <Input
                    id="linking_code"
                    value={linkingCode}
                    onChange={(e) => {
                      setLinkingCode(e.target.value.toUpperCase());
                      setLinkError('');
                    }}
                    placeholder="Enter 8-character code"
                    className="text-lg h-12 text-center font-mono tracking-wider"
                    maxLength={8}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    The patient will see this code on their setup screen
                  </p>
                </div>

                {linkError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{linkError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setDialogOpen(false);
                      setLinkingCode('');
                      setLinkError('');
                    }} 
                    className="flex-1 h-12"
                    disabled={linking}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleLinkPatient} 
                    className="flex-1 h-12"
                    disabled={!linkingCode.trim() || linking}
                  >
                    {linking ? 'Linking...' : 'Link Patient'}
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Patients Linked</h3>
              <p className="text-muted-foreground mb-6">
                Link a patient device to start monitoring and providing care
              </p>
              <Button onClick={() => setDialogOpen(true)} size="lg" className="h-14 px-8">
                <Plus className="w-5 h-5 mr-2" />
                Link Your First Patient
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                {patients.length} {patients.length === 1 ? 'patient' : 'patients'} linked
              </p>
            </div>
            
            <div className="grid gap-4">
              {patients.map((patient) => (
                <Card 
                  key={patient.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/caregiver/patient/${patient.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-secondary">
                          {getInitials(patient.full_name)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-2xl">{patient.full_name}</CardTitle>
                            {patient.date_of_birth && (
                              <CardDescription className="text-base mt-1">
                                Born {new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Active</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">
                          Linked {new Date(patient.created_at).toLocaleDateString('en-US', {
                            month: 'short',
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
          </div>
        )}
      </div>
    </div>
  );
}
