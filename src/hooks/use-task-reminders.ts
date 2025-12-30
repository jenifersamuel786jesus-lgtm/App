import { useEffect, useRef } from 'react';
import { useWhisper } from './use-whisper';
import type { Task } from '@/types/types';

interface UseTaskRemindersOptions {
  tasks: Task[];
  enabled?: boolean;
  reminderMinutesBefore?: number; // Minutes before task to remind
}

/**
 * Custom hook for automatic task reminders via voice
 * Checks tasks periodically and provides voice reminders when tasks are due
 */
export function useTaskReminders({ 
  tasks, 
  enabled = true,
  reminderMinutesBefore = 5 
}: UseTaskRemindersOptions) {
  const { whisper, isEnabled: whisperEnabled } = useWhisper();
  const remindedTasksRef = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !whisperEnabled || tasks.length === 0) {
      return;
    }

    // Check for due tasks every 30 seconds
    const checkInterval = setInterval(() => {
      checkAndRemindTasks();
    }, 30000); // 30 seconds

    // Also check immediately
    checkAndRemindTasks();

    return () => clearInterval(checkInterval);
  }, [tasks, enabled, whisperEnabled]);

  const checkAndRemindTasks = () => {
    const now = new Date();
    const currentTime = now.getTime();

    // Only check once per minute to avoid spam
    if (currentTime - lastCheckRef.current < 60000) {
      return;
    }
    lastCheckRef.current = currentTime;

    console.log('Checking for task reminders...', {
      totalTasks: tasks.length,
      currentTime: now.toLocaleString(),
    });

    tasks.forEach(task => {
      // Only remind for pending tasks
      if (task.status !== 'pending') {
        return;
      }

      // Skip if already reminded
      if (remindedTasksRef.current.has(task.id)) {
        return;
      }

      const taskTime = new Date(task.scheduled_time);
      const timeDiff = taskTime.getTime() - currentTime;
      const minutesUntilTask = Math.floor(timeDiff / 60000);

      console.log('Task check:', {
        taskName: task.task_name,
        scheduledTime: taskTime.toLocaleString(),
        minutesUntilTask,
        timeDiff,
      });

      // Remind if task is due now (within 1 minute) or overdue
      if (minutesUntilTask <= 0 && minutesUntilTask >= -5) {
        const message = `Reminder: It's time for ${task.task_name}${task.location ? ` at ${task.location}` : ''}.`;
        console.log('🔔 Task due now, reminding:', message);
        whisper(message);
        remindedTasksRef.current.add(task.id);
      }
      // Remind X minutes before task
      else if (minutesUntilTask > 0 && minutesUntilTask <= reminderMinutesBefore) {
        const message = `Reminder: ${task.task_name} is coming up in ${minutesUntilTask} minute${minutesUntilTask > 1 ? 's' : ''}${task.location ? ` at ${task.location}` : ''}.`;
        console.log('🔔 Task coming up, reminding:', message);
        whisper(message);
        remindedTasksRef.current.add(task.id);
      }
    });

    // Clean up reminded tasks that are no longer in the list
    const currentTaskIds = new Set(tasks.map(t => t.id));
    remindedTasksRef.current.forEach(taskId => {
      if (!currentTaskIds.has(taskId)) {
        remindedTasksRef.current.delete(taskId);
      }
    });
  };

  // Reset reminded tasks when tasks change significantly
  useEffect(() => {
    // If tasks list changes (new tasks added, tasks completed), reset some reminded flags
    const pendingTaskIds = new Set(tasks.filter(t => t.status === 'pending').map(t => t.id));
    
    // Remove reminded flags for tasks that are no longer pending
    remindedTasksRef.current.forEach(taskId => {
      if (!pendingTaskIds.has(taskId)) {
        remindedTasksRef.current.delete(taskId);
      }
    });
  }, [tasks]);

  return {
    // Expose method to manually trigger reminder for a specific task
    remindTask: (task: Task) => {
      if (whisperEnabled) {
        const message = `Reminder: ${task.task_name}${task.location ? ` at ${task.location}` : ''}.`;
        whisper(message);
      }
    },
    // Reset all reminded tasks (useful when user wants to hear reminders again)
    resetReminders: () => {
      remindedTasksRef.current.clear();
    },
  };
}
