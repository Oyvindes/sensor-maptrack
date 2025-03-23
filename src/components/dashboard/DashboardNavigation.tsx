import React from 'react';
import { Button } from '@/components/ui/button';
import {
	LayoutGrid,
	FolderKanban,
	Radar,
	HelpCircle,
	Store,
	Stethoscope,
	ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { hasAdminAccess } from '@/utils/authUtils';
import { useTranslation } from 'react-i18next';

type DashboardView = 'dashboard' | 'projects' | 'tracking' | 'help' | 'store';

interface DashboardNavigationProps {
	currentView: DashboardView;
	onViewChange: (view: DashboardView) => void;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
	currentView,
	onViewChange
}) => {
	const { t } = useTranslation();
	
	return (
		<div className="container sticky top-[60px] z-10 bg-background mb-2 sm:mb-6 shadow-sm animate-fade-up [animation-delay:150ms]">
			<div className="flex flex-wrap gap-1 sm:gap-0 sm:space-x-2 border-b px-2 sm:px-4 pt-1 sm:pt-2">
				<NavigationButton
					view="dashboard"
					currentView={currentView}
					onViewChange={onViewChange}
					icon={<LayoutGrid className="w-4 h-4 mr-2" />}
					label={t('navigation.overview')}
				/>
				<NavigationButton
					view="projects"
					currentView={currentView}
					onViewChange={onViewChange}
					icon={<FolderKanban className="w-4 h-4" />}
					label={t('navigation.projects')}
				/>
				<NavigationButton
					view="tracking"
					currentView={currentView}
					onViewChange={onViewChange}
					icon={<Radar className="w-4 h-4" />}
					label={t('navigation.track')}
				/>
				<NavigationButton
					view="help"
					currentView={currentView}
					onViewChange={onViewChange}
					icon={<HelpCircle className="w-4 h-4" />}
					label={t('navigation.support')}
				/>
				<NavigationButton
					view="store"
					currentView={currentView}
					onViewChange={onViewChange}
					icon={<Store className="w-4 h-4" />}
					label={t('navigation.shop')}
				/>

				{/* Admin tab - Only visible to admin users */}
				{hasAdminAccess() && (
					<div className="group relative">
						<Link to="/admin" className="inline-flex">
							<Button
								variant="ghost"
								className={cn(
									'rounded-none border-b-2 -mb-px px-2 sm:px-4 py-2 h-auto min-w-[64px]',
									'border-transparent text-muted-foreground hover:text-foreground'
								)}
								aria-label={t('navigation.admin')}
							>
								<ShieldCheck className="w-4 h-4" />
								<span className="text-[10px] mt-1">{t('navigation.admin')}</span>
							</Button>
						</Link>
					</div>
				)}

				{/* Sensor Health Check - Direct link to the page */}
				<div className="group relative">
					<Link to="/sensor-health-check" className="inline-flex">
						<Button
							variant="ghost"
							className={cn(
								'rounded-none border-b-2 -mb-px px-2 sm:px-4 py-2 h-auto min-w-[64px]',
								'border-transparent text-muted-foreground hover:text-foreground'
							)}
							aria-label={t('navigation.check')}
						>
							<Stethoscope className="w-4 h-4" />
							<span className="text-[10px] mt-1">{t('navigation.check')}</span>
						</Button>
					</Link>
					{/* Removed redundant tooltip */}
				</div>
			</div>
		</div>
	);
};

// Map view types to URLs
const viewToUrl = {
	dashboard: '/overview',
	projects: '/projects',
	tracking: '/track',
	help: '/support',
	store: '/shop'
};

interface NavigationButtonProps {
	view: DashboardView;
	currentView: DashboardView;
	onViewChange: (view: DashboardView) => void;
	icon: React.ReactNode;
	label: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
	view,
	currentView,
	onViewChange,
	icon,
	label
}) => {
	const isActive = currentView === view;
	const url = viewToUrl[view];

	return (
		<div className="group relative">
			<Link to={url} className="inline-flex">
				<Button
					variant="ghost"
					className={cn(
						'rounded-none border-b-2 -mb-px px-2 sm:px-4 py-2 h-auto min-w-[64px]',
						isActive
							? 'border-primary text-primary'
							: 'border-transparent text-muted-foreground hover:text-foreground'
					)}
					onClick={() => onViewChange(view)}
					aria-label={label}
				>
					{icon}
					<span className="text-[10px] mt-1">{label}</span>
				</Button>
			</Link>
			{/* Removed redundant tooltip */}
		</div>
	);
};

export default DashboardNavigation;
