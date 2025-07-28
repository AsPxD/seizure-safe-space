import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Calendar, FileText, Heart, MessageCircle, Pill, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CareGuard
          </h1>
          <p className="text-xl text-muted-foreground">
            Your comprehensive seizure management companion
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/seizure-diary">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-primary" />
                <CardTitle>Seizure Diary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">Track and log your seizures</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/medications">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Pill className="h-12 w-12 mx-auto mb-2 text-primary" />
                <CardTitle>Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">Manage your medications</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/emergency">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Heart className="h-12 w-12 mx-auto mb-2 text-destructive" />
                <CardTitle>Emergency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">Emergency contacts & info</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 text-primary" />
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">View analytics & reports</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/education">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-2 text-primary" />
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">Learn about seizures</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-primary" />
                <CardTitle>Healthcare Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">Chat with doctor or AI</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* AI Chatbot Button */}
        <div className="fixed bottom-6 right-6">
          <Link to="/chat?tab=ai">
            <Button 
              size="lg" 
              className="rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:scale-110"
            >
              <Bot className="h-8 w-8" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
