import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-sm">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: 17 November 2026</p>

      <h2>1. What we collect</h2>
      <p>
        We collect account information (name, email, organization), the lab data
        you enter (patient/owner names, test results, reports), and technical data
        (IP address, browser, usage logs).
      </p>

      <h2>2. How we use it</h2>
      <p>
        To provide and improve the Service, generate reports, send notifications
        you request, process payments, and comply with legal obligations.
      </p>

      <h2>3. Legal basis</h2>
      <p>
        We process data to perform our contract with you, with your consent, and
        for our legitimate interests in operating the Service.
      </p>

      <h2>4. Sharing</h2>
      <p>
        We share data with service providers who help us run the Service
        (hosting, payments, messaging), under contracts that protect your data. We
        do not sell your data.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We retain your data while your account is active and for a reasonable
        period afterward, unless a longer period is required by law.
      </p>

      <h2>6. Security</h2>
      <p>
        We use encryption in transit, access controls, and audit logging. No
        system is perfectly secure; report any concern to support@diagnoai.com.
      </p>

      <h2>7. Your rights</h2>
      <p>
        You may access, correct, export, or delete your data. Contact
        support@diagnoai.com to exercise these rights.
      </p>

      <h2>8. International transfers</h2>
      <p>
        Data may be processed in countries where our providers operate. We use
        appropriate safeguards for such transfers.
      </p>

      <h2>9. Contact</h2>
      <p>Privacy questions: support@diagnoai.com</p>
    </div>
  )
}
