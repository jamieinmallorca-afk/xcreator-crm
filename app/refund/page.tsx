import Link from 'next/link'

export const metadata = { title: 'Refund Policy — XCreator CRM' }

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-400">XCreator</span>
          <span className="text-slate-600">CRM</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
        <p className="text-slate-400 text-sm mb-12">Last updated: September 2026</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Our Commitment</h2>
            <p>
              We want you to be satisfied with XCreator CRM. If the product isn't working for
              you, we'd rather give you your money back than keep a customer who isn't happy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">14-Day Money-Back Guarantee</h2>
            <p>
              If you're not satisfied with XCreator CRM for any reason, contact us within
              <strong className="text-white"> 14 days</strong> of your first payment and we will
              issue a full refund — no questions asked. This applies to first-time subscribers only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Cancellations</h2>
            <p>
              You can cancel your subscription at any time from the billing portal in your
              dashboard. When you cancel, you will not be charged again. You will continue to
              have access to paid features until the end of your current billing period.
              We do not offer partial-month refunds for cancellations mid-cycle.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Exceptions</h2>
            <p className="mb-3">Refunds will not be issued in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Requests made more than 14 days after the charge date (outside the guarantee window)</li>
              <li>Accounts found to be in violation of our Terms of Service</li>
              <li>Renewals on existing subscriptions (only first payments are eligible)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">How to Request a Refund</h2>
            <p>
              Email{' '}
              <a href="mailto:hello@xcreatorcrm.com" className="text-indigo-400 hover:underline">
                hello@xcreatorcrm.com
              </a>{' '}
              with the subject line <strong className="text-white">"Refund Request"</strong> and
              include the email address associated with your account. We will process eligible
              refunds within 5 business days. Refunds are returned to the original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Questions</h2>
            <p>
              If you have any questions about billing or refunds, we're happy to help at{' '}
              <a href="mailto:hello@xcreatorcrm.com" className="text-indigo-400 hover:underline">
                hello@xcreatorcrm.com
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex gap-6 text-sm text-slate-500">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </div>
  )
}
