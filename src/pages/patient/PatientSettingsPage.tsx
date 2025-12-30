import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings as SettingsIcon, LogOut, User, Shield, Bell } from 'lucide-react';
import { getPatientByProfileId, getLinkedCaregivers } from '@/db/api';
import type { Patient, CaregiverWithProfile } from '@/types/types';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';

export default function PatientSettingsPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [caregivers, setCaregivers] = useState<CaregiverWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkingCode, setShowLinkingCode] = useState(false);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    const patientData = await getPatientByProfileId(profile.id);
    if (patientData) {
      setPatient(patientData);
      const caregiversData = await getLinkedCaregivers(patientData.id);
      setCaregivers(caregiversData);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        ) : (
          <>
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-xl font-semibold">{patient?.full_name || 'Not set'}</p>
                  </div>
                  {patient?.date_of_birth && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="text-xl font-semibold">
                        {new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="text-xl font-semibold">{profile?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Device Mode</p>
                    <p className="text-xl font-semibold">Patient Mode 🔒</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Linking Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Device Linking
                </CardTitle>
                <CardDescription>Share this code with your caregiver to connect</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setShowLinkingCode(!showLinkingCode)}
                  variant="outline"
                  className="w-full h-14"
                  size="lg"
                >
                  {showLinkingCode ? 'Hide' : 'Show'} Linking Code
                </Button>
                
                {showLinkingCode && patient?.linking_code && (
                  <div className="flex flex-col items-center gap-4 p-6 bg-muted rounded-lg">
                    <QRCodeDataUrl text={patient.linking_code} width={200} />
                    <div className="space-y-1 text-center">
                      <p className="text-sm text-muted-foreground">Linking Code:</p>
                      <p className="text-2xl font-mono font-bold tracking-wider">{patient.linking_code}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <p className="text-sm font-semibold mb-2">Connected Caregivers ({caregivers.length})</p>
                  {caregivers.length === 0 ? (
                    <p className="text-muted-foreground">No caregivers connected yet</p>
                  ) : (
                    <div className="space-y-2">
                      {caregivers.map((caregiver) => (
                        <div
                          key={caregiver.id}
                          className="flex items-center gap-3 p-3 border border-border rounded-lg"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{caregiver.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {caregiver.profile?.username}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold">Task Reminders</p>
                      <p className="text-sm text-muted-foreground">Get notified about upcoming tasks</p>
                    </div>
                    <div className="text-success font-semibold">Enabled</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold">AI Companion</p>
                      <p className="text-sm text-muted-foreground">Receive check-in messages</p>
                    </div>
                    <div className="text-success font-semibold">Enabled</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safe Area */}
            {(patient?.safe_area_lat && patient?.safe_area_lng) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Safe Area</CardTitle>
                  <CardDescription>Your designated safe zone</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    Location: {patient.safe_area_lat.toFixed(4)}, {patient.safe_area_lng.toFixed(4)}
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Radius: {patient.safe_area_radius} meters
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Sign Out */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-2xl">Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  className="w-full h-14"
                  size="lg"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
