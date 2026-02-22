import { useState } from 'react';
import Link from 'next/link';
import { Mail, Settings, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function MailboxesEmptyState() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSync = async () => {
        setLoading(true);
        setMsg('');
        try {
            const data = await apiClient<any>('/api/sync', { method: 'POST', timeout: 120_000 });
            setMsg(`Success! Synced ${data.mailboxes_synced} mailboxes. Refreshing...`);
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
                <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-full"></div>
                <div className="relative bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                    <Mail size={64} className="text-purple-600" />
                </div>
            </div>

            <h2 className="text-3xl font-extrabold mb-4 text-gray-900 tracking-tight">No Mailboxes Connected</h2>
            <p className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed">
                Superkabe needs to see your mailboxes to protect them. Connect your sending platform to import active mailboxes automatically.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/dashboard/settings" className="premium-btn flex items-center justify-center px-8 py-4 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
                    <Settings size={20} className="mr-3" />
                    Connect Integrations
                </Link>
                <button
                    onClick={handleSync}
                    disabled={loading}
                    className="group flex items-center justify-center px-8 py-4 bg-white border border-gray-200 text-gray-700 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 rounded-xl font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={20} className={`mr-3 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
                    {loading ? 'Syncing...' : 'Sync Mailboxes'}
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
