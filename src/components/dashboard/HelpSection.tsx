import React, { useState, useEffect } from 'react';
import { notionService, NotionPage } from '@/services/notionService';
import NotionRenderer from '@/components/notion/NotionRenderer';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface HelpSectionProps {
  className?: string;
}

const HelpSection: React.FC<HelpSectionProps> = ({ className }) => {
  const [pageData, setPageData] = useState<NotionPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotionPage = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // The Notion page URL from the task
        const pageUrl = 'https://briks.notion.site/Probe-Brukermanual-c52622f3a3e243819ab0d9c42f58eeb4';
        
        // Extract the page ID from the URL
        const pageId = notionService.extractPageId(pageUrl);
        
        // Fetch the page data
        const data = await notionService.getPage(pageId);
        setPageData(data);
      } catch (err) {
        console.error('Error fetching Notion page:', err);
        setError('Failed to load help content. Please try again later.');
        toast.error('Failed to load help content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotionPage();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading help content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-destructive mb-2">Error</div>
        <p className="text-center">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <p className="text-muted-foreground">No help content available.</p>
      </div>
    );
  }

  return (
    <div className={`w-full animate-fade-up [animation-delay:300ms] ${className}`}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{pageData.title}</h1>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm p-6">
        <NotionRenderer blocks={pageData.blocks} />
      </div>
    </div>
  );
};

export default HelpSection;