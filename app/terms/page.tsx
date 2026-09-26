import Link from 'next/link'

export const metadata = { title: 'Terms of Service — XCreator CRM' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-400">XCreator</span>
          <span className="text-slate-600">CRM</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-12">Last updated: September 2026</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using XCreator CRM ("the Service"), you agree to be bound by these
              Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              XCreator CRM is a subscriber relationship management tool for X (formerly Twitter)
              creators. It connects to your X account via OAuth, analyses your paid subscriber
              engagement, and provides tools to identify and re-engage at-risk subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Account Registration</h2>
            <p>
              You must connect a valid X account to use the Service. You are responsible for
              maintaining the security of your account and for all activity that occurs under it.
              You must notify us immediately of any unauthorised access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Use the Service to send spam or unsolicited messages in violation of X's rules</li>
              <li>Attempt to reverse engineer or extract source code from the Service</li>
              <li>Use the Service in any way that violates applicable laws or regulations</li>
              <li>Share your account credentials with third parties</li>
              <li>Use the Service to harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Subscription and Payment</h2>
            <p>
              Paid plans are billed monthly. Payments are processed securely by Stripe. By
              subscribing, you authorise us to charge your payment method on a recurring basis
              until you cancel. Prices are displayed in USD and are subject to change with 30
              days' notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Cancellation</h2>
            <p>
              You may cancel your subscription at any time from the billing portal in your
              dashboard. Cancellation takes effect at the end of the current billing period.
              You will retain access to paid features until that date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by
              XCreator CRM and are protected by international copyright, trademark, and other
              intellectual property laws. Your subscriber data remains yours at all times.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" without warranties of any kind, express or implied.
              We do not guarantee that the Service will be uninterrupted, error-free, or that
              any specific business results will be achieved from its use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, XCreator CRM shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, or any loss of
              profits or revenues, whether incurred directly or indirectly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of
              material changes via email or a notice within the Service. Continued use after
              changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:hello@xcreatorcrm.com" className="text-indigo-400 hover:underline">
                hello@xcreatorcrm.com
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex gap-6 text-sm text-slate-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </div>
  )
}
