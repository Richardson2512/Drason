import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Page Not Found | Superkabe',
 description: 'The page you are looking for does not exist or has been moved.',
 robots: { index: false, follow: true },
};

export default function NotFound() {
 return (
 <div className="min-h-screen bg-[#F7F2EB] flex items-center justify-center px-6">
 <div className="text-center max-w-lg">
 <p className="text-7xl font-extrabold text-gray-200 mb-4">404</p>
 <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
 <p className="text-gray-500 mb-8">
 The page you are looking for does not exist or has been moved.
 </p>
 <div className="flex items-center justify-center gap-4">
 <Link
 href="/"
 className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
 >
 Go Home
 </Link>
 <Link
 href="/docs"
 className="px-6 py-3 bg-white text-gray-700 rounded-full font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
 >
 Documentation
 </Link>
 </div>
 </div>
 </div>
 );
}
