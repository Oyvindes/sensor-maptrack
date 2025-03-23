import { toast } from 'sonner';
import { SensorFolder } from '@/types/users';
import { getCurrentUser } from '@/services/authService';
import { useState } from 'react';
import {
	saveSensorFolder,
	updateProjectStatus
} from '@/services/folder/supabaseFolderService';
import { deleteFolder } from '@/services/folder/folderService';
import { fetchSensors } from '@/services/sensor/supabaseSensorService';

export function useProjectManagement() {
	const [isGeneratingReportOnStop, setIsGeneratingReportOnStop] =
		useState(false);
	const [selectedDataTypesForReport, setSelectedDataTypesForReport] =
		useState<string[]>([]);
	const currentUser = getCurrentUser();

	const handleProjectSave = async (
		updatedProject: SensorFolder,
		projects: SensorFolder[],
		setProjects: React.Dispatch<React.SetStateAction<SensorFolder[]>>,
		setIsUpdatingProject: React.Dispatch<React.SetStateAction<boolean>>,
		setEditingProject: React.Dispatch<React.SetStateAction<boolean>>,
		setSelectedProject: React.Dispatch<
			React.SetStateAction<SensorFolder | null>
		>
	) => {
		setIsUpdatingProject(true);

		try {
			// Save to Supabase
			const result = await saveSensorFolder(updatedProject);

			if (!result.success) {
				throw new Error(result.message);
			}

			// Update local state with the saved project that has proper IDs
			if (result.data) {
				const isNew = !projects.some((p) => p.id === result.data?.id);

				if (isNew) {
					setProjects([...projects, result.data]);
				} else {
					setProjects(
						projects.map((project) =>
							project.id === result.data?.id
								? result.data
								: project
						)
					);
				}
			}

			toast.success(result.message);
			setEditingProject(false);
			setSelectedProject(null);
		} catch (error) {
			console.error('Error saving project:', error);
			toast.error('Failed to save project: ' + error.message);
		} finally {
			setIsUpdatingProject(false);
		}
	};

	const handleAddNewProject = (
		setSelectedProject: React.Dispatch<
			React.SetStateAction<SensorFolder | null>
		>,
		setEditingProject: React.Dispatch<React.SetStateAction<boolean>>
	) => {
		const newProject: SensorFolder = {
		  id: `temp-${Date.now()}`,
		  name: '',
		  description: '',
		  companyId: currentUser?.companyId || '',
		  createdAt: new Date().toISOString().split('T')[0],
		  createdBy: currentUser?.id,
		  creatorName: currentUser?.name,
		  projectNumber: `PRJ-${new Date().getFullYear()}-${Math.floor(
		    Math.random() * 1000
		  )
		    .toString()
		    .padStart(3, '0')}`,
		  address: '',
		  assignedSensorImeis: [],
		  insuranceCompany: undefined
		};

		setSelectedProject(newProject);
		setEditingProject(true);
	};

	// Set default data types for automatic PDF reports (when stopping projects)
	const setDefaultDataTypes = (dataTypes: string[]) => {
		setSelectedDataTypesForReport(dataTypes);
	};

	const handleProjectStatusChange = async (
		projectId: string,
		newStatus: 'running' | 'stopped',
		projects: SensorFolder[],
		setProjects: React.Dispatch<React.SetStateAction<SensorFolder[]>>,
		dataTypesToInclude?: string[]
	) => {
		try {
			// First check if the project exists
			const project = projects.find((p) => p.id === projectId);
			if (!project) {
				throw new Error('Project not found');
			}

			// Check if user has permission to update this project
			const currentUser = getCurrentUser();
			if (!currentUser) {
				throw new Error('User not authenticated');
			}

			// Update status in database
			const result = await updateProjectStatus(projectId, newStatus);

			if (!result.success) {
				throw new Error(result.message);
			}

			// Update local state
			const updatedProjects = projects.map((p) =>
				p.id === projectId
					? {
							...p,
							status: newStatus,
							startedAt:
								newStatus === 'running'
									? new Date().toISOString()
									: p.startedAt,
							stoppedAt:
								newStatus === 'stopped'
									? new Date().toISOString()
									: p.stoppedAt
					  }
					: p
			);

			setProjects(updatedProjects);
			toast.success(result.message);

			// Generate and download PDF report when stopping a project
			if (newStatus === 'stopped') {
				setIsGeneratingReportOnStop(true);
				try {
					const { downloadProjectReport } = await import(
						'@/services/pdfService'
					);
					const updatedProject = updatedProjects.find(
						(p) => p.id === projectId
					);

					if (updatedProject) {
						// Use provided data types, selected data types, or all data types
						const dataTypes =
							dataTypesToInclude ||
							selectedDataTypesForReport.length > 0
								? selectedDataTypesForReport
								: [
										'humidity',
										'adc1',
										'temperature',
										'battery',
										'signal'
								  ];

						const projectWithHistory = await downloadProjectReport(
							updatedProject,
							dataTypes
						);

						// Update project with the new PDF history
						const finalUpdatedProjects = updatedProjects.map((p) =>
							p.id === projectId ? projectWithHistory : p
						);

						setProjects(finalUpdatedProjects);
						toast.success('Project report generated successfully');
					}
				} catch (error) {
					console.error(
						'Error generating PDF on project stop:',
						error
					);
					toast.error('Failed to generate project report');
					// Continue even if PDF generation fails
				} finally {
					setIsGeneratingReportOnStop(false);
				}
			}

			return true;
		} catch (error) {
			console.error('Error updating project status:', error);
			toast.error('Failed to update project status: ' + (error instanceof Error ? error.message : 'Unknown error'));
			
			// If we get a black screen error, reload the page
			if (error instanceof Error && error.message.includes('black screen')) {
				window.location.reload();
			}
			
			return false;
		}
	};
	const handleProjectDelete = async (
		projectId: string,
		projects: SensorFolder[],
		setProjects: React.Dispatch<React.SetStateAction<SensorFolder[]>>,
		setSelectedProject: React.Dispatch<
			React.SetStateAction<SensorFolder | null>
		>
	) => {
		try {
			const result = await deleteFolder(projectId);

			if (!result.success) {
				throw new Error(result.message);
			}

			setProjects(projects.filter((p) => p.id !== projectId));
			setSelectedProject(null);
			toast.success('Project deleted successfully');

			return true;
		} catch (error) {
			console.error('Error deleting project:', error);
			toast.error('Failed to delete project: ' + error.message);
			return false;
		}
	};

	return {
		handleProjectSave,
		handleAddNewProject,
		handleProjectStatusChange,
		handleProjectDelete,
		setDefaultDataTypes,
		isGeneratingReportOnStop
	};
}
