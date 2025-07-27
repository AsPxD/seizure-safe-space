import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Send, MessageCircle, User, Stethoscope, Bot, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  message: string;
  is_from_doctor: boolean;
  created_at: string;
}

interface AIMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newAiMessage, setNewAiMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: newMessage.trim(),
          is_from_doctor: false,
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        title: "Message sent",
        description: "Your message has been sent to the doctor.",
      });

      // Reload messages to show the new one
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendAiMessage = async () => {
    if (!newAiMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: newAiMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setAiMessages(prev => [...prev, userMessage]);
    const messageToSend = newAiMessage.trim();
    setNewAiMessage('');
    setAiLoading(true);

    try {
      const response = await fetch('https://iewsklevfnpjpqcrzvrg.supabase.co/functions/v1/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlld3NrbGV2Zm5wanBxY3J6dnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNzc5MTksImV4cCI6MjA2ODk1MzkxOX0.ampdSqDz_OTMjJzapCnMzNONYSu3KI5cU-0abIMsHR4'}`,
        },
        body: JSON.stringify({
          message: messageToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setAiMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold">Healthcare Chat</h1>
        <p className="text-muted-foreground">Chat with your doctor or get AI assistance</p>
      </div>

      <Tabs defaultValue="doctor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="doctor" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Doctor Chat</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Bot className="h-4 w-4" />
            <span>AI Assistant</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="doctor">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Doctor Messages</span>
                <Badge variant="outline" className="ml-auto">
                  {messages.length} messages
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-muted-foreground">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet. Start a conversation with your doctor.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_from_doctor ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.is_from_doctor
                          ? 'bg-primary/10 text-primary-foreground'
                          : 'bg-accent text-accent-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.is_from_doctor ? (
                          <Stethoscope className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span className="text-xs font-medium">
                          {message.is_from_doctor ? 'Doctor' : 'You'}
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message to the doctor..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>AI Seizure Assistant</span>
                <Badge variant="outline" className="ml-auto">
                  Specialized in epilepsy & seizures
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ask questions about seizures, epilepsy, medications, and health. 
                This AI is specialized for seizure-related topics only.
              </p>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <p>Hello! I'm your AI seizure assistant.</p>
                    <p className="text-sm">Ask me about seizures, epilepsy, medications, or health topics.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewAiMessage("What are the different types of seizures?")}
                    >
                      Types of seizures
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewAiMessage("How can I identify seizure triggers?")}
                    >
                      Seizure triggers
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewAiMessage("What should I do during a seizure?")}
                    >
                      Seizure first aid
                    </Button>
                  </div>
                </div>
              ) : (
                aiMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'ai'
                          ? 'bg-primary/10 text-primary-foreground'
                          : 'bg-accent text-accent-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {message.sender === 'ai' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span className="text-xs font-medium">
                          {message.sender === 'ai' ? 'AI Assistant' : 'You'}
                        </span>
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {message.sender === 'ai' ? (
                        <div className="text-sm prose prose-sm max-w-none prose-invert">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-primary/10 rounded-lg p-3 flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              )}
            </CardContent>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask about seizures, epilepsy, or health topics..."
                  value={newAiMessage}
                  onChange={(e) => setNewAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={sendAiMessage} 
                  disabled={!newAiMessage.trim() || aiLoading}
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 This AI assistant is specialized for seizure and health topics only.
                For urgent medical needs, contact your doctor or emergency services.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}