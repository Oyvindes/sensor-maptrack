
import React, { useState, useEffect } from "react";
import { fetchNotionContent } from "@/services/notion/notionService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";

interface HelpSectionProps {
  className?: string;
}

const HelpSection: React.FC<HelpSectionProps> = ({ className }) => {
  const [content, setContent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const data = await fetchNotionContent();
        setContent(data);
      } catch (err) {
        setError("Failed to load help content. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const renderBlock = (block: any) => {
    switch (block.type) {
      case "heading_1":
        return <h1 className="text-2xl font-bold mt-6 mb-2">{block.heading_1?.rich_text[0]?.plain_text}</h1>;
      case "heading_2":
        return <h2 className="text-xl font-semibold mt-5 mb-2">{block.heading_2?.rich_text[0]?.plain_text}</h2>;
      case "heading_3":
        return <h3 className="text-lg font-semibold mt-4 mb-1">{block.heading_3?.rich_text[0]?.plain_text}</h3>;
      case "paragraph":
        return <p className="my-3">{block.paragraph?.rich_text[0]?.plain_text || ""}</p>;
      case "bulleted_list_item":
        return <li className="ml-6 list-disc my-1">{block.bulleted_list_item?.rich_text[0]?.plain_text}</li>;
      case "numbered_list_item":
        return <li className="ml-6 list-decimal my-1">{block.numbered_list_item?.rich_text[0]?.plain_text}</li>;
      case "image":
        return (
          <div className="my-4">
            <img 
              src={block.image?.external?.url || block.image?.file?.url} 
              alt={block.image?.caption?.[0]?.plain_text || "Image"}
              className="max-w-full rounded-md" 
            />
            {block.image?.caption && (
              <p className="text-sm text-gray-500 mt-1">{block.image.caption[0]?.plain_text}</p>
            )}
          </div>
        );
      default:
        return <div className="my-2">Unsupported block type: {block.type}</div>;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Sensor Manual
          </CardTitle>
          <CardDescription>
            User guide for setting up and using BRIKS sensors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-500 rounded-md">
              {error}
              <div className="mt-2">
                <a 
                  href="https://briks.notion.site/Probe-Brukermanual-c52622f3a3e243819ab0d9c42f58eeb4?pvs=4" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View manual on Notion
                </a>
              </div>
            </div>
          ) : content ? (
            <div className="prose max-w-none">
              <h1 className="text-3xl font-bold mb-6">{content.title}</h1>
              {content.blocks?.map((block: any) => (
                <div key={block.id}>{renderBlock(block)}</div>
              ))}
              <div className="mt-6 pt-4 border-t">
                <a 
                  href="https://briks.notion.site/Probe-Brukermanual-c52622f3a3e243819ab0d9c42f58eeb4?pvs=4" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View full manual on Notion
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <p>No content available.</p>
              <a 
                href="https://briks.notion.site/Probe-Brukermanual-c52622f3a3e243819ab0d9c42f58eeb4?pvs=4" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline mt-2 block"
              >
                View manual on Notion
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSection;
