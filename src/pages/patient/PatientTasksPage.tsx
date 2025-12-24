import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getPatientByProfileId, getTasks, createTask, updateTask } from '@/db/api';
import type { Patient, Task } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function PatientTasksPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    task_name: '',
    scheduled_time: '',
    location: '',
  });

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    const patientData = await getPatientByProfileId(profile.id);
    if (patientData) {
      setPatient(patientData);
      const tasksData = await getTasks(patientData.id);
      setTasks(tasksData);
    }
    setLoading(false);
  };

  const handleCreateTask = async () => {
    if (!patient || !newTask.task_name || !newTask.scheduled_time) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in task name and time',
        variant: 'destructive',
      });
      return;
    }

    const task = await createTask({
      patient_id: patient.id,
      task_name: newTask.task_name,
      scheduled_time: newTask.scheduled_time,
      location: newTask.location || null,
      status: 'pending',
    });

    if (task) {
      toast({
        title: 'Task Created',
        description: 'Your task has been added successfully',
      });
      setDialogOpen(false);
      setNewTask({ task_name: '', scheduled_time: '', location: '' });
      loadData();
    }
  };

  const handleUpdateStatus = async (taskId: string, status: 'completed' | 'skipped') => {
    await updateTask(taskId, { status });
    toast({
      title: status === 'completed' ? 'Task Completed' : 'Task Skipped',
      description: `Task marked as ${status}`,
    });
    loadData();
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
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'skipped');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Clock className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">My Tasks</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-14 px-6">
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a task or reminder for yourself</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task_name">Task Name *</Label>
                  <Input
                    id="task_name"
                    value={newTask.task_name}
                    onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                    placeholder="Take medicine"
                    className="text-lg h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time">Time *</Label>
                  <Input
                    id="scheduled_time"
                    type="datetime-local"
                    value={newTask.scheduled_time}
                    onChange={(e) => setNewTask({ ...newTask, scheduled_time: e.target.value })}
                    className="text-lg h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={newTask.location}
                    onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                    placeholder="Kitchen"
                    className="text-lg h-12"
                  />
                </div>
                <Button onClick={handleCreateTask} className="w-full h-12" size="lg">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : (
          <>
            {/* Pending Tasks */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Upcoming Tasks</h2>
              {pendingTasks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No pending tasks</p>
                    <p className="text-sm text-muted-foreground mt-2">Add a task to get started</p>
                  </CardContent>
                </Card>
              ) : (
                pendingTasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl">{task.task_name}</CardTitle>
                          <CardDescription className="text-lg mt-2">
                            {new Date(task.scheduled_time).toLocaleString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </CardDescription>
                          {task.location && (
                            <p className="text-muted-foreground mt-1">📍 {task.location}</p>
                          )}
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleUpdateStatus(task.id, 'completed')}
                          className="flex-1 h-14 bg-success hover:bg-success/90"
                          size="lg"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Complete
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(task.id, 'skipped')}
                          variant="outline"
                          className="flex-1 h-14"
                          size="lg"
                        >
                          <XCircle className="w-5 h-5 mr-2" />
                          Skip
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Completed Tasks</h2>
                {completedTasks.map((task) => (
                  <Card key={task.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{task.task_name}</CardTitle>
                          <CardDescription>
                            {new Date(task.scheduled_time).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </CardDescription>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
