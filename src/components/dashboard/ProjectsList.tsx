import React, { useCallback } from 'react';
import { SensorFolder } from '@/types/users';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Cpu, Play, Square, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
}
const ProjectsList: React.FC<ProjectsListProps> = ({
	projects,
	isLoading,
	onProjectSelect,
	onProjectStatusChange,
	onProjectDelete,
	className
}) => {
	const handleDelete = useCallback(
		(e: React.MouseEvent, project: SensorFolder) => {
			e.stopPropagation(); // Prevent card click event
			if (onProjectDelete) {
				// If the project is running, prevent deletion
				if (project.status === 'running') {
					toast.error(
						'Cannot delete a running project. Stop it first.'
					);
					return;
				}
				onProjectDelete(project.id);
			}
		},
		[onProjectDelete]
	);

	const handleStatusChange = (e: React.MouseEvent, project: SensorFolder) => {
		e.stopPropagation(); // Prevent card click event
		if (onProjectStatusChange) {
			const newStatus =
				project.status === 'running' ? 'stopped' : 'running';

			try {
				if (newStatus === 'running') {
					if (!project.assignedSensorImeis?.length) {
						toast.error(
							'Cannot start project without assigned sensors'
						);
						return;
					}
					startProjectDataCollection(project);
					toast.success(
						`Started data collection for ${project.name}`
					);
				} else {
					stopProjectDataCollection(project.id);
					toast.success(
						`Stopped data collection for ${project.name}`
					);
				}

				onProjectStatusChange(project.id, newStatus);
			} catch (error) {
				console.error('Error changing project status:', error);
				toast.error('Failed to change project status');
			}
		}
	};

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
	);
};

export default ProjectsList;
