import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, ArrowLeft, Phone, MapPin, Clock } from 'lucide-react';
import { getPatientByProfileId, createAlert, getLinkedCaregivers } from '@/db/api';
import type { Patient } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { useWhisper } from '@/hooks/use-whisper';

export default function PatientEmergencyPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { whisper } = useWhisper();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadData();
    getLocation();
  }, [profile]);

  useEffect(() => {
    // Proactive guidance when emergency page loads
    if (patient && !loading) {
      setTimeout(() => {
        whisper(`This is the emergency help page. Press the large red button only if you need immediate help. Your caregivers will be notified right away.`);
      }, 1500);
    }
  }, [patient, loading]);

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    const patientData = await getPatientByProfileId(profile.id);
    if (patientData) {
      setPatient(patientData);
    }
    setLoading(false);
  };

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleEmergencyClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmEmergency = async () => {
    if (!patient) return;

    setSending(true);
    setShowConfirm(false);

    try {
      // Get all linked caregivers
      const caregivers = await getLinkedCaregivers(patient.id);

      // Create emergency alert for each caregiver
      const alertPromises = caregivers.map((caregiver) =>
        createAlert({
          patient_id: patient.id,
          alert_type: 'emergency',
          title: 'Emergency Alert',
          message: `${patient.full_name} has triggered an emergency alert!`,
          alert_status: 'unread',
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
          metadata: { caregiver_id: caregiver.id },
          created_at: new Date().toISOString(),
        })
      );

      await Promise.all(alertPromises);

      setSending(false);
      setShowSuccess(true);

      // Whisper confirmation
      whisper(`Emergency alert sent to ${caregivers.length} caregiver${caregivers.length > 1 ? 's' : ''}. Help is on the way.`);

      toast({
        title: 'Emergency Alert Sent',
        description: `Alert sent to ${caregivers.length} caregiver(s)`,
      });

      // Auto-close success dialog and return to dashboard after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/patient/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      setSending(false);
      toast({
        title: 'Error',
        description: 'Failed to send emergency alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <h1 className="text-xl font-bold">Emergency Help</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Warning Card */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Emergency Assistance
            </CardTitle>
            <CardDescription className="text-base">
              Press the button below to send an emergency alert to all your caregivers
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Emergency Button */}
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <Button
            onClick={handleEmergencyClick}
            disabled={sending}
            size="lg"
            className="w-64 h-64 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-2xl hover:shadow-destructive/50 transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="w-24 h-24" />
              <span className="text-3xl font-bold">EMERGENCY</span>
              <span className="text-lg">Tap for Help</span>
            </div>
          </Button>

          <p className="text-center text-muted-foreground max-w-md">
            This will immediately notify all your caregivers that you need help. They will receive your location and can respond quickly.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Instant Notification</h3>
                  <p className="text-sm text-muted-foreground">
                    All your linked caregivers will be notified immediately
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Location Sharing</h3>
                  <p className="text-sm text-muted-foreground">
                    Your current location will be shared with caregivers
                    {location && (
                      <span className="block mt-1 text-xs text-success">
                        ✓ Location available
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Quick Response</h3>
                  <p className="text-sm text-muted-foreground">
                    Caregivers can see your alert and respond right away
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <Button
          onClick={() => navigate('/patient/dashboard')}
          variant="outline"
          size="lg"
          className="w-full h-14"
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              Confirm Emergency Alert
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to send an emergency alert? This will notify all your caregivers immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEmergency}
              disabled={sending}
              className="flex-1 h-12 bg-destructive hover:bg-destructive/90"
            >
              {sending ? 'Sending...' : 'Send Alert'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-success flex items-center gap-2">
              ✓ Alert Sent Successfully
            </DialogTitle>
            <DialogDescription className="text-base">
              Your caregivers have been notified and will respond as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-success" />
            </div>
            <p className="text-muted-foreground">
              Help is on the way. Stay calm and wait for assistance.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
