import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { Heart, User, Calendar, MapPin } from 'lucide-react';
import { createPatient, getPatientByProfileId, updateProfile } from '@/db/api';

export default function PatientSetupPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [linkingCode, setLinkingCode] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    safe_area_lat: '',
    safe_area_lng: '',
    safe_area_radius: '500',
  });

  useEffect(() => {
    // Check if patient profile already exists
    const checkExistingPatient = async () => {
      if (profile) {
        const patient = await getPatientByProfileId(profile.id);
        if (patient) {
          navigate('/patient/dashboard', { replace: true });
        }
      }
    };
    checkExistingPatient();
  }, [profile, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && formData.full_name) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleComplete = async () => {
    if (!profile) {
      setError('No profile found. Please sign in again.');
      return;
    }
    
    if (!formData.full_name.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Creating patient with profile_id:', profile.id);
      console.log('Full name:', formData.full_name);
      
      // Create patient record
      const patient = await createPatient({
        profile_id: profile.id,
        full_name: formData.full_name.trim(),
        date_of_birth: formData.date_of_birth || null,
        safe_area_lat: formData.safe_area_lat ? parseFloat(formData.safe_area_lat) : null,
        safe_area_lng: formData.safe_area_lng ? parseFloat(formData.safe_area_lng) : null,
        safe_area_radius: parseInt(formData.safe_area_radius),
        device_id: crypto.randomUUID(),
      });
      
      console.log('Patient creation result:', patient);
      
      if (!patient) {
        setError('Failed to create patient profile. Please check your connection and try again.');
        setLoading(false);
        return;
      }
      
      setLinkingCode(patient.linking_code || '');
      setStep(4);
    } catch (err) {
      console.error('Error in handleComplete:', err);
      setError('An error occurred during setup. Please try again.');
    }
    
    setLoading(false);
  };

  const handleFinish = async () => {
    if (!profile) return;
    
    // Update role to patient
    await updateProfile(profile.id, { role: 'patient' });
    await refreshProfile();
    
    navigate('/patient/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-primary" />
            <CardTitle>Patient Setup</CardTitle>
          </div>
          <CardDescription>
            Let's set up your RemZy patient profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                <Label htmlFor="date_of_birth" className="text-base">Date of Birth (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
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
                <Label className="text-base">Safe Area Location (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Set your home location to receive alerts if you wander too far
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="safe_area_lat" className="text-sm">Latitude</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="safe_area_lat"
                        type="number"
                        step="any"
                        placeholder="e.g., 37.7749"
                        value={formData.safe_area_lat}
                        onChange={(e) => handleInputChange('safe_area_lat', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="safe_area_lng" className="text-sm">Longitude</Label>
                    <Input
                      id="safe_area_lng"
                      type="number"
                      step="any"
                      placeholder="e.g., -122.4194"
                      value={formData.safe_area_lng}
                      onChange={(e) => handleInputChange('safe_area_lng', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="safe_area_radius" className="text-sm">Safe Radius (meters)</Label>
                  <Input
                    id="safe_area_radius"
                    type="number"
                    value={formData.safe_area_radius}
                    onChange={(e) => handleInputChange('safe_area_radius', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1 h-12">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Review Your Information</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p><strong>Name:</strong> {formData.full_name}</p>
                  {formData.date_of_birth && (
                    <p><strong>Date of Birth:</strong> {formData.date_of_birth}</p>
                  )}
                  {formData.safe_area_lat && formData.safe_area_lng && (
                    <p><strong>Safe Area:</strong> {formData.safe_area_lat}, {formData.safe_area_lng} ({formData.safe_area_radius}m radius)</p>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12" disabled={loading}>
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1 h-12" disabled={loading}>
                  {loading ? 'Creating Profile...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Setup Complete!</h3>
                <p className="text-muted-foreground">
                  Share this QR code or linking code with your caregiver to connect your devices
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-4 p-6 bg-muted rounded-lg">
                <QRCodeDataUrl text={linkingCode} width={200} />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Linking Code:</p>
                  <p className="text-2xl font-mono font-bold tracking-wider">{linkingCode}</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                You can find this code later in your settings
              </p>
              
              <Button onClick={handleFinish} className="w-full h-14 text-lg">
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
