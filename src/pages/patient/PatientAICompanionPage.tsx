import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { getPatientByProfileId, getAIInteractions, createAIInteraction } from '@/db/api';
import type { Patient, AIInteraction } from '@/types/types';

export default function AICompanionPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    
    const patientData = await getPatientByProfileId(profile.id);
    if (patientData) {
      setPatient(patientData);
      const interactionsData = await getAIInteractions(patientData.id, 20);
      setInteractions(interactionsData);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !patient) return;
    
    setLoading(true);
    
    // Simulate AI response
    const responses = [
      `Hello! Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. How can I help you?`,
      `You are ${patient.full_name}. Is there anything you'd like to know?`,
      `I'm here to help you remember important things. What would you like to know?`,
      `Let me check your schedule for today...`,
    ];
    
    const aiResponse = responses[Math.floor(Math.random() * responses.length)];
    
    await createAIInteraction({
      patient_id: patient.id,
      user_query: message,
      ai_response: aiResponse,
      interaction_type: 'chat',
    });
    
    await loadData();
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <MessageCircle className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">AI Companion</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader>
            <CardTitle>Chat with your AI companion</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted rounded-lg">
              {interactions.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start a conversation with your AI companion</p>
                  <p className="text-sm mt-2">Ask about your schedule, people you know, or anything else</p>
                </div>
              )}
              
              {interactions.slice().reverse().map((interaction) => (
                <div key={interaction.id} className="space-y-3">
                  {interaction.user_query && (
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                        <p className="text-lg">{interaction.user_query}</p>
                      </div>
                    </div>
                  )}
                  {interaction.ai_response && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-border rounded-lg p-3 max-w-[80%]">
                        <p className="text-lg">{interaction.ai_response}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="text-lg h-14"
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading || !message.trim()} size="lg" className="h-14 px-6">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
