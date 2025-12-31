import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle, CheckSquare, Users, AlertCircle, Activity, LogOut, Settings, Camera, Volume2, VolumeX } from 'lucide-react';
import { getPatientByProfileId, getTasks, getKnownFaces, getHealthMetrics } from '@/db/api';
import type { Patient, Task, KnownFace, HealthMetric } from '@/types/types';
import { useWhisper } from '@/hooks/use-whisper';
import { useTaskReminders } from '@/hooks/use-task-reminders';

export default function PatientDashboardPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { whisper, isEnabled: audioEnabled, setIsEnabled: setAudioEnabled } = useWhisper();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [knownFaces, setKnownFaces] = useState<KnownFace[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  // Enable automatic task reminders
  useTaskReminders({ 
    tasks, 
    enabled: true,
    reminderMinutesBefore: 5 // Remind 5 minutes before task
  });

  useEffect(() => {
    loadPatientData();
  }, [profile]);

  useEffect(() => {
    // Welcome whisper when dashboard loads
    if (patient && !loading) {
      const greeting = getGreeting();
      const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Initial welcome with date and time
      whisper(`${greeting}, ${patient.full_name}. Today is ${today}. Welcome to your dashboard.`);
      
      // Proactive guidance after 5 seconds
      setTimeout(() => {
        if (tasks.length > 0) {
          whisper(`You have ${tasks.length} task${tasks.length > 1 ? 's' : ''} for today. Would you like to check them?`);
        } else {
          whisper(`You can chat with your AI companion, check your contacts, or track your health. Just tap any card to get started.`);
        }
      }, 5000);
      
      // Periodic reminders every 5 minutes
      const reminderInterval = setInterval(() => {
        provideProactiveGuidance();
      }, 300000); // 5 minutes
      
      return () => clearInterval(reminderInterval);
    }
  }, [patient, loading, tasks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const provideProactiveGuidance = () => {
    if (!audioEnabled) return;
    
    const hour = new Date().getHours();
    const guidanceMessages: string[] = [];
    
    // Time-based reminders
    if (hour >= 8 && hour < 9) {
      guidanceMessages.push("It's morning time. Have you had breakfast?");
    } else if (hour >= 12 && hour < 13) {
      guidanceMessages.push("It's lunchtime. Remember to eat something.");
    } else if (hour >= 18 && hour < 19) {
      guidanceMessages.push("It's evening time. Have you had dinner?");
    }
    
    // Task reminders
    if (tasks.length > 0) {
      const pendingTasks = tasks.filter(t => t.status === 'pending');
      if (pendingTasks.length > 0) {
        guidanceMessages.push(`You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''}. Would you like to check them?`);
      }
    }
    
    // Health check reminder
    if (healthMetrics.length === 0 || 
        (healthMetrics.length > 0 && 
         new Date().getTime() - new Date(healthMetrics[0].recorded_at).getTime() > 86400000)) {
      guidanceMessages.push("Remember to track your health today.");
    }
    
    // General orientation
    guidanceMessages.push(`If you need help, you can ask your AI companion anything.`);
    guidanceMessages.push(`You can check who you've met recently in your contacts.`);
    
    // Pick a random guidance message
    if (guidanceMessages.length > 0) {
      const randomMessage = guidanceMessages[Math.floor(Math.random() * guidanceMessages.length)];
      whisper(randomMessage);
    }
  };

  const loadPatientData = async () => {
    if (!profile) return;
    
    setLoading(true);
    const patientData = await getPatientByProfileId(profile.id);
    
    if (!patientData) {
      navigate('/patient/setup');
      return;
    }
    
    setPatient(patientData);
    
    // Load related data
    const [tasksData, facesData, metricsData] = await Promise.all([
      getTasks(patientData.id, 'pending'),
      getKnownFaces(patientData.id),
      getHealthMetrics(patientData.id, 1),
    ]);
    
    setTasks(tasksData);
    setKnownFaces(facesData);
    setHealthMetrics(metricsData);
    setLoading(false);
  };

  const handleEmergency = () => {
    whisper('Opening emergency help');
    navigate('/patient/emergency');
  };

  const handleLogout = async () => {
    whisper('Logging out. Goodbye!');
    await signOut();
    navigate('/login');
  };

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    if (newState) {
      whisper('Audio guidance enabled');
    }
  };

  const navigateWithWhisper = (path: string, pageName: string) => {
    whisper(`Opening ${pageName}`);
    setTimeout(() => navigate(path), 300); // Small delay for whisper to start
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const latestMetric = healthMetrics[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">RemZy</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleAudio}
              title={audioEnabled ? 'Disable audio guidance' : 'Enable audio guidance'}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/patient/settings')}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Hello, {patient?.full_name}! 👋</CardTitle>
            <CardDescription className="text-base">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Emergency Button */}
        <Button 
          onClick={handleEmergency}
          className="w-full h-20 text-xl font-bold bg-emergency hover:bg-emergency/90 text-emergency-foreground"
        >
          <AlertCircle className="w-8 h-8 mr-3" />
          Emergency Help
        </Button>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateWithWhisper('/patient/ai-companion', 'AI Companion')}>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-lg">AI Companion</CardTitle>
              <CardDescription className="text-sm">Chat and get help</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateWithWhisper('/patient/tasks', 'My Tasks')}>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                  <CheckSquare className="w-8 h-8 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-lg">My Tasks</CardTitle>
              <CardDescription className="text-sm">
                {tasks.length} pending
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateWithWhisper('/patient/contacts', 'My Contacts')}>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-lg">My Contacts</CardTitle>
              <CardDescription className="text-sm">
                {knownFaces.length} saved
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateWithWhisper('/patient/health', 'Health Tracking')}>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-lg">Health</CardTitle>
              <CardDescription className="text-sm">
                {latestMetric ? `${latestMetric.heart_rate} bpm` : 'No data'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateWithWhisper('/patient/face-recognition', 'Face Recognition')}>
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-lg">Face Recognition</CardTitle>
              <CardDescription className="text-sm">Recognize people</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Today's Tasks Preview */}
        {tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>Upcoming reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{task.task_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(task.scheduled_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {tasks.length > 3 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/patient/tasks')}>
                  View All Tasks ({tasks.length})
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
