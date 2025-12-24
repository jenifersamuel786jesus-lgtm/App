import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Activity, TrendingUp } from 'lucide-react';
import { getPatientByProfileId, getHealthMetrics } from '@/db/api';
import type { Patient, HealthMetric } from '@/types/types';

export default function PatientHealthPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    const patientData = await getPatientByProfileId(profile.id);
    if (patientData) {
      setPatient(patientData);
      const metricsData = await getHealthMetrics(patientData.id, 10);
      setMetrics(metricsData);
    }
    setLoading(false);
  };

  const latestMetric = metrics[0];
  const avgHeartRate = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.heart_rate || 0), 0) / metrics.length)
    : 0;
  const totalSteps = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m.steps || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Heart className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">My Health</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading health data...</p>
          </div>
        ) : (
          <>
            {/* Current Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Heart Rate</CardDescription>
                  <CardTitle className="text-4xl">
                    {latestMetric?.heart_rate || '--'}
                    <span className="text-lg text-muted-foreground ml-2">bpm</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>Current</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Steps Today</CardDescription>
                  <CardTitle className="text-4xl">
                    {latestMetric?.steps || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4" />
                    <span>Keep moving!</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Activity Level</CardDescription>
                  <CardTitle className="text-4xl">
                    {latestMetric?.inactivity_duration_hours 
                      ? `${Math.round(latestMetric.inactivity_duration_hours)}h`
                      : '--'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>Rest time</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Averages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Your Averages</CardTitle>
                <CardDescription>Based on recent measurements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">Average Heart Rate</p>
                    <p className="text-sm text-muted-foreground">Last 10 readings</p>
                  </div>
                  <p className="text-3xl font-bold">{avgHeartRate} <span className="text-lg text-muted-foreground">bpm</span></p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">Total Steps</p>
                    <p className="text-sm text-muted-foreground">Last 10 days</p>
                  </div>
                  <p className="text-3xl font-bold">{totalSteps.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Recent Measurements</CardTitle>
                <CardDescription>Your health tracking history</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No health data yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect a health device to start tracking
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(metric.recorded_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex gap-6 text-sm">
                          {metric.heart_rate && (
                            <div className="text-right">
                              <p className="text-muted-foreground">Heart Rate</p>
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

            {/* Health Tips */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Health Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-2xl">💧</span>
                  <div>
                    <p className="font-semibold">Stay Hydrated</p>
                    <p className="text-sm text-muted-foreground">Drink water throughout the day</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🚶</span>
                  <div>
                    <p className="font-semibold">Keep Moving</p>
                    <p className="text-sm text-muted-foreground">Take short walks regularly</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">😴</span>
                  <div>
                    <p className="font-semibold">Rest Well</p>
                    <p className="text-sm text-muted-foreground">Get 7-8 hours of sleep</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
