import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — XCreator CRM' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-400">XCreator</span>
          <span className="text-slate-600">CRM</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-12">Last updated: September 2026</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">When you use XCreator CRM, we collect:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Your X (Twitter) username, user ID, and OAuth access token</li>
              <li>Subscriber data synced from your X account (usernames, engagement signals)</li>
              <li>Payment information processed by Stripe (we never store card details directly)</li>
              <li>Usage data such as login timestamps and feature interactions</li>
              <li>DM logs recording messages sent on your behalf and their delivery status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Provide and operate the Service</li>
              <li>Calculate subscriber health scores and churn risk</li>
              <li>Send win-back DMs on your behalf when you enable that feature</li>
              <li>Process payments and manage your subscription</li>
              <li>Send transactional emails (receipts, account notices)</li>
              <li>Improve the Service through aggregated, anonymised analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. X API Data</h2>
            <p>
              We access your X account data solely to provide the features you request. We store
              your OAuth access token securely to perform background syncs and, if enabled, to
              send win-back DMs on your behalf. We do not sell, share, or use your X data for
              advertising or profiling purposes. You can revoke our access at any time from your
              X account's connected apps settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored in Supabase, hosted on AWS infrastructure in the EU. We use
              row-level security to ensure each user can only access their own data. OAuth tokens
              are stored encrypted. Payment data is handled entirely by Stripe and never touches
              our servers in raw form.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Sharing</h2>
            <p className="mb-3">
              We do not sell your personal data. We share data only with:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li><strong className="text-slate-300">Stripe</strong> — for payment processing</li>
              <li><strong className="text-slate-300">Supabase</strong> — for database hosting</li>
              <li><strong className="text-slate-300">Vercel</strong> — for application hosting</li>
              <li><strong className="text-slate-300">X (Twitter)</strong> — to sync your subscriber data and send DMs</li>
            </ul>
            <p className="mt-3">
              We may also disclose data when required by law or to protect our legal rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Cookies</h2>
            <p>
              We use a single session cookie (<code className="text-indigo-400 text-sm">xcreator_session</code>)
              to keep you logged in. It is httpOnly, secure, and contains no third-party tracking.
              We do not use advertising cookies or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Export your subscriber data</li>
              <li>Revoke X API access at any time</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{' '}
              <a href="mailto:hello@xcreatorcrm.com" className="text-indigo-400 hover:underline">
                hello@xcreatorcrm.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your
              account, we will delete your personal data within 30 days, except where we are
              required to retain it for legal or financial compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes via email or a prominent notice in the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
            <p>
              For privacy questions or data requests, contact{' '}
              <a href="mailto:hello@xcreatorcrm.com" className="text-indigo-400 hover:underline">
                hello@xcreatorcrm.com
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex gap-6 text-sm text-slate-500">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </div>
  )
}
