import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Company } from '@/types/users';

interface CompanySelectorProps {
	companyId: string;
	companies: Company[];
	isMasterAdmin: boolean;
	onCompanyChange: (companyId: string) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
	companyId,
	companies,
	isMasterAdmin,
	onCompanyChange
}) => {
	return (
		<div className="space-y-2">
			<Label htmlFor="company">Company</Label>
			{isMasterAdmin ? (
				<Select value={companyId} onValueChange={onCompanyChange}>
					<SelectTrigger>
						<SelectValue placeholder="Select company" />
					</SelectTrigger>
					<SelectContent>
						{companies.map((company) => (
							<SelectItem key={company.id} value={company.id}>
								{company.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			) : (
				<Input
					id="company"
					value={
						companies.find((c) => c.id === companyId)?.name || ''
					}
					disabled
					className="bg-muted"
				/>
			)}
		</div>
	);
};

export default CompanySelector;
