
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Gauge, 
  Cpu, 
  Users as UsersIcon,
  FolderTree
} from 'lucide-react';

interface ModeSwitcherProps {
  currentMode: "sensors" | "devices" | "users" | "folders";
  onModeChange: (mode: "sensors" | "devices" | "users" | "folders") => void;
}

// This component is kept for compatibility but is no longer used
// Its functionality has been merged into the main Tabs at the top of the Admin page
const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ 
  currentMode = "sensors", 
  onModeChange
}) => {
  return null; // No longer rendering this component
};

export default ModeSwitcher;
