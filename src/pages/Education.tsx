import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Search, BookOpen, Clock, Star, Play, ExternalLink } from 'lucide-react';

interface EducationContent {
  id: string;
  title: string;
  content: string;
  category: string;
  video_url?: string;
  image_url?: string;
  read_time_minutes?: number;
  featured: boolean;
  created_at: string;
}

export default function Education() {
  const [content, setContent] = useState<EducationContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<EducationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    loadEducationContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [content, searchQuery, selectedCategory]);

  const loadEducationContent = async () => {
    try {
      const { data, error } = await supabase
        .from('education_content')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading education content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredContent(filtered);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'article':
        return <BookOpen className="h-4 w-4" />;
      case 'tip':
        return <Star className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'video':
        return 'bg-destructive text-destructive-foreground';
      case 'article':
        return 'bg-primary text-primary-foreground';
      case 'tip':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const categories = ['all', ...Array.from(new Set(content.map(item => item.category)))];
  const featuredContent = content.filter(item => item.featured);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-12 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Education Center</h1>
        <p className="text-muted-foreground">Learn about seizures, treatments, and living well with epilepsy</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles, videos, and tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize animate-gentle"
            >
              {category === 'all' ? 'All Content' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Content */}
      {featuredContent.length > 0 && selectedCategory === 'all' && !searchQuery && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Star className="h-5 w-5 mr-2 text-primary" />
            Featured Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredContent.map((item) => (
              <Card key={item.id} className="animate-gentle hover:shadow-md transition-shadow border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={getCategoryColor(item.category)} variant="secondary">
                      {getCategoryIcon(item.category)}
                      <span className="ml-1 capitalize">{item.category}</span>
                    </Badge>
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between">
                    {item.read_time_minutes && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.read_time_minutes} min read
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
                    >
                      {expandedCard === item.id ? 'Show Less' : 'Read More'}
                    </Button>
                  </div>
                  {expandedCard === item.id && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg animate-gentle">
                      <p className="text-sm whitespace-pre-line">{item.content}</p>
                      {item.video_url && (
                        <Button variant="outline" className="mt-3" asChild>
                          <a href={item.video_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Watch Video
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Content */}
      <div className="space-y-4">
        {featuredContent.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <h2 className="text-lg font-semibold">All Content</h2>
        )}
        
        {filteredContent.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No content found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms' : 'No content available for this category'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((item) => (
              <Card key={item.id} className="animate-gentle hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(item.category)} variant="secondary">
                      {getCategoryIcon(item.category)}
                      <span className="ml-1 capitalize">{item.category}</span>
                    </Badge>
                    {item.featured && <Star className="h-4 w-4 text-primary" />}
                  </div>
                  <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between">
                    {item.read_time_minutes && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.read_time_minutes} min
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
                      className="text-xs"
                    >
                      Read More
                    </Button>
                  </div>
                  {expandedCard === item.id && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg animate-gentle">
                      <p className="text-sm whitespace-pre-line">{item.content}</p>
                      {item.video_url && (
                        <Button variant="outline" size="sm" className="mt-3" asChild>
                          <a href={item.video_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Watch Video
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}