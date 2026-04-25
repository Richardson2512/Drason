import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'How Do Notifications Work? | Superkabe Help',
 description: 'Learn how Superkabe sends real-time alerts for infrastructure events, how to manage notifications, and what each notification type means.',
 alternates: { canonical: '/docs/help/notifications' },
 openGraph: {
 title: 'How Do Notifications Work? | Superkabe Help',
 description: 'Learn how Superkabe sends real-time alerts for infrastructure events, how to manage notifications, and what each notification type means.',
 url: '/docs/help/notifications',
 siteName: 'Superkabe',
 type: 'article',
 },
};

export default function NotificationsPage() {
 return (
 <div className="prose prose-lg text-gray-700 max-w-none">
 <h1 className="text-5xl font-bold mb-6 text-gray-900">
 How Do Notifications Work?
 </h1>
 <p className="text-xl text-gray-500 mb-12">
 Understanding Superkabe's alert system and how to stay informed about your infrastructure health
 </p>

 {/* Quick Answer */}
 <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 ">
 <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
 <p className="text-blue-800 mb-4">
 Superkabe sends <strong>real-time notifications</strong> whenever something important happens to your infrastructure &mdash;
 mailbox pauses, bounce threshold warnings, recovery completions, and campaign stalls.
 Notifications are categorized by severity so you can prioritize what needs attention.
 </p>
 <p className="text-blue-700 text-sm">
 Access it from <strong>Dashboard &rarr; Notifications</strong> or via the bell icon in the navigation bar.
 </p>
 </div>

 {/* Notification Types */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">What Types of Notifications Does Superkabe Send?</h2>
 <div className="space-y-4 mb-12">
 <div className="bg-white border-2 border-red-200 p-6 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
 🚨
 </div>
 <div className="flex-1">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Error (Critical)</h3>
 <p className="text-gray-600 mb-3">
 Requires immediate attention. Something has failed or been automatically stopped to protect your infrastructure.
 </p>
 <ul className="space-y-1 text-sm text-gray-600">
 <li>&#x2022; Mailbox auto-paused due to bounce threshold exceeded</li>
 <li>&#x2022; Campaign stalled (zero healthy mailboxes remaining)</li>
 <li>&#x2022; Domain blacklisted on major blacklists</li>
 <li>&#x2022; Recovery failed (bounce during healing phase)</li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-white border-2 border-amber-200 p-6 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
 ⚠️
 </div>
 <div className="flex-1">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Warning</h3>
 <p className="text-gray-600 mb-3">
 Something needs your attention soon but hasn't caused a system action yet.
 </p>
 <ul className="space-y-1 text-sm text-gray-600">
 <li>&#x2022; Bounce rate approaching threshold (2-3%)</li>
 <li>&#x2022; Mailbox connection intermittently failing</li>
 <li>&#x2022; DNS record changes detected</li>
 <li>&#x2022; Trial period ending soon</li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-white border-2 border-green-200 p-6 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
 ✅
 </div>
 <div className="flex-1">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Success</h3>
 <p className="text-gray-600 mb-3">
 Good news about your infrastructure.
 </p>
 <ul className="space-y-1 text-sm text-gray-600">
 <li>&#x2022; Mailbox fully recovered and re-added to campaigns</li>
 <li>&#x2022; Domain removed from blacklist</li>
 <li>&#x2022; Recovery phase graduated successfully</li>
 <li>&#x2022; Manual sync completed</li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-white border-2 border-blue-200 p-6 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
 ℹ️
 </div>
 <div className="flex-1">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Info</h3>
 <p className="text-gray-600 mb-3">
 General system updates and status changes.
 </p>
 <ul className="space-y-1 text-sm text-gray-600">
 <li>&#x2022; Platform sync completed</li>
 <li>&#x2022; New mailboxes or domains discovered</li>
 <li>&#x2022; Lead routing rules applied</li>
 <li>&#x2022; System maintenance updates</li>
 </ul>
 </div>
 </div>
 </div>
 </div>

 {/* Managing Notifications */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">How Do I Manage Notifications?</h2>
 <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 p-8 mb-12">
 <div className="space-y-6">
 <div>
 <h3 className="font-bold text-gray-900 mb-2">Filter by Read Status</h3>
 <p className="text-gray-600 text-sm">Toggle between <strong>All</strong> and <strong>Unread Only</strong> to focus on notifications that still need your attention. Unread notifications are highlighted with a light blue background.</p>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-2">Mark as Read</h3>
 <p className="text-gray-600 text-sm">Click <strong>Mark Read</strong> on individual notifications after reviewing them. Or use <strong>Mark All Read</strong> to clear all unread notifications at once.</p>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-2">Pagination</h3>
 <p className="text-gray-600 text-sm">Notifications are paginated (20 per page by default). Use the page controls at the bottom to browse through your notification history.</p>
 </div>
 </div>
 </div>

 {/* Slack Integration */}
 <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 p-8 mb-12">
 <h2 className="text-2xl font-bold mb-4 text-gray-900">Can I Get Notifications on Slack?</h2>
 <p className="text-gray-700 mb-4">
 Yes. Superkabe can send critical alerts directly to your Slack channel in real-time. This ensures your team is notified instantly
 even when no one is logged into the dashboard.
 </p>
 <p className="text-gray-600 mb-4">
 Slack notifications include formatted cards with the alert type, affected entity, and a direct link to the relevant dashboard page.
 </p>
 <a href="/docs/slack-integration" className="inline-block px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-sm">
 Set Up Slack Integration &rarr;
 </a>
 </div>

 {/* Related Articles */}
 <div className="bg-blue-50 border border-blue-200 p-6">
 <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
 <div className="space-y-2">
 <a href="/docs/help/audit-logs" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; How Do Audit Logs Work?
 </a>
 <a href="/docs/slack-integration" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; Slack Integration Guide
 </a>
 <a href="/docs/help/campaign-paused" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; Why Is My Campaign Paused?
 </a>
 </div>
 </div>
 </div>
 );
}
