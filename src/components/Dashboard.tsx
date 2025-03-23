import React, { useState, useEffect } from 'react';
import SensorDataGraphs from './dashboard/SensorDataGraphs';
import { PageContainer, ContentContainer } from './Layout';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardHeader from './dashboard/DashboardHeader';
import ProjectsSection from './dashboard/ProjectsSection';
import SensorFolderEditor from './admin/SensorFolderEditor';
import { companyService } from '@/services/company';
import { Company } from '@/types/users';
import DashboardNavigation from './dashboard/DashboardNavigation';
import { useTranslation } from 'react-i18next';
import ProjectsList from './dashboard/ProjectsList';
import TrackingSection from './dashboard/TrackingSection';
import HelpSection from './dashboard/HelpSection';
import StoreSection from './dashboard/StoreSection';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
// View types for the dashboard
export type DashboardView = 'dashboard' | 'projects' | 'tracking' | 'help' | 'store';

interface DashboardProps {
	initialView?: DashboardView;
	onViewChange?: (view: DashboardView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ initialView = 'dashboard', onViewChange }) => {
	const { t } = useTranslation();
	const [currentView, setCurrentView] = useState<DashboardView>(initialView);
	const [companies, setCompanies] = useState<Company[]>([]);
	const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

	const {
		projects,
		isLoading,
		selectedProject,
		editingProject,
		handleProjectSelect,
		handleProjectSave,
		handleProjectCancel,
		handleAddNewProject,
		handleRefresh,
		handleProjectStatusChange,
		handleProjectDelete,
		viewingSensorData,
		handleCloseGraphs
	} = useDashboardData();

	// Fetch companies for the folder editor
	useEffect(() => {
		const fetchCompanies = async () => {
			setIsLoadingCompanies(true);
			try {
				const companiesData = await companyService.list();
				setCompanies(companiesData);
			} catch (error) {
				console.error('Error fetching companies:', error);
				toast.error('Failed to load companies');
			} finally {
				setIsLoadingCompanies(false);
			}
		};

		fetchCompanies();
	}, []);

	// Toggle between views
	const handleViewChange = (view: DashboardView) => {
		setCurrentView(view);
		// Call the onViewChange prop if provided
		if (onViewChange) {
			onViewChange(view);
		}
	};

	return (
		<PageContainer>
			<DashboardHeader onViewChange={handleViewChange} />

			<DashboardNavigation
				currentView={currentView}
				onViewChange={handleViewChange}
			/>

			<ContentContainer className="pt-4 container">
				{viewingSensorData && selectedProject ? (
					<SensorDataGraphs
						project={selectedProject}
						onClose={handleCloseGraphs}
					/>
				) : editingProject && selectedProject ? (
					// Show loading state while companies are being fetched
					isLoadingCompanies ? (
						<div className="flex items-center justify-center p-8">
							<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
						</div>
					) : (
						<SensorFolderEditor
							folder={selectedProject}
							companies={companies}
							onSave={handleProjectSave}
							onCancel={handleProjectCancel}
						/>
					)
				) : currentView === 'dashboard' ? (
					<ProjectsSection
						projects={projects}
						isLoading={isLoading}
						companies={companies}
						onProjectSelect={handleProjectSelect}
						onProjectStatusChange={handleProjectStatusChange}
						onProjectDelete={handleProjectDelete}
					/>
				) : currentView === 'tracking' ? (
					<TrackingSection className="w-full animate-fade-up [animation-delay:300ms]" />
				) : currentView === 'help' ? (
					<HelpSection className="w-full animate-fade-up [animation-delay:300ms]" />
				) : currentView === 'store' ? (
					<StoreSection className="w-full animate-fade-up [animation-delay:300ms]" />
				) : (
					<div className="w-full animate-fade-up [animation-delay:300ms]">
						<h2 className="text-xl font-semibold mb-2">Projects</h2>
						<div className="flex justify-start mb-6">
							<Button
								onClick={handleAddNewProject}
								size="sm"
								className="h-12 px-4"
							>
								<span className="flex flex-col items-center gap-1">
									<Plus className="h-4 w-4" />
									<span className="text-[10px]">{t('buttons.new')}</span>
								</span>
							</Button>
						</div>
						<ProjectsList
							projects={projects}
							isLoading={isLoading}
							companies={companies}
							onProjectSelect={handleProjectSelect}
							onProjectStatusChange={handleProjectStatusChange}
							onProjectDelete={handleProjectDelete}
							className="h-auto w-full"
						/>
					</div>
				)}
			</ContentContainer>
		</PageContainer>
	);
};

export default Dashboard;
