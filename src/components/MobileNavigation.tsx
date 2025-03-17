
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileNavigationProps {
  links: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    subLinks?: { label: string; href: string }[];
  }[];
  className?: string;
}

export function MobileNavigation({ links, className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const toggleGroup = (label: string) => {
    setExpandedGroup(expandedGroup === label ? null : label);
  };

  // Only render the mobile navigation on mobile devices
  if (!isMobile) return null;

  return (
    <div className={cn("relative z-50", className)}>
      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden" 
        onClick={toggleMenu}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={closeMenu} />
      )}

      {/* Mobile menu panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-3/4 max-w-sm bg-card shadow-lg transform transition-transform duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Menu header */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={closeMenu}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu links */}
        <nav className="p-2">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href} className="rounded-md overflow-hidden">
                {link.subLinks ? (
                  <div className="space-y-1">
                    <button
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                      onClick={() => toggleGroup(link.label)}
                    >
                      <span className="flex items-center">
                        {link.icon && <span className="mr-2">{link.icon}</span>}
                        {link.label}
                      </span>
                      {expandedGroup === link.label ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {expandedGroup === link.label && (
                      <ul className="pl-6 space-y-1">
                        {link.subLinks.map((subLink) => (
                          <li key={subLink.href}>
                            <Link
                              to={subLink.href}
                              className="block px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                              onClick={closeMenu}
                            >
                              {subLink.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={link.href}
                    className="flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={closeMenu}
                  >
                    {link.icon && <span className="mr-2">{link.icon}</span>}
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
