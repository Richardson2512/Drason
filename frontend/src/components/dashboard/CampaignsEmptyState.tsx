import Link from 'next/link';
import { Rocket, Plus } from 'lucide-react';

export default function CampaignsEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full"></div>
                <div className="relative bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                    <Rocket size={64} className="text-blue-600" />
                </div>
            </div>

            <h2 className="text-3xl font-extrabold mb-4 text-gray-900 tracking-tight">No Campaigns Yet</h2>
            <p className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed">
                Build your first multi-step sequence to start sending from Superkabe. Every send runs through the deliverability protection layer automatically.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/dashboard/sequencer/campaigns" className="premium-btn flex items-center justify-center px-8 py-4 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
                    <Plus size={20} className="mr-3" />
                    New Campaign
                </Link>
            </div>
        </div>
    );
}
