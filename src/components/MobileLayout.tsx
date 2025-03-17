
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileLayoutProps {
  children: React.ReactNode;
  topPadding?: boolean;
  bottomPadding?: boolean;
  className?: string;
}

export function MobileLayout({ 
  children, 
  topPadding = true, 
  bottomPadding = true,
  className 
}: MobileLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div 
      className={cn(
        "w-full min-h-screen flex flex-col",
        topPadding && isMobile && "pt-16", // Space for fixed mobile header
        bottomPadding && isMobile && "pb-16", // Space for fixed mobile footer/navigation
        className
      )}
    >
      {children}
    </div>
  );
}

export function MobileContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "w-full mx-auto px-4",
      isMobile ? "max-w-full" : "max-w-7xl px-6",
      className
    )}>
      {children}
    </div>
  );
}

export function MobileSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("py-4 md:py-8", className)}>
      {children}
    </section>
  );
}
