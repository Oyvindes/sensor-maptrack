import React, { useCallback, useState, useEffect } from 'react';
import { SensorFolder } from '@/types/users';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Cpu, Play, Square, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	startProjectDataCollection,
	stopProjectDataCollection
} from '@/services/sensor/sensorDataCollection';

interface ProjectsListProps {
  projects: SensorFolder[];
  isLoading: boolean;
  onProjectSelect: (project: SensorFolder) => void;
  onProjectStatusChange?: (
    projectId: string,
    status: 'running' | 'stopped'
  ) => void;
  onProjectDelete?: (projectId: string) => void;
  className?: string;
  onDialogChange?: (isOpen: boolean) => void;
}
const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  isLoading,
  onProjectSelect,
  onProjectStatusChange,
  onProjectDelete,
  className,
  onDialogChange
}) => {
  const [confirmingDelete, setConfirmingDelete] = useState<SensorFolder | null>(null);
  const [confirmingStatusChange, setConfirmingStatusChange] = useState<SensorFolder | null>(null);

  // Notify parent when any dialog opens/closes
  useEffect(() => {
    onDialogChange?.(!!confirmingDelete || !!confirmingStatusChange);
  }, [confirmingDelete, confirmingStatusChange, onDialogChange]);

  const handleDelete = useCallback(
    (e: React.MouseEvent, project: SensorFolder) => {
      e.stopPropagation(); // Prevent card click event
      if (project.status === 'running') {
        toast.error(
          'Cannot delete a running project. Stop it first.'
        );
        return;
      }
      setConfirmingDelete(project);
    },
    []
  );

  const confirmDelete = useCallback(() => {
    if (confirmingDelete && onProjectDelete) {
      onProjectDelete(confirmingDelete.id);
      setConfirmingDelete(null);
    }
  }, [confirmingDelete, onProjectDelete]);

  const handleStatusChange = (e: React.MouseEvent, project: SensorFolder) => {
    e.stopPropagation(); // Prevent card click event
    if (!onProjectStatusChange) return;

    const newStatus = project.status === 'running' ? 'stopped' : 'running';

    if (newStatus === 'running' && !project.assignedSensorImeis?.length) {
      toast.error('Cannot start project without assigned sensors');
      return;
    }

    setConfirmingStatusChange(project);
  };

  const confirmStatusChange = useCallback(() => {
    if (!confirmingStatusChange || !onProjectStatusChange) return;

    const newStatus = confirmingStatusChange.status === 'running' ? 'stopped' : 'running';

    try {
      if (newStatus === 'running') {
        startProjectDataCollection(confirmingStatusChange);
        toast.success(
          `Started data collection for ${confirmingStatusChange.name}`
        );
      } else {
        stopProjectDataCollection(confirmingStatusChange.id);
        toast.success(
          `Stopped data collection for ${confirmingStatusChange.name}`
        );
      }

      onProjectStatusChange(confirmingStatusChange.id, newStatus);
    } catch (error) {
      console.error('Error changing project status:', error);
      toast.error('Failed to change project status');
    } finally {
      setConfirmingStatusChange(null);
    }
  }, [confirmingStatusChange, onProjectStatusChange]);

	if (isLoading) {
		return (
			<div className={cn('space-y-1 sm:space-y-2', className)}>
				{[1, 2, 3].map((_, index) => (
					<Card key={index} className="animate-pulse-soft">
						<CardContent className="p-2 sm:p-3">
							<div className="h-4 sm:h-5 bg-secondary rounded w-2/3 mb-1 sm:mb-2"></div>
							<div className="h-3 sm:h-4 bg-secondary rounded-full w-full opacity-50"></div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (projects.length === 0) {
		return (
			<div className={cn('p-2 sm:p-4', className)}>
				<div className="h-full flex flex-col items-center justify-center space-y-1 sm:space-y-2">
					<p className="text-sm sm:text-base text-muted-foreground">No started projects</p>
					<p className="text-[10px] sm:text-xs text-muted-foreground">
						Projects will appear here when started
					</p>
				</div>
			</div>
		);
	}

	return (
	  <>
	    <div className={cn('space-y-1 sm:space-y-2', className)}>
	      {projects.map((project) => (
	        <Card
	          key={project.id}
	          className="hover:bg-accent/50 transition-colors cursor-pointer"
	          onClick={() => onProjectSelect(project)}
	        >
	          <CardContent className="p-2 sm:p-3">
	            <div className="flex justify-between items-start">
	              <div className="min-w-0 flex-1 mr-2">
	                <h3 className="font-medium text-xs sm:text-sm">
	                  {project.name}
	                </h3>
	                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
	                  {project.address ||
	                    project.description ||
	                    project.projectNumber}
	                </p>
	              </div>
	              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
	                <div className="hidden xs:flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-xs text-muted-foreground">
	                  {project.location && (
	                    <MapPin className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
	                  )}
	                  <span className="flex items-center gap-0.5 sm:gap-1">
	                    <Cpu className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
	                    {project.assignedSensorImeis?.length ||
	                      0}
	                  </span>
	                  <span
	                    className={cn(
	                      'flex items-center',
	                      project.status === 'running'
	                        ? 'text-green-500'
	                        : 'text-muted-foreground'
	                    )}
	                  >
	                    •
	                  </span>
	                </div>
	                <div className="flex items-center gap-0.5 sm:gap-1">
	                  {project.location && (
	                    <Button
	                      variant="ghost"
	                      size="icon"
	                      className="h-5 w-5 sm:h-6 sm:w-6"
	                      onClick={(e) => {
	                        e.stopPropagation();
	                        const location = typeof project.location === 'string'
	                          ? JSON.parse(project.location)
	                          : project.location;
	                        if (location.lat && location.lng) {
	                          window.open(
	                            `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`,
	                            '_blank'
	                          );
	                        }
	                      }}
	                    >
	                      <MapPin className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-blue-500" />
	                    </Button>
	                  )}
	                  <Button
	                    variant="ghost"
	                    size="icon"
	                    className="h-5 w-5 sm:h-6 sm:w-6"
	                    onClick={(e) =>
	                      handleStatusChange(e, project)
	                    }
	                  >
	                    {project.status === 'running' ? (
	                      <Square className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-red-500" />
	                    ) : (
	                      <Play className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-green-500" />
	                    )}
	                  </Button>
	                  {onProjectDelete && (
	                    <Button
	                      variant="ghost"
	                      size="icon"
	                      className="h-5 w-5 sm:h-6 sm:w-6"
	                      onClick={(e) =>
	                        handleDelete(e, project)
	                      }
	                    >
	                      <Trash2 className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-muted-foreground hover:text-destructive" />
	                    </Button>
	                  )}
	                </div>
	              </div>
	            </div>
	          </CardContent>
	        </Card>
	      ))}
	    </div>

	    {/* Delete Confirmation Dialog */}
	    <AlertDialog open={!!confirmingDelete} onOpenChange={() => setConfirmingDelete(null)}>
	      <AlertDialogContent className="z-[51]"> {/* Ensure it's above the map */}
	        <AlertDialogHeader>
	          <AlertDialogTitle>Delete Project</AlertDialogTitle>
	          <AlertDialogDescription>
	            Are you sure you want to delete project "{confirmingDelete?.name}"? This action cannot be undone.
	          </AlertDialogDescription>
	        </AlertDialogHeader>
	        <AlertDialogFooter>
	          <AlertDialogCancel>Cancel</AlertDialogCancel>
	          <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
	            Delete Project
	          </AlertDialogAction>
	        </AlertDialogFooter>
	      </AlertDialogContent>
	    </AlertDialog>

	    {/* Status Change Confirmation Dialog */}
	    <AlertDialog open={!!confirmingStatusChange} onOpenChange={() => setConfirmingStatusChange(null)}>
	      <AlertDialogContent className="z-[51]"> {/* Ensure it's above the map */}
	        <AlertDialogHeader>
	          <AlertDialogTitle>
	            {confirmingStatusChange?.status === 'running' ? 'Stop Project' : 'Start Project'}
	          </AlertDialogTitle>
	          <AlertDialogDescription>
	            {confirmingStatusChange?.status === 'running'
	              ? `Are you sure you want to stop project "${confirmingStatusChange?.name}"?`
	              : `Are you sure you want to start project "${confirmingStatusChange?.name}"?`}
	          </AlertDialogDescription>
	        </AlertDialogHeader>
	        <AlertDialogFooter>
	          <AlertDialogCancel>Cancel</AlertDialogCancel>
	          <AlertDialogAction onClick={confirmStatusChange}>
	            {confirmingStatusChange?.status === 'running' ? 'Stop Project' : 'Start Project'}
	          </AlertDialogAction>
	        </AlertDialogFooter>
	      </AlertDialogContent>
	    </AlertDialog>
	  </>
	);
};

export default ProjectsList;
