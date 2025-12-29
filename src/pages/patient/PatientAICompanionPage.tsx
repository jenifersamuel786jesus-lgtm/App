import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { getPatientByProfileId, getAIInteractions, createAIInteraction } from '@/db/api';
import type { Patient, AIInteraction } from '@/types/types';
import { useWhisper } from '@/hooks/use-whisper';

export default function AICompanionPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { whisper } = useWhisper();
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
    
    try {
      // Get real AI response from Gemini API
      const aiResponse = await getAIResponse(message, patient);
      
      // Whisper the AI response aloud
      whisper(aiResponse);
      
      await createAIInteraction({
        patient_id: patient.id,
        user_query: message,
        ai_response: aiResponse,
        interaction_type: 'chat',
      });
      
      await loadData();
      setMessage('');
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback response if AI fails
      const fallbackResponse = "I'm here to help you. Could you please rephrase your question?";
      whisper(fallbackResponse);
      await createAIInteraction({
        patient_id: patient.id,
        user_query: message,
        ai_response: fallbackResponse,
        interaction_type: 'chat',
      });
      await loadData();
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const getAIResponse = async (userMessage: string, patient: Patient): Promise<string> => {
    const APP_ID = import.meta.env.VITE_APP_ID || 'app-8g7cyjjxisxt';
    const API_URL = `https://api-integrations.appmedo.com/${APP_ID}/api-rLob8RdzAOl9/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse`;

    // Get current date and time for context
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });

    // Create context-aware prompt
    const systemPrompt = `You are a compassionate AI companion assisting ${patient.full_name}, a person with Alzheimer's disease. 

Current Context:
- Patient Name: ${patient.full_name}
- Current Date: ${dateStr}
- Current Time: ${timeStr}

Your role:
1. Provide gentle reminders about identity, time, and place
2. Answer questions with patience and clarity
3. Use simple, reassuring language
4. Be warm, friendly, and supportive
5. Help with orientation (who, what, when, where)
6. Keep responses brief (2-3 sentences max)

Common questions you should answer:
- "What day is it?" → Tell the current date
- "Who am I?" → Remind them they are ${patient.full_name}
- "What time is it?" → Tell the current time
- "Where am I?" → Provide reassurance about their location

User's question: ${userMessage}

Respond in a warm, helpful, and reassuring manner.`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': APP_ID,
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: systemPrompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    let fullResponse = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6);
            const data = JSON.parse(jsonStr);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              fullResponse += text;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    return fullResponse.trim() || "I'm here to help you. How can I assist you today?";
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
