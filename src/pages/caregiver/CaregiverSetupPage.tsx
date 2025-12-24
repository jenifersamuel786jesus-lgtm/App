import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, QrCode, KeyRound } from 'lucide-react';
import { createCaregiver, getCaregiverByProfileId, updateProfile, findPatientByLinkingCode, linkDevices } from '@/db/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CaregiverSetupPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    linking_code: '',
  });

  useEffect(() => {
    // Check if caregiver profile already exists
    const checkExistingCaregiver = async () => {
      if (profile) {
        const caregiver = await getCaregiverByProfileId(profile.id);
        if (caregiver) {
          navigate('/caregiver/dashboard', { replace: true });
        }
      }
    };
    checkExistingCaregiver();
  }, [profile, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNext = () => {
    if (step === 1 && formData.full_name) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (!profile) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Create caregiver record
      const caregiver = await createCaregiver({
        profile_id: profile.id,
        full_name: formData.full_name,
        device_id: crypto.randomUUID(),
      });
      
      if (!caregiver) {
        setError('Failed to create caregiver profile');
        setLoading(false);
        return;
      }
      
      // If linking code provided, link to patient
      if (formData.linking_code) {
        const patient = await findPatientByLinkingCode(formData.linking_code.toUpperCase());
        
        if (!patient) {
          setError('Invalid linking code. Please check and try again.');
          setLoading(false);
          return;
        }
        
        await linkDevices(patient.id, caregiver.id);
      }
      
      // Update role to caregiver
      await updateProfile(profile.id, { role: 'caregiver' });
      await refreshProfile();
      
      navigate('/caregiver/dashboard', { replace: true });
    } catch (err) {
      setError('An error occurred during setup');
      console.error(err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-secondary" />
            <CardTitle>Caregiver Setup</CardTitle>
          </div>
          <CardDescription>
            Let's set up your RemZy caregiver profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-base">What is your full name?</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="pl-10 text-lg h-14"
                  />
                </div>
              </div>
              
              <Button onClick={handleNext} className="w-full h-14 text-lg" disabled={!formData.full_name}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base">Link to Patient Device</Label>
                <p className="text-sm text-muted-foreground">
                  Enter the linking code from the patient's device to connect
                </p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="linking_code"
                      type="text"
                      placeholder="Enter 8-character code"
                      value={formData.linking_code}
                      onChange={(e) => handleInputChange('linking_code', e.target.value.toUpperCase())}
                      maxLength={8}
                      className="pl-10 text-lg h-14 font-mono tracking-wider uppercase"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-border"></div>
                    <span className="text-sm text-muted-foreground">or</span>
                    <div className="flex-1 border-t border-border"></div>
                  </div>
                  
                  <Button variant="outline" className="w-full h-14 gap-2" disabled>
                    <QrCode className="w-5 h-5" />
                    Scan QR Code (Coming Soon)
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  You can skip this step and link devices later from your dashboard
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12" disabled={loading}>
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1 h-12" disabled={loading}>
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
