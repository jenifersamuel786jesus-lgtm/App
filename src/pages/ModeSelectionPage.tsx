import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, User, LogOut } from 'lucide-react';
import { updateProfile } from '@/db/api';

export default function ModeSelectionPage() {
  const { profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If device mode is already locked, redirect to appropriate page
    if (profile?.device_mode === 'patient') {
      navigate('/patient/dashboard', { replace: true });
    } else if (profile?.device_mode === 'caregiver') {
      navigate('/caregiver/dashboard', { replace: true });
    }
  }, [profile, navigate]);

  const handleModeSelection = async (mode: 'patient' | 'caregiver') => {
    if (!profile) return;
    
    setLoading(true);
    
    // Update profile with selected device mode
    await updateProfile(profile.id, { device_mode: mode });
    await refreshProfile();
    
    // Navigate to appropriate setup page
    if (mode === 'patient') {
      navigate('/patient/setup');
    } else {
      navigate('/caregiver/setup');
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">RemZy</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Welcome, {profile?.username}! Please select your device mode.
          </p>
          <p className="text-sm text-muted-foreground">
            This choice will lock your device to the selected mode for security.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary" onClick={() => !loading && handleModeSelection('patient')}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Patient Mode</CardTitle>
              <CardDescription>For the person receiving care</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>AI companion for memory assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Face recognition and reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Task management and alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Emergency assistance button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Simple, large-button interface</span>
                </li>
              </ul>
              <Button className="w-full mt-4" disabled={loading} onClick={(e) => {
                e.stopPropagation();
                handleModeSelection('patient');
              }}>
                {loading ? 'Setting up...' : 'Select Patient Mode'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-secondary" onClick={() => !loading && handleModeSelection('caregiver')}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Caregiver Mode</CardTitle>
              <CardDescription>For family members and caregivers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Real-time patient monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Instant alerts and notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Activity logs and reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Link multiple patient devices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Comprehensive dashboard</span>
                </li>
              </ul>
              <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90" disabled={loading} onClick={(e) => {
                e.stopPropagation();
                handleModeSelection('caregiver');
              }}>
                {loading ? 'Setting up...' : 'Select Caregiver Mode'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
