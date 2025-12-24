import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, Heart, Activity, MessageCircle, AlertCircle } from 'lucide-react';
import { getPatient, getTasks, getKnownFaces, getHealthMetrics, getAIInteractions, getActivityLogs } from '@/db/api';
import type { Patient, Task, KnownFace, HealthMetric, AIInteraction, ActivityLog } from '@/types/types';

export default function CaregiverPatientDetailsPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<KnownFace[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [aiInteractions, setAIInteractions] = useState<AIInteraction[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    if (!patientId) return;
    
    setLoading(true);
    const [patientData, tasksData, contactsData, metricsData, aiData, logsData] = await Promise.all([
      getPatient(patientId),
      getTasks(patientId),
      getKnownFaces(patientId),
      getHealthMetrics(patientId, 10),
      getAIInteractions(patientId, 10),
      getActivityLogs(patientId, 20),
    ]);
    
    setPatient(patientData);
    setTasks(tasksData);
    setContacts(contactsData);
    setHealthMetrics(metricsData);
    setAIInteractions(aiData);
    setActivityLogs(logsData);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'skipped':
        return <Badge variant="secondary">Skipped</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const latestMetric = healthMetrics[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/caregiver/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{patient?.full_name || 'Patient Details'}</h1>
            <p className="text-sm text-muted-foreground">Monitoring Dashboard</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading patient data...</p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="ai">AI Chat</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Pending Tasks</CardDescription>
                    <CardTitle className="text-3xl">{pendingTasks.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Known Contacts</CardDescription>
                    <CardTitle className="text-3xl">{contacts.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Heart Rate</CardDescription>
                    <CardTitle className="text-3xl">
                      {latestMetric?.heart_rate || '--'}
                      <span className="text-sm text-muted-foreground ml-1">bpm</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Heart className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>AI Interactions</CardDescription>
                    <CardTitle className="text-3xl">{aiInteractions.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions and events</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No recent activity</p>
                  ) : (
                    <div className="space-y-3">
                      {activityLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                          <Activity className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{log.activity_type}</p>
                            {log.activity_description && (
                              <p className="text-sm text-muted-foreground">{log.activity_description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.log_time).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Tasks ({pendingTasks.length})</CardTitle>
                  <CardDescription>Upcoming tasks and reminders</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No pending tasks</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingTasks.map((task) => (
                        <div key={task.id} className="flex items-start justify-between p-4 border border-border rounded-lg">
                          <div>
                            <p className="font-semibold text-lg">{task.task_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(task.scheduled_time).toLocaleString()}
                            </p>
                            {task.location && (
                              <p className="text-sm text-muted-foreground mt-1">📍 {task.location}</p>
                            )}
                          </div>
                          {getStatusBadge(task.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completed Tasks</CardTitle>
                  <CardDescription>Task history</CardDescription>
                </CardHeader>
                <CardContent>
                  {tasks.filter(t => t.status !== 'pending').length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No completed tasks</p>
                  ) : (
                    <div className="space-y-2">
                      {tasks.filter(t => t.status !== 'pending').map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium">{task.task_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(task.scheduled_time).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(task.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardDescription>Current Heart Rate</CardDescription>
                    <CardTitle className="text-4xl">
                      {latestMetric?.heart_rate || '--'}
                      <span className="text-lg text-muted-foreground ml-2">bpm</span>
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Steps Today</CardDescription>
                    <CardTitle className="text-4xl">{latestMetric?.steps || 0}</CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Inactivity</CardDescription>
                    <CardTitle className="text-4xl">
                      {latestMetric?.inactivity_duration_hours 
                        ? `${Math.round(latestMetric.inactivity_duration_hours)}h`
                        : '--'}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Health History</CardTitle>
                  <CardDescription>Recent health measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  {healthMetrics.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No health data available</p>
                  ) : (
                    <div className="space-y-3">
                      {healthMetrics.map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div>
                            <p className="font-medium">
                              {new Date(metric.recorded_at).toLocaleString()}
                            </p>
                            {metric.is_abnormal && (
                              <Badge variant="destructive" className="mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Abnormal
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-6 text-sm">
                            {metric.heart_rate && (
                              <div className="text-right">
                                <p className="text-muted-foreground">HR</p>
                                <p className="font-semibold">{metric.heart_rate} bpm</p>
                              </div>
                            )}
                            {metric.steps !== null && (
                              <div className="text-right">
                                <p className="text-muted-foreground">Steps</p>
                                <p className="font-semibold">{metric.steps}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Interactions Tab */}
            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Companion Conversations</CardTitle>
                  <CardDescription>Recent interactions with the AI assistant</CardDescription>
                </CardHeader>
                <CardContent>
                  {aiInteractions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No AI interactions yet</p>
                  ) : (
                    <div className="space-y-4">
                      {aiInteractions.map((interaction) => (
                        <div key={interaction.id} className="space-y-2 p-4 border border-border rounded-lg">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline">Patient</Badge>
                            <p className="flex-1">{interaction.user_query}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <Badge className="bg-primary/10 text-primary">AI</Badge>
                            <p className="flex-1 text-muted-foreground">{interaction.ai_response}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(interaction.interaction_time).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Complete activity history</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No activity logs</p>
                  ) : (
                    <div className="space-y-2">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                          <Activity className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium">{log.activity_type}</p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(log.log_time).toLocaleString()}
                              </p>
                            </div>
                            {log.activity_description && (
                              <p className="text-sm text-muted-foreground mt-1">{log.activity_description}</p>
                            )}
                            {(log.location_lat && log.location_lng) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                📍 {log.location_lat.toFixed(4)}, {log.location_lng.toFixed(4)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
