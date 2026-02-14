import { useState } from 'react';
import { Rocket, Import, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function CampaignsEmptyState() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleImport = async () => {
        setLoading(true);
        setMsg('');
        try {
            const data = await apiClient<any>('/api/sync', { method: 'POST', timeout: 120_000 });
            setMsg(`Success! Synced ${data.campaigns_synced} campaigns. Refreshing...`);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            setMsg(`Error: ${error.message || 'Failed to sync'}`);
        } finally {
            setLoading(false);
        }
    };

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
                Your campaigns drive your outreach. Connect to your sending platforms or create a new campaign to start monitoring performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                    onClick={handleImport}
                    disabled={loading}
                    className="flex items-center justify-center px-8 py-4 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={20} className="mr-3 animate-spin" /> : <Import size={20} className="mr-3" />}
                    {loading ? 'Importing...' : 'Import from Smartlead'}
                </button>
            </div>
            {msg && (
                <div className={`mt-6 font-medium ${msg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                    {msg}
                </div>
            )}
        </div>
    );
}
