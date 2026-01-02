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
import QRCodeScanner from '@/components/ui/qrcodescanner';

export default function CaregiverSetupPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
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

  const handleQRScan = (code: string) => {
    console.log('QR code scanned:', code);
    console.log('QR code length:', code.length);
    setShowScanner(false);
    
    // Extract linking code from QR code (it should be the 8-character code)
    const linkingCode = code.trim().toUpperCase();
    console.log('Processed linking code:', linkingCode);
    console.log('Processed code length:', linkingCode.length);
    
    // Validate it's 8 characters (alphanumeric only)
    const isValid = /^[A-Z0-9]{8}$/.test(linkingCode);
    
    if (isValid) {
      setFormData(prev => ({ ...prev, linking_code: linkingCode }));
      setError('');
      console.log('Valid linking code set:', linkingCode);
    } else {
      setError(`Invalid QR code format. Expected 8 characters, got ${linkingCode.length}. Code: ${linkingCode}`);
      console.error('Invalid QR code:', { code, linkingCode, length: linkingCode.length });
    }
  };

  const handleComplete = async () => {
    if (!profile) {
      setError('No profile found. Please log in again.');
      return;
    }
    
    if (!formData.full_name.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Creating caregiver with profile_id:', profile.id);
      console.log('Full name:', formData.full_name);
      
      // Create caregiver record
      const caregiver = await createCaregiver({
        profile_id: profile.id,
        full_name: formData.full_name.trim(),
        phone: formData.phone?.trim() || null,
      });
      
      console.log('Caregiver creation result:', caregiver);
      
      if (!caregiver) {
        setError('Failed to create caregiver profile. Please check your connection and try again.');
        setLoading(false);
        return;
      }
      
      // If linking code provided, link to patient
      if (formData.linking_code) {
        console.log('Attempting to link with code:', formData.linking_code);
        const patient = await findPatientByLinkingCode(formData.linking_code.toUpperCase());
        
        console.log('Patient found:', patient);
        
        if (!patient) {
          setError('Invalid linking code. No patient found with this code. Please check and try again.');
          setLoading(false);
          return;
        }
        
        console.log('Linking devices - Patient ID:', patient.id, 'Caregiver ID:', caregiver.id);
        const linkResult = await linkDevices(patient.id, caregiver.id);
        console.log('Link result:', linkResult);
        
        if (!linkResult) {
          setError('Failed to link devices. Please try again.');
          setLoading(false);
          return;
        }
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
      {!profile ? (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
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
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="text-lg h-14"
                />
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
                  
                  <Button 
                    variant="outline" 
                    className="w-full h-14 gap-2"
                    onClick={() => setShowScanner(true)}
                  >
                    <QrCode className="w-5 h-5" />
                    Scan QR Code
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
      )}
      
      {/* QR Code Scanner Modal */}
      {showScanner && (
        <QRCodeScanner 
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
