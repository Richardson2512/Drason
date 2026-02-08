import Link from 'next/link';
import { Rocket, Plus, Import } from 'lucide-react';

export default function CampaignsEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="bg-gray-800/50 p-6 rounded-full mb-6 border border-gray-700">
                <Rocket size={48} className="text-blue-500" />
            </div>

            <h2 className="text-2xl font-bold mb-3 text-white">No Campaigns Yet</h2>
            <p className="text-gray-400 max-w-md mb-8">
                Your campaigns drive your outreach. Connect to your sending platforms or create a new campaign to start monitoring performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/campaigns/new" className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    <Plus size={18} className="mr-2" />
                    Create Campaign
                </Link>
                <button disabled className="flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors opacity-50 cursor-not-allowed" title="Coming soon">
                    <Import size={18} className="mr-2" />
                    Import from Smartlead
                </button>
            </div>
        </div>
    );
}
