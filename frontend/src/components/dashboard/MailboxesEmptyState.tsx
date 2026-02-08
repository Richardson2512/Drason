import Link from 'next/link';
import { Mail, Settings, RefreshCw } from 'lucide-react';

export default function MailboxesEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="bg-gray-800/50 p-6 rounded-full mb-6 border border-gray-700">
                <Mail size={48} className="text-purple-500" />
            </div>

            <h2 className="text-2xl font-bold mb-3 text-white">No Mailboxes Connected</h2>
            <p className="text-gray-400 max-w-md mb-8">
                Drason needs to see your mailboxes to protect them. Connect your sending platform to import active mailboxes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/settings" className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    <Settings size={18} className="mr-2" />
                    Connect Integrations
                </Link>
                <button disabled className="flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors opacity-50 cursor-not-allowed" title="Auto-syncs periodically">
                    <RefreshCw size={18} className="mr-2" />
                    Sync Mailboxes
                </button>
            </div>
        </div>
    );
}
