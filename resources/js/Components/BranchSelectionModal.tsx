import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import { Download } from 'lucide-react';

interface Branch {
    id: number;
    name: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (branchId: number | null) => void;
    branches: Branch[];
    title?: string;
    description?: string;
    processing?: boolean;
}

export default function BranchSelectionModal({
    isOpen,
    onClose,
    onConfirm,
    branches,
    title = "Select Branch",
    description = "Please select a branch to export data/report.",
    processing = false
}: Props) {
    const [selectedBranch, setSelectedBranch] = useState<string>('');

    const handleSubmit = () => {
        onConfirm(selectedBranch ? Number(selectedBranch) : null);
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    {description}
                </p>

                <div className="mt-6">
                    <label htmlFor="branch_select" className="block text-sm font-medium text-gray-700 mb-2">
                        Branch
                    </label>
                    <select
                        id="branch_select"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                        <option value="">All Branches</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>

                    <PrimaryButton onClick={handleSubmit} disabled={processing} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
