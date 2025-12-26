import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bell, AlertTriangle, CheckCircle2, Clock, MapPin, User } from 'lucide-react';
import { getCaregiverByProfileId, getCaregiverAlerts, updateAlert } from '@/db/api';
import type { Caregiver, AlertWithPatient } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function CaregiverAlertsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [alerts, setAlerts] = useState<AlertWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    const caregiverData = await getCaregiverByProfileId(profile.id);
    if (caregiverData) {
      setCaregiver(caregiverData);
      const alertsData = await getCaregiverAlerts(caregiverData.id);
      setAlerts(alertsData);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (alertId: string) => {
    await updateAlert(alertId, { alert_status: 'read' });
    toast({
      title: 'Alert Marked as Read',
      description: 'Alert status updated',
    });
    loadData();
  };

  const handleMarkAsResolved = async (alertId: string) => {
    await updateAlert(alertId, { alert_status: 'resolved' });
    toast({
      title: 'Alert Resolved',
      description: 'Alert marked as resolved',
    });
    loadData();
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'task_skipped':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'unknown_person':
        return <User className="w-5 h-5 text-primary" />;
      case 'health_warning':
        return <Bell className="w-5 h-5 text-warning" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'emergency':
        return <Badge className="bg-destructive">Emergency</Badge>;
      case 'task_skipped':
        return <Badge variant="secondary">Task Skipped</Badge>;
      case 'unknown_person':
        return <Badge className="bg-primary">Unknown Person</Badge>;
      case 'health_warning':
        return <Badge className="bg-warning text-warning-foreground">Health Warning</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive">Unread</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'resolved':
        return <Badge className="bg-success text-success-foreground">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.alert_status === filter;
  });

  const unreadCount = alerts.filter((a) => a.alert_status === 'unread').length;
  const readCount = alerts.filter((a) => a.alert_status === 'read').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/caregiver/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Alerts</h1>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-base px-3 py-1">
              {unreadCount} Unread
            </Badge>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All ({alerts.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read ({readCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="space-y-4 mt-6">
                {filteredAlerts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No alerts to display</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {filter === 'unread' && 'All alerts have been read'}
                        {filter === 'read' && 'No read alerts'}
                        {filter === 'all' && 'You have no alerts yet'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredAlerts.map((alert) => (
                    <Card
                      key={alert.id}
                      className={alert.alert_status === 'unread' ? 'border-primary' : ''}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {getAlertIcon(alert.alert_type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getAlertBadge(alert.alert_type)}
                                {getStatusBadge(alert.alert_status)}
                              </div>
                              <CardTitle className="text-xl">
                                {alert.patient?.full_name || 'Patient'}
                              </CardTitle>
                              <CardDescription className="text-base mt-1">
                                {alert.message}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Alert Details */}
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(alert.created_at).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {(alert.location_lat && alert.location_lng) && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <a
                                href={`https://www.google.com/maps?q=${alert.location_lat},${alert.location_lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                View Location on Map
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {alert.alert_status !== 'resolved' && (
                          <div className="flex gap-3">
                            {alert.alert_status === 'unread' && (
                              <Button
                                onClick={() => handleMarkAsRead(alert.id)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                Mark as Read
                              </Button>
                            )}
                            <Button
                              onClick={() => handleMarkAsResolved(alert.id)}
                              size="sm"
                              className="flex-1 bg-success hover:bg-success/90"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
