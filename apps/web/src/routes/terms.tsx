import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-sm">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: 17 November 2026</p>

      <h2>1. Acceptance</h2>
      <p>
        By accessing or using DiagnoAI ("the Service"), you agree to these Terms.
        If you do not agree, do not use the Service.
      </p>

      <h2>2. The Service</h2>
      <p>
        DiagnoAI is a laboratory information system for human and veterinary
        diagnostic labs. It helps you record tests, generate reports, and deliver
        them to patients or owners.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        credentials and for all activity under your account. You must provide
        accurate information and keep it up to date.
      </p>

      <h2>4. Acceptable use</h2>
      <p>
        You agree not to misuse the Service, including by attempting to access it
        without authorization, interfering with its operation, or using it to
        violate any law or regulation.
      </p>

      <h2>5. Medical disclaimer</h2>
      <p>
        DiagnoAI is a record-keeping and reporting tool. It does not provide
        medical advice or diagnosis. All results must be interpreted by a
        qualified professional. You are responsible for the accuracy of the data
        you enter.
      </p>

      <h2>6. Fees</h2>
      <p>
        Paid plans are billed in advance on a monthly or annual basis. Fees are
        non-refundable except where required by law. We may change fees with
        notice.
      </p>

      <h2>7. Data</h2>
      <p>
        You retain ownership of the data you enter. You grant us a limited license
        to process it to provide the Service. We handle data in accordance with
        our Privacy Policy.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may cancel at any time. We may suspend or terminate access for
        violation of these Terms or non-payment.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, DiagnoAI is not liable for
        indirect, incidental, or consequential damages arising from your use of
        the Service.
      </p>

      <h2>10. Contact</h2>
      <p>Questions: support@diagnoai.com</p>
    </div>
  )
}
