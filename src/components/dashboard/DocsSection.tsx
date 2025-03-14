import { FC } from 'react';

interface DocsSectionProps {
  pageId: string | null | undefined;
}

export const DocsSection: FC<DocsSectionProps> = ({ pageId }) => {
  if (pageId) {
    return (
      <div>
        {/* Use pageId here when we're sure it's a string */}
        {pageId}
      </div>
    );
  }
  
  // Return fallback UI when pageId is null or undefined
  return null;
};