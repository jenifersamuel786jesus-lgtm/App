import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Bell, Activity, FileText, Settings, LogOut, AlertTriangle, MapPin, Link as LinkIcon, QrCode, KeyRound } from 'lucide-react';
import { getCaregiverByProfileId, getLinkedPatients, getCaregiverAlerts, findPatientByLinkingCode, linkDevices } from '@/db/api';
import type { Caregiver, PatientWithProfile, AlertWithPatient } from '@/types/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QRCodeScanner from '@/components/ui/qrcodescanner';

export default function CaregiverDashboardPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [patients, setPatients] = useState<PatientWithProfile[]>([]);
  const [alerts, setAlerts] = useState<AlertWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkingCode, setLinkingCode] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadCaregiverData();
  }, [profile]);

  const loadCaregiverData = async () => {
    if (!profile) {
      console.log('❌ No profile found in loadCaregiverData');
      return;
    }
    
    console.log('📥 Loading caregiver data for profile:', profile.id);
    console.log('Profile details:', {
      username: profile.username,
      role: profile.role,
      device_mode: profile.device_mode
    });
    
    setLoading(true);
    
    // Retry mechanism for database replication lag
    let caregiverData = await getCaregiverByProfileId(profile.id);
    
    // If no data found and we haven't retried yet, wait and try again
    if (!caregiverData && retryCount < 3) {
      console.log(`⏳ No caregiver found, retrying (attempt ${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      caregiverData = await getCaregiverByProfileId(profile.id);
      setRetryCount(prev => prev + 1);
    }
    
    console.log('👤 Caregiver data result:', caregiverData);
    
    if (!caregiverData) {
      console.log('⚠️ No caregiver record found after retries, redirecting to setup');
      navigate('/caregiver/setup');
      return;
    }
    
    console.log('✅ Caregiver found:', caregiverData.full_name);
    setCaregiver(caregiverData);
    setRetryCount(0); // Reset retry count on success
    
    // Load linked patients and alerts
    console.log('📥 Loading linked patients and alerts...');
    const [patientsData, alertsData] = await Promise.all([
      getLinkedPatients(caregiverData.id),
      getCaregiverAlerts(caregiverData.id, 10),
    ]);
    
    console.log('✅ Loaded patients:', patientsData.length);
    console.log('✅ Loaded alerts:', alertsData.length);
    
    setPatients(patientsData);
    setAlerts(alertsData);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleLinkPatient = async () => {
    if (!linkingCode.trim() || linkingCode.length !== 8) {
      setLinkError('Please enter a valid 8-character linking code');
      return;
    }

    if (!caregiver) {
      setLinkError('Caregiver profile not found');
      return;
    }

    setLinkLoading(true);
    setLinkError('');

    try {
      // Find patient by linking code
      const patient = await findPatientByLinkingCode(linkingCode.toUpperCase());

      if (!patient) {
        setLinkError(`No patient found with code "${linkingCode}". Please check and try again.`);
        setLinkLoading(false);
        return;
      }

      // Link devices
      const linkResult = await linkDevices(patient.id, caregiver.id);

      if (!linkResult) {
        setLinkError('Failed to link devices. This patient may already be linked.');
        setLinkLoading(false);
        return;
      }

      // Success! Reload data and close dialog
      await loadCaregiverData();
      setLinkDialogOpen(false);
      setLinkingCode('');
      setLinkError('');
    } catch (err) {
      setLinkError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    setLinkLoading(false);
  };

  const handleQRScan = (code: string) => {
    setLinkingCode(code);
    setShowScanner(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-emergency" />;
      case 'safe_area_breach':
        return <MapPin className="w-5 h-5 text-warning" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertBadgeVariant = (status: string) => {
    switch (status) {
      case 'unread':
        return 'destructive';
      case 'read':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const unreadAlerts = alerts.filter(a => a.alert_status === 'unread').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-secondary" />
            <h1 className="text-xl font-bold">RemZy Caregiver</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/caregiver/settings')}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Welcome, {caregiver?.full_name}!</CardTitle>
                <CardDescription>
                  Monitoring {patients.length} {patients.length === 1 ? 'patient' : 'patients'}
                </CardDescription>
              </div>
              <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Link Patient
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Link to Patient Device</DialogTitle>
                    <DialogDescription>
                      Enter the 8-character linking code from the patient's device
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {linkError && (
                      <Alert variant="destructive">
                        <AlertDescription>{linkError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="link-code">Linking Code</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          id="link-code"
                          type="text"
                          placeholder="Enter 8-character code"
                          value={linkingCode}
                          onChange={(e) => setLinkingCode(e.target.value.toUpperCase())}
                          maxLength={8}
                          className="pl-10 font-mono tracking-wider uppercase"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 border-t border-border"></div>
                      <span className="text-sm text-muted-foreground">or</span>
                      <div className="flex-1 border-t border-border"></div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => setShowScanner(true)}
                    >
                      <QrCode className="w-5 h-5" />
                      Scan QR Code
                    </Button>
                    
                    <Button 
                      onClick={handleLinkPatient} 
                      className="w-full"
                      disabled={linkLoading || linkingCode.length !== 8}
                    >
                      {linkLoading ? 'Linking...' : 'Link Patient'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* QR Code Scanner Dialog */}
        {showScanner && (
          <QRCodeScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Linked Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">
                Active connections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/caregiver/patients')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Manage Patients</CardTitle>
                  <CardDescription>View and link patient devices</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/caregiver/alerts')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <CardTitle>View All Alerts</CardTitle>
                  <CardDescription>{unreadAlerts} unread notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/caregiver/patients')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <CardTitle>Activity Logs</CardTitle>
                  <CardDescription>View patient activity history</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/caregiver/patients')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Health Reports</CardTitle>
                  <CardDescription>View health metrics and trends</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Latest notifications from your patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  {getAlertIcon(alert.alert_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{alert.title}</p>
                      <Badge variant={getAlertBadgeVariant(alert.alert_status)} className="shrink-0">
                        {alert.alert_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {alerts.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/caregiver/alerts')}>
                  View All Alerts ({alerts.length})
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Linked Patients */}
        {patients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Linked Patients</CardTitle>
              <CardDescription>Patients you are monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {patients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="flex items-center gap-3 p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => navigate(`/caregiver/patient/${patient.id}`)}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{patient.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Linked {new Date(patient.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Patients Message */}
        {patients.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Linked Patients</CardTitle>
              <CardDescription>
                You haven't linked any patient devices yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/caregiver/patients')} className="w-full">
                Link Patient Device
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
