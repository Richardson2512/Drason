export default function ConnectionErrorsPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Mailbox Connection Errors
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Understanding why your mailbox is disconnected and how to fix it
            </p>

            {/* Quick Answer */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-red-900">What Does &ldquo;Disconnected&rdquo; Mean?</h2>
                <p className="text-red-800 mb-4">
                    A disconnected mailbox means Superkabe cannot send or receive emails through this account.
                    The SMTP (sending) or IMAP (receiving) connection to your email provider has failed.
                </p>
                <p className="text-red-700 text-sm">
                    <strong>Impact:</strong> Disconnected mailboxes are automatically paused across all campaigns.
                    Leads assigned to this mailbox are rotated to other active mailboxes until the connection is restored.
                </p>
            </div>

            {/* How Superkabe Detects Connection Issues */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How Connection Status Works</h2>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-8 mb-12">
                <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Sync with Smartlead</h3>
                            <p className="text-gray-600 text-sm">Superkabe syncs your mailbox data from Smartlead, which tests SMTP and IMAP connections.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Connection Check (First Priority)</h3>
                            <p className="text-gray-600 text-sm">Before any bounce rate or risk analysis, Superkabe checks if SMTP and IMAP are working.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Status Assignment</h3>
                            <p className="text-gray-600 text-sm">If either connection fails, the mailbox is marked <strong>Disconnected</strong> and paused immediately. If both pass, normal health assessment continues.</p>
                        </div>
                    </li>
                </ol>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* ERROR TYPES */}
            {/* ═══════════════════════════════════════════════════ */}

            <h2 id="error-types" className="text-3xl font-bold mb-6 text-gray-900">Common Connection Errors</h2>

            {/* ── Google OAuth ── */}
            <div id="google-oauth" className="space-y-6 mb-12">
                <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                            🔑
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Google OAuth Token Expired / Revoked</h3>
                            <div className="text-sm text-gray-500 mb-3 font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block">
                                Error: &ldquo;Failed to refresh Google token: invalid_grant&rdquo;
                            </div>
                            <p className="text-gray-600 mb-4">
                                Google requires periodic re-authorization. This happens when:
                            </p>
                            <ul className="space-y-1 text-sm text-gray-600 ml-4 mb-4">
                                <li>• The Google account password was changed</li>
                                <li>• OAuth access was revoked from Google Security settings</li>
                                <li>• The token naturally expired after 6 months of inactivity</li>
                                <li>• Two-factor authentication settings were changed</li>
                            </ul>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <h4 className="font-bold text-green-900 mb-2">✅ How to Fix</h4>
                                <ol className="space-y-2 text-sm text-green-800">
                                    <li>1. Go to <strong>Smartlead → Email Accounts</strong></li>
                                    <li>2. Find the affected mailbox and click <strong>Reconnect</strong></li>
                                    <li>3. Complete the Google OAuth authorization flow</li>
                                    <li>4. Return to Superkabe and trigger a <strong>Manual Sync</strong></li>
                                </ol>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <a
                                    href="https://support.google.com/accounts/answer/3466521"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                                >
                                    📄 Google: Third-party app access
                                </a>
                                <a
                                    href="https://myaccount.google.com/security"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                                >
                                    🔒 Google Account Security
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Authentication Failed ── */}
                <div id="auth-failed" className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                            🔐
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h3>
                            <div className="text-sm text-gray-500 mb-3 font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block">
                                Error: &ldquo;Authentication failed&rdquo; or &ldquo;Invalid credentials&rdquo;
                            </div>
                            <p className="text-gray-600 mb-4">
                                The email password or app password is incorrect or has been changed.
                            </p>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <h4 className="font-bold text-green-900 mb-2">✅ How to Fix</h4>
                                <ol className="space-y-2 text-sm text-green-800">
                                    <li>1. Go to <strong>Smartlead → Email Accounts</strong></li>
                                    <li>2. Update the mailbox password/app password</li>
                                    <li>3. If using Google with 2FA, generate a new <strong>App Password</strong></li>
                                    <li>4. If using Microsoft with 2FA, generate a new <strong>App Password</strong></li>
                                    <li>5. Return to Superkabe and trigger a <strong>Manual Sync</strong></li>
                                </ol>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <a
                                    href="https://support.google.com/accounts/answer/185833"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                                >
                                    📄 Google: App Passwords
                                </a>
                                <a
                                    href="https://support.microsoft.com/en-us/account-billing/manage-app-passwords-for-two-step-verification-d6dc8c6d-4bf7-4851-ad95-6d07799387e9"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                                >
                                    📄 Microsoft: App Passwords
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Connection Refused ── */}
                <div id="connection-refused" className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                            🚫
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Refused / Server Unreachable</h3>
                            <div className="text-sm text-gray-500 mb-3 font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block">
                                Error: &ldquo;Connection refused&rdquo; or &ldquo;ECONNREFUSED&rdquo;
                            </div>
                            <p className="text-gray-600 mb-4">
                                The SMTP or IMAP server is not accepting connections. This usually means the mail server is down or misconfigured.
                            </p>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <h4 className="font-bold text-green-900 mb-2">✅ How to Fix</h4>
                                <ol className="space-y-2 text-sm text-green-800">
                                    <li>1. Verify your email provider&apos;s SMTP/IMAP server addresses in Smartlead</li>
                                    <li>2. Check if your email provider is experiencing an outage</li>
                                    <li>3. Confirm DNS records (MX, A) are resolving correctly</li>
                                    <li>4. If using a custom mail server, check firewall rules for ports 587 (SMTP) and 993 (IMAP)</li>
                                </ol>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <a
                                    href="https://support.google.com/a/answer/176600"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                                >
                                    📄 Google: SMTP & IMAP Settings
                                </a>
                                <a
                                    href="https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                                >
                                    📄 Microsoft: SMTP & IMAP Settings
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Timeout ── */}
                <div id="timeout" className="bg-white border-2 border-orange-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                            ⏱️
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Timeout</h3>
                            <div className="text-sm text-gray-500 mb-3 font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block">
                                Error: &ldquo;Connection timed out&rdquo; or &ldquo;ETIMEDOUT&rdquo;
                            </div>
                            <p className="text-gray-600 mb-4">
                                The mail server is not responding within the expected timeframe. This is usually a temporary issue.
                            </p>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <h4 className="font-bold text-green-900 mb-2">✅ How to Fix</h4>
                                <ol className="space-y-2 text-sm text-green-800">
                                    <li>1. Wait 15-30 minutes and trigger a <strong>Manual Sync</strong> in Superkabe</li>
                                    <li>2. Check your email provider&apos;s status page for outages</li>
                                    <li>3. If persistent, try reconnecting the account in Smartlead</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── SSL/TLS ── */}
                <div id="ssl-tls" className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                            🔒
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">SSL/TLS Certificate Error</h3>
                            <div className="text-sm text-gray-500 mb-3 font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block">
                                Error: &ldquo;Certificate error&rdquo; or &ldquo;SSL handshake failed&rdquo;
                            </div>
                            <p className="text-gray-600 mb-4">
                                The mail server&apos;s SSL certificate is invalid, expired, or the wrong encryption port is being used.
                            </p>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <h4 className="font-bold text-green-900 mb-2">✅ How to Fix</h4>
                                <ol className="space-y-2 text-sm text-green-800">
                                    <li>1. In Smartlead, verify the SMTP port (typically <strong>587</strong> with STARTTLS or <strong>465</strong> with SSL)</li>
                                    <li>2. Verify the IMAP port (typically <strong>993</strong> with SSL)</li>
                                    <li>3. Ensure the server hostname matches the certificate (e.g., <code>smtp.gmail.com</code>, not an IP address)</li>
                                    <li>4. If using a custom mail server, renew the SSL certificate</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* PROVIDER GUIDES */}
            {/* ═══════════════════════════════════════════════════ */}

            <h2 id="provider-guides" className="text-3xl font-bold mb-6 text-gray-900 mt-12">Provider-Specific Guides</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Google */}
                <div id="google" className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">📧</span>
                        <h3 className="font-bold text-xl text-gray-900">Google Workspace / Gmail</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Most Google connection issues are caused by OAuth token expiration or changes to your Google account security settings.
                    </p>
                    <div className="space-y-2">
                        <a href="https://support.google.com/accounts/answer/3466521" target="_blank" rel="noopener noreferrer"
                            className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                            → Managing third-party app access
                        </a>
                        <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer"
                            className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                            → Creating App Passwords (2FA accounts)
                        </a>
                        <a href="https://support.google.com/a/answer/176600" target="_blank" rel="noopener noreferrer"
                            className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                            → Google SMTP relay settings
                        </a>
                        <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer"
                            className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                            → Google Account Security settings
                        </a>
                    </div>
                </div>

                {/* Microsoft */}
                <div id="microsoft" className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">📬</span>
                        <h3 className="font-bold text-xl text-gray-900">Microsoft 365 / Outlook</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Microsoft connection issues commonly stem from app password expiration or changes to multi-factor authentication (MFA) settings.
                    </p>
                    <div className="space-y-2">
                        <a href="https://support.microsoft.com/en-us/account-billing/manage-app-passwords-for-two-step-verification-d6dc8c6d-4bf7-4851-ad95-6d07799387e9" target="_blank" rel="noopener noreferrer"
                            className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                            → Managing App Passwords (2FA accounts)
                        </a>
                        <a href="https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040" target="_blank" rel="noopener noreferrer"
                            className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                            → POP, IMAP, and SMTP settings
                        </a>
                        <a href="https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/authenticated-client-smtp-submission" target="_blank" rel="noopener noreferrer"
                            className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                            → Enabling SMTP AUTH for mailboxes
                        </a>
                        <a href="https://account.microsoft.com/security" target="_blank" rel="noopener noreferrer"
                            className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                            → Microsoft Account Security settings
                        </a>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* GENERAL STEPS */}
            {/* ═══════════════════════════════════════════════════ */}

            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">General Troubleshooting Steps</h2>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 mb-12">
                <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Check Smartlead First</h3>
                            <p className="text-gray-600 text-sm">Go to Smartlead → Email Accounts. If the account shows as disconnected there too, the issue is at the provider level.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Reconnect in Smartlead</h3>
                            <p className="text-gray-600 text-sm">Click &ldquo;Reconnect&rdquo; or re-enter credentials for the affected mailbox. For OAuth accounts (Google), complete the authorization flow again.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Sync in Superkabe</h3>
                            <p className="text-gray-600 text-sm">After fixing the connection in Smartlead, go to Superkabe → Settings and click <strong>Manual Sync</strong>. This will re-fetch connection status and update the mailbox.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Verify in Superkabe</h3>
                            <p className="text-gray-600 text-sm">Go to Mailboxes and confirm the status changed from &ldquo;Disconnected&rdquo; to &ldquo;Connected&rdquo;. The mailbox will automatically resume in its campaigns.</p>
                        </div>
                    </li>
                </ol>
            </div>

            {/* Still Need Help */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Still Need Help?</h2>
                <p className="text-blue-800 mb-2">
                    If you&apos;ve followed the steps above and the mailbox is still disconnected:
                </p>
                <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Check the <strong>exact error message</strong> shown in the diagnostic card on the Mailboxes page</li>
                    <li>• Contact your email provider&apos;s support team with the error details</li>
                    <li>• Reach out to <a href="mailto:support@superkabe.com" className="underline font-medium">support@superkabe.com</a> and we&apos;ll help investigate</li>
                </ul>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/campaign-paused" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → Why Is My Campaign Paused?
                    </a>
                    <a href="/docs/help/auto-healing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → How Auto-Healing Works (5-Phase Pipeline)
                    </a>
                    <a href="/docs/smartlead-integration" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → Smartlead Integration Guide
                    </a>
                </div>
            </div>
        </div>
    );
}
