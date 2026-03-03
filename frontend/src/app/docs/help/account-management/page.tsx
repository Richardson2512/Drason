import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Do I Manage My Account? | Superkabe Help',
    description: 'Learn how to update your profile, change your password, and manage your organization settings in Superkabe.',
    alternates: { canonical: '/docs/help/account-management' },
    openGraph: {
        title: 'How Do I Manage My Account? | Superkabe Help',
        description: 'Learn how to update your profile, change your password, and manage your organization settings in Superkabe.',
        url: '/docs/help/account-management',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function AccountManagementPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                How Do I Manage My Account?
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Updating your profile, changing your password, and managing organization settings in Superkabe
            </p>

            {/* Quick Answer */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800 mb-4">
                    Your account settings are managed from <strong>Dashboard &rarr; Profile</strong>.
                    You can update your display name, change your password, and view your organization details.
                    Email addresses cannot be changed after registration.
                </p>
            </div>

            {/* How to Update Profile */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How Do I Update My Profile?</h2>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-8 mb-12">
                <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Navigate to Profile</h3>
                            <p className="text-gray-600 text-sm">Click your profile icon in the dashboard sidebar, or go to <strong>Dashboard &rarr; Profile</strong>.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Edit Your Name</h3>
                            <p className="text-gray-600 text-sm">Update the <strong>Full Name</strong> field to change your display name across the platform. Your email address is read-only and cannot be changed.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Save Changes</h3>
                            <p className="text-gray-600 text-sm">Click <strong>Save Changes</strong>. You'll see a green confirmation message when the update succeeds.</p>
                        </div>
                    </li>
                </ol>
            </div>

            {/* How to Change Password */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How Do I Change My Password?</h2>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">
                <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Enter Current Password</h3>
                            <p className="text-gray-600 text-sm">Verify your identity by entering your current password.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Set New Password</h3>
                            <p className="text-gray-600 text-sm">Enter a new password with a minimum of <strong>8 characters</strong>. Use a mix of letters, numbers, and symbols for best security.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Confirm New Password</h3>
                            <p className="text-gray-600 text-sm">Re-enter your new password to confirm. Both fields must match exactly.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Click Change Password</h3>
                            <p className="text-gray-600 text-sm">A success message confirms the change. You'll remain logged in with your new password.</p>
                        </div>
                    </li>
                </ol>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-12 rounded-r-lg">
                <h3 className="text-lg font-bold text-red-900 mb-2">Password Requirements</h3>
                <ul className="space-y-1 text-sm text-red-800">
                    <li>&#x2022; Minimum 8 characters</li>
                    <li>&#x2022; Current password required for verification</li>
                    <li>&#x2022; Confirmation must match new password exactly</li>
                </ul>
            </div>

            {/* FAQ Section */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4 mb-12">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Can I change my email address?</h3>
                    <p className="text-gray-600 text-sm">
                        No. Your email address is tied to your account identity and cannot be changed after registration.
                        If you need to use a different email, create a new account and contact <a href="mailto:support@superkabe.com" className="text-blue-600 hover:underline">support@superkabe.com</a> to transfer your organization.
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Can I delete my account?</h3>
                    <p className="text-gray-600 text-sm">
                        Contact <a href="mailto:support@superkabe.com" className="text-blue-600 hover:underline">support@superkabe.com</a> to request account deletion.
                        All monitoring will stop and your data will be permanently removed.
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">How do I sign in with Google?</h3>
                    <p className="text-gray-600 text-sm">
                        If you registered with Google OAuth, click <strong>Continue with Google</strong> on the login page.
                        Your Google account is linked to your Superkabe account automatically.
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">What organization details can I see?</h3>
                    <p className="text-gray-600 text-sm">
                        Your profile page shows your organization name and ID. These are set during onboarding and are used to scope all your data
                        (leads, domains, mailboxes, campaigns) within Superkabe.
                    </p>
                </div>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/billing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How Does Billing Work?
                    </a>
                    <a href="/docs/getting-started" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Getting Started with Superkabe
                    </a>
                    <a href="/docs/configuration" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Configuration Guide
                    </a>
                </div>
            </div>
        </div>
    );
}
