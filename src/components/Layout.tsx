
import React from "react";
import { cn } from "@/lib/utils";

type LayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export const PageContainer = ({ children, className }: LayoutProps) => {
  return (
    <div className={cn("min-h-screen bg-background px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8", className)}>
      {children}
    </div>
  );
};

export const PageHeader = ({ children, className }: LayoutProps) => {
  return (
    <header className={cn("mb-8 animate-fade-up [animation-delay:100ms]", className)}>
      {children}
    </header>
  );
};

export const PageTitle = ({ children, className }: LayoutProps) => {
  return (
    <h1
      className={cn(
        "text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl",
        className
      )}
    >
      {children}
    </h1>
  );
};

export const PageSubtitle = ({ children, className }: LayoutProps) => {
  return (
    <p className={cn("mt-2 text-lg text-muted-foreground", className)}>
      {children}
    </p>
  );
};

export const ContentContainer = ({ children, className }: LayoutProps) => {
  return (
    <main className={cn("space-y-6 sm:space-y-8 md:space-y-10 animate-fade-up [animation-delay:200ms]", className)}>
      {children}
    </main>
  );
};

export const SectionContainer = ({ children, className }: LayoutProps) => {
  return <section className={cn("space-y-4 sm:space-y-5 md:space-y-6", className)}>{children}</section>;
};

export const SectionTitle = ({ children, className }: LayoutProps) => {
  return (
    <h2
      className={cn(
        "text-lg font-semibold tracking-tight sm:text-xl md:text-2xl",
        className
      )}
    >
      {children}
    </h2>
  );
};
