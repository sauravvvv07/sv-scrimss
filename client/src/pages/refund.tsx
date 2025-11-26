export default function Refund() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 pb-24 md:pb-12">
      <h1 className="text-4xl font-bold mb-6">Refund Policy</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. General Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            All entry fees paid for scrims and tournaments are generally non-refundable. This policy ensures fair treatment of all participants and maintains the integrity of our competitive platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Eligible Refund Cases</h2>
          <p className="text-muted-foreground leading-relaxed">
            Refunds may be issued in the following exceptional circumstances:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
            <li>Match canceled by SV Scrims administration before start time</li>
            <li>Technical issues on our platform preventing match participation</li>
            <li>Payment processing errors resulting in duplicate charges</li>
            <li>Match cancellation due to insufficient participants (before match start)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Non-Refundable Situations</h2>
          <p className="text-muted-foreground leading-relaxed">
            Refunds will NOT be issued in the following cases:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
            <li>Player no-shows or late arrivals to scheduled matches</li>
            <li>Personal internet connectivity issues</li>
            <li>In-game technical problems or BGMI server issues</li>
            <li>Player disqualification due to rule violations</li>
            <li>Account ban or suspension due to misconduct</li>
            <li>Change of mind after registration</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Refund Request Process</h2>
          <p className="text-muted-foreground leading-relaxed">
            To request a refund for an eligible case:
          </p>
          <ol className="list-decimal pl-6 mt-2 space-y-2 text-muted-foreground">
            <li>Contact our support team within 24 hours of the incident</li>
            <li>Provide your transaction details and player ID</li>
            <li>Explain the reason for your refund request with supporting evidence</li>
            <li>Wait for admin review (typically 2-3 business days)</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Refund Processing Time</h2>
          <p className="text-muted-foreground leading-relaxed">
            Approved refunds will be processed within 5-7 business days. Refunds will be credited back to your wallet balance or to your original payment method, at the discretion of SV Scrims administration.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Wallet Withdrawals</h2>
          <p className="text-muted-foreground leading-relaxed">
            Funds in your wallet can be withdrawn at any time, subject to our withdrawal policy and minimum withdrawal limits. Withdrawal requests are processed within 24-48 hours after admin approval.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Prize Money</h2>
          <p className="text-muted-foreground leading-relaxed">
            Prize money credited to your wallet is subject to verification and cannot be disputed after distribution. Ensure all match results and statistics are accurate before final distribution.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Dispute Resolution</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you disagree with a refund decision, you may appeal to our support team. All decisions made by SV Scrims administration are final.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For refund-related queries, contact us through the platform's support channels with your transaction details.
          </p>
        </section>
      </div>
    </div>
  );
}
