import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, 
  Pill, 
  AlertTriangle, 
  MessageCircle, 
  BarChart3, 
  BookOpen,
  Plus,
  Clock
} from 'lucide-react';

interface DashboardStats {
  recentSeizures: number;
  activeMedications: number;
  upcomingMedications: number;
  unreadMessages: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    recentSeizures: 0,
    activeMedications: 0,
    upcomingMedications: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [seizuresResult, medicationsResult, messagesResult] = await Promise.all([
        // Recent seizures (last 30 days)
        supabase
          .from('seizures')
          .select('id')
          .gte('date_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Active medications
        supabase
          .from('medications')
          .select('id, reminder_enabled')
          .eq('active', true),
        
        // Unread messages (mock count for now)
        supabase
          .from('chat_messages')
          .select('id')
          .eq('is_from_doctor', true)
          .limit(5)
      ]);

      const activeMeds = medicationsResult.data || [];
      const upcomingMeds = activeMeds.filter(med => med.reminder_enabled).length;

      setStats({
        recentSeizures: seizuresResult.data?.length || 0,
        activeMedications: activeMeds.length,
        upcomingMedications: upcomingMeds,
        unreadMessages: messagesResult.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickAccessCards = [
    {
      title: 'Log Seizure',
      description: 'Record a new seizure event',
      icon: Plus,
      href: '/diary/new',
      color: 'bg-primary',
      urgent: false,
    },
    {
      title: 'Emergency',
      description: 'Get immediate help',
      icon: AlertTriangle,
      href: '/emergency',
      color: 'bg-emergency',
      urgent: true,
    },
    {
      title: 'Medications',
      description: 'Manage your medications',
      icon: Pill,
      href: '/medications',
      color: 'bg-accent',
      urgent: false,
    },
    {
      title: 'Doctor Chat',
      description: 'Message your care team',
      icon: MessageCircle,
      href: '/chat',
      color: 'bg-success',
      urgent: false,
    },
  ];

  const menuCards = [
    {
      title: 'Seizure Diary',
      description: 'View and track your seizure history',
      icon: Calendar,
      href: '/diary',
      count: stats.recentSeizures,
      countLabel: 'this month',
    },
    {
      title: 'Reports',
      description: 'View your health insights',
      icon: BarChart3,
      href: '/reports',
    },
    {
      title: 'Education',
      description: 'Learn about seizure management',
      icon: BookOpen,
      href: '/education',
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Good day!</h1>
        <p className="text-muted-foreground">Here's your health overview</p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 gap-3">
        {quickAccessCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.href}>
              <Card className={`h-24 animate-gentle hover:scale-105 transition-transform ${
                card.urgent ? 'ring-2 ring-emergency/20' : ''
              }`}>
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color} ${
                    card.urgent ? 'animate-emergency-pulse' : ''
                  }`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{card.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">This Week's Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Recent seizures</span>
              </div>
              <Badge variant={stats.recentSeizures > 0 ? "destructive" : "secondary"}>
                {stats.recentSeizures}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Pill className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Active medications</span>
              </div>
              <Badge variant="secondary">{stats.activeMedications}</Badge>
            </div>

            {stats.upcomingMedications > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm">Reminder enabled</span>
                </div>
                <Badge variant="outline" className="border-warning text-warning">
                  {stats.upcomingMedications}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Cards */}
        {menuCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.href}>
              <Card className="animate-gentle hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{card.title}</p>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                      {card.count !== undefined && (
                        <p className="text-xs text-primary font-medium">
                          {card.count} {card.countLabel}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}