import React, { useState } from 'react';
import { SectionContainer, SectionTitle } from '@/components/Layout';
import { SensorFolder } from '@/types/users';
import ProjectsMap from './ProjectsMap';
import ProjectsList from './ProjectsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectsSectionProps {
	projects: SensorFolder[];
	isLoading: boolean;
	onProjectSelect: (project: SensorFolder) => void;
	onProjectStatusChange?: (
		projectId: string,
		status: 'running' | 'stopped'
	) => void;
	onProjectDelete?: (projectId: string) => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
	projects,
	isLoading,
	onProjectSelect,
	onProjectStatusChange,
	onProjectDelete
}) => {
	const [currentTab, setCurrentTab] = useState<string>('map');
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Filter projects for different views
	const runningProjects = projects.filter((p) => p.status === 'running');
	const stoppedProjects = projects.filter((p) => p.status === 'stopped');

	// Handle dialog state changes
	const handleDialogChange = (open: boolean) => {
		setIsDialogOpen(open);
		if (open && currentTab === 'map') {
			setCurrentTab('list');
		}
	};

	return (
		<SectionContainer>
			<SectionTitle className="text-lg sm:text-xl md:text-2xl">
				Projects Overview
			</SectionTitle>

			<Tabs
				value={currentTab}
				onValueChange={setCurrentTab}
				className="w-full"
			>
				<TabsList className="mb-2 sm:mb-4 h-8 sm:h-10">
					<TabsTrigger
						value="map"
						className="text-xs sm:text-sm h-7 sm:h-9"
					>
						Map View
					</TabsTrigger>
					<TabsTrigger
						value="list"
						className="text-xs sm:text-sm h-7 sm:h-9"
					>
						List View
					</TabsTrigger>
				</TabsList>

				<TabsContent value="map" className="space-y-3 sm:space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
						<div className="lg:col-span-2 glass-card rounded-xl overflow-hidden">
							<ProjectsMap
								projects={runningProjects}
								isLoading={isLoading}
								onProjectSelect={onProjectSelect}
								className="w-full h-[250px] sm:h-[300px] md:h-[400px] animate-fade-up [animation-delay:300ms]"
							/>
						</div>
						<div className="flex flex-col glass-card rounded-xl h-[300px] sm:h-[350px] md:h-[433px]">
							<h3 className="text-sm sm:text-base font-semibold p-2 sm:p-3 animate-fade-up [animation-delay:350ms]">
								Running Projects
							</h3>
							<div className="flex-1 overflow-hidden">
								<ProjectsList
									projects={runningProjects}
									isLoading={isLoading}
									onProjectSelect={onProjectSelect}
									onProjectStatusChange={
										onProjectStatusChange
									}
									onProjectDelete={onProjectDelete}
									onDialogChange={handleDialogChange}
									className="h-full overflow-auto animate-fade-up [animation-delay:400ms]"
								/>
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="list" className="space-y-3 sm:space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
						<div className="flex flex-col glass-card rounded-xl h-[250px] sm:h-[300px] md:h-[400px]">
							<h3 className="text-sm sm:text-base font-semibold p-2 sm:p-3 animate-fade-up [animation-delay:350ms]">
								Running Projects
							</h3>
							<div className="flex-1 overflow-hidden">
								<ProjectsList
									projects={runningProjects}
									isLoading={isLoading}
									onProjectSelect={onProjectSelect}
									onProjectStatusChange={
										onProjectStatusChange
									}
									onProjectDelete={onProjectDelete}
									onDialogChange={handleDialogChange}
									className="h-full overflow-auto animate-fade-up [animation-delay:400ms]"
								/>
							</div>
						</div>

						<div className="flex flex-col glass-card rounded-xl h-[250px] sm:h-[300px] md:h-[400px]">
							<h3 className="text-sm sm:text-base font-semibold p-2 sm:p-3 animate-fade-up [animation-delay:350ms]">
								Stopped Projects
							</h3>
							<div className="flex-1 overflow-hidden">
								<ProjectsList
									projects={stoppedProjects}
									isLoading={isLoading}
									onProjectSelect={onProjectSelect}
									onProjectStatusChange={
										onProjectStatusChange
									}
									onProjectDelete={onProjectDelete}
									onDialogChange={handleDialogChange}
									className="h-full overflow-auto animate-fade-up [animation-delay:400ms]"
								/>
							</div>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</SectionContainer>
	);
};

export default ProjectsSection;
