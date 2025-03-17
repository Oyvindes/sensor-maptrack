import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Upload } from 'lucide-react';
import { migrateMockUsersToDB } from '@/services/user/supabaseUserService';
import { toast } from 'sonner';

interface MigrateUsersButtonProps {
  onMigrationComplete?: () => void;
}

const MigrateUsersButton: React.FC<MigrateUsersButtonProps> = ({ 
  onMigrationComplete 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleMigration = async () => {
    setIsLoading(true);
    
    try {
      const result = await migrateMockUsersToDB();
      
      if (result.success) {
        toast.success(result.message);
        if (onMigrationComplete) {
          onMigrationComplete();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error migrating users:', error);
      toast.error('An error occurred while migrating users');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleMigration} 
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Upload className="h-4 w-4 animate-spin" />
          <span>Migrating...</span>
        </>
      ) : (
        <>
          <Database className="h-4 w-4" />
          <span>Migrate Users to DB</span>
        </>
      )}
    </Button>
  );
};

export default MigrateUsersButton;