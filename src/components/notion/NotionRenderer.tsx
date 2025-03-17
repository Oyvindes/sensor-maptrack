import React from 'react';
import { NotionBlock } from '@/services/notionService';

interface NotionRendererProps {
  blocks: NotionBlock[];
  className?: string;
}

const NotionRenderer: React.FC<NotionRendererProps> = ({ blocks, className }) => {
  const renderBlock = (block: NotionBlock) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p className="mb-4">
            {block.paragraph.rich_text.map((text: any, index: number) => (
              <span 
                key={index}
                className={`
                  ${text.annotations?.bold ? 'font-bold' : ''}
                  ${text.annotations?.italic ? 'italic' : ''}
                  ${text.annotations?.strikethrough ? 'line-through' : ''}
                  ${text.annotations?.underline ? 'underline' : ''}
                  ${text.annotations?.code ? 'font-mono bg-muted px-1 py-0.5 rounded' : ''}
                `}
              >
                {text.plain_text}
              </span>
            ))}
          </p>
        );
        
      case 'heading_1':
        return (
          <h1 className="text-2xl font-bold mt-6 mb-4">
            {block.heading_1.rich_text.map((text: any, index: number) => (
              <span key={index}>{text.plain_text}</span>
            ))}
          </h1>
        );
        
      case 'heading_2':
        return (
          <h2 className="text-xl font-bold mt-6 mb-3">
            {block.heading_2.rich_text.map((text: any, index: number) => (
              <span key={index}>{text.plain_text}</span>
            ))}
          </h2>
        );
        
      case 'heading_3':
        return (
          <h3 className="text-lg font-bold mt-5 mb-2">
            {block.heading_3.rich_text.map((text: any, index: number) => (
              <span key={index}>{text.plain_text}</span>
            ))}
          </h3>
        );
        
      case 'bulleted_list_item':
        return (
          <li className="ml-6 mb-1 list-disc">
            {block.bulleted_list_item.rich_text.map((text: any, index: number) => (
              <span key={index}>{text.plain_text}</span>
            ))}
            {block.children && (
              <ul className="mt-1">
                {block.children.map((child: NotionBlock) => (
                  <React.Fragment key={child.id}>
                    {renderBlock(child)}
                  </React.Fragment>
                ))}
              </ul>
            )}
          </li>
        );
        
      case 'numbered_list_item':
        return (
          <li className="ml-6 mb-1 list-decimal">
            {block.numbered_list_item.rich_text.map((text: any, index: number) => (
              <span key={index}>{text.plain_text}</span>
            ))}
            {block.children && (
              <ol className="mt-1">
                {block.children.map((child: NotionBlock) => (
                  <React.Fragment key={child.id}>
                    {renderBlock(child)}
                  </React.Fragment>
                ))}
              </ol>
            )}
          </li>
        );
        
      case 'to_do':
        return (
          <div className="flex items-start mb-2">
            <input 
              type="checkbox" 
              checked={block.to_do.checked} 
              readOnly 
              className="mt-1 mr-2"
            />
            <div>
              {block.to_do.rich_text.map((text: any, index: number) => (
                <span 
                  key={index}
                  className={block.to_do.checked ? 'line-through text-muted-foreground' : ''}
                >
                  {text.plain_text}
                </span>
              ))}
            </div>
          </div>
        );
        
      case 'image':
        const imageUrl = block.image.type === 'external' 
          ? block.image.external.url 
          : block.image.file.url;
          
        return (
          <figure className="my-4">
            <img 
              src={imageUrl} 
              alt={block.image.caption?.[0]?.plain_text || 'Image'} 
              className="max-w-full rounded-md"
            />
            {block.image.caption && block.image.caption.length > 0 && (
              <figcaption className="text-sm text-muted-foreground mt-2 text-center">
                {block.image.caption[0].plain_text}
              </figcaption>
            )}
          </figure>
        );
        
      case 'code':
        return (
          <pre className="bg-muted p-4 rounded-md my-4 overflow-x-auto">
            <code className="text-sm font-mono">
              {block.code.rich_text.map((text: any) => text.plain_text).join('')}
            </code>
          </pre>
        );
        
      case 'quote':
        return (
          <blockquote className="border-l-4 border-primary pl-4 py-1 my-4">
            {block.quote.rich_text.map((text: any, index: number) => (
              <span key={index}>{text.plain_text}</span>
            ))}
          </blockquote>
        );
        
      case 'divider':
        return <hr className="my-6 border-t border-border" />;
        
      case 'callout':
        return (
          <div className="bg-muted p-4 rounded-md my-4 flex items-start">
            {block.callout.icon && (
              <div className="mr-2">
                {block.callout.icon.type === 'emoji' ? (
                  <span>{block.callout.icon.emoji}</span>
                ) : (
                  <img 
                    src={block.callout.icon.external?.url || block.callout.icon.file?.url} 
                    alt="Icon" 
                    className="w-5 h-5"
                  />
                )}
              </div>
            )}
            <div>
              {block.callout.rich_text.map((text: any, index: number) => (
                <span key={index}>{text.plain_text}</span>
              ))}
            </div>
          </div>
        );
        
      case 'table':
        return (
          <div className="my-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <tbody>
                {block.children && block.children.map((row: NotionBlock, rowIndex: number) => (
                  <tr key={row.id} className={rowIndex === 0 ? 'bg-muted' : ''}>
                    {row.table_row.cells.map((cell: any[], cellIndex: number) => (
                      <td 
                        key={`${row.id}-${cellIndex}`}
                        className="border border-border px-4 py-2"
                      >
                        {cell.map((text: any, textIndex: number) => (
                          <span key={textIndex}>{text.plain_text}</span>
                        ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      default:
        // For unsupported block types
        return (
          <div className="text-muted-foreground italic my-2">
            Unsupported block type: {block.type}
          </div>
        );
    }
  };

  // Group adjacent list items to render them in a single list
  const renderBlocks = () => {
    const result: JSX.Element[] = [];
    let currentListType: string | null = null;
    let currentListItems: JSX.Element[] = [];

    blocks.forEach((block, index) => {
      if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
        const listType = block.type === 'bulleted_list_item' ? 'ul' : 'ol';
        
        if (currentListType !== listType) {
          // If we were building a different type of list, add it to the result
          if (currentListType && currentListItems.length > 0) {
            result.push(
              React.createElement(
                currentListType, 
                { key: `list-${index}`, className: 'my-4' }, 
                currentListItems
              )
            );
            currentListItems = [];
          }
          currentListType = listType;
        }
        
        currentListItems.push(renderBlock(block));
      } else {
        // If we were building a list, add it to the result
        if (currentListType && currentListItems.length > 0) {
          result.push(
            React.createElement(
              currentListType, 
              { key: `list-${index}`, className: 'my-4' }, 
              currentListItems
            )
          );
          currentListItems = [];
          currentListType = null;
        }
        
        // Add the current block to the result
        result.push(
          <div key={block.id}>
            {renderBlock(block)}
          </div>
        );
      }
    });

    // If we have any remaining list items, add them to the result
    if (currentListType && currentListItems.length > 0) {
      result.push(
        React.createElement(
          currentListType, 
          { key: 'list-end', className: 'my-4' }, 
          currentListItems
        )
      );
    }

    return result;
  };

  return (
    <div className={className}>
      {renderBlocks()}
    </div>
  );
};

export default NotionRenderer;