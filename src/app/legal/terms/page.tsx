import React from 'react';

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{process.env.NEXT_PUBLIC_SERVICE_NAME} Terms of Service</h1>
      <p className="text-gray-600 mb-8">Last updated: April 7, 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          Welcome to {process.env.NEXT_PUBLIC_SERVICE_NAME}, a service provided by {process.env.NEXT_PUBLIC_COMPANY_NAME} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). {process.env.NEXT_PUBLIC_SERVICE_NAME} is a broker platform that connects clients with professionals offering photography, videography, photo editing, and video editing services. By accessing or using {process.env.NEXT_PUBLIC_SERVICE_NAME}, whether through our website or app, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please refrain from using our platform.
        </p>
        <p className="mb-4 font-medium">
          Important Disclaimer: {process.env.NEXT_PUBLIC_SERVICE_NAME} acts solely as a broker platform and is not responsible for:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>The quality of services provided by professionals</li>
          <li>Copyright infringement or intellectual property disputes</li>
          <li>Any disputes between clients and professionals</li>
          <li>The accuracy of professional profiles or service descriptions</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Use of the Platform</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">1.1 Permitted Use</h3>
            <p>You agree to use {process.env.NEXT_PUBLIC_SERVICE_NAME} solely for lawful purposes and in a manner consistent with its intended function—to connect clients with creative professionals.</p>
          </div>
          <div>
            <h3 className="font-medium">1.2 Prohibited Use</h3>
            <p>You may not engage in harmful activities including, but not limited to, unauthorized data scraping, exploiting vulnerabilities, impersonating others, or distributing harmful software.</p>
          </div>
          <div>
            <h3 className="font-medium">1.3 Account Monitoring</h3>
            <p>We reserve the right to monitor activity for security and quality control purposes. Suspicious or abusive behavior may result in temporary suspension or permanent termination of your account.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Account Eligibility and Management</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">2.1 Minimum Age</h3>
            <p>You must be at least 18 years old to use {process.env.NEXT_PUBLIC_SERVICE_NAME}.</p>
          </div>
          <div>
            <h3 className="font-medium">2.2 Account Creation</h3>
            <p>You must provide accurate and up-to-date information when creating an account.</p>
          </div>
          <div>
            <h3 className="font-medium">2.3 Role Assignment</h3>
            <p>Users can register as a Client, Professional, or both. You may switch roles if eligible and verified.</p>
          </div>
          <div>
            <h3 className="font-medium">2.4 Account Termination</h3>
            <p>We may suspend or terminate your account at our discretion, especially for violating these Terms.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. User Conduct</h2>
        <p className="mb-4">You agree not to post, upload, or share any content that:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Contains hate speech, harassment, or threats.</li>
          <li>Is pornographic, violent, or otherwise inappropriate.</li>
          <li>Infringes intellectual property rights or the privacy of others.</li>
          <li>Contains malware, spam, or false information.</li>
        </ul>
        <p className="mt-4">Violation may result in immediate termination of your account and legal action.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Professional Services and Transactions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">4.1 Role of {process.env.NEXT_PUBLIC_SERVICE_NAME}</h3>
            <p>{process.env.NEXT_PUBLIC_SERVICE_NAME} acts solely as a broker platform and is not a party to contracts between clients and professionals. We do not guarantee the quality of services, handle copyright disputes, or mediate between parties.</p>
          </div>
          <div>
            <h3 className="font-medium">4.2 Payments and Fees</h3>
            <p>{process.env.NEXT_PUBLIC_SERVICE_NAME} charges a service fee on transactions. You agree to our pricing and commission structure.</p>
          </div>
          <div>
            <h3 className="font-medium">4.3 Disputes</h3>
            <p>Disputes between users should be resolved between the parties. {process.env.NEXT_PUBLIC_SERVICE_NAME} may, but is not obligated to, mediate.</p>
          </div>
          <div>
            <h3 className="font-medium">4.4 Deliverables</h3>
            <p>Professionals are responsible for delivering agreed-upon services through the platform or via approved means. Deliverables are securely stored for a limited period (e.g., 30 days post-completion).</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">5.1 User Content</h3>
            <p>You retain ownership of your uploaded content. By submitting content, you grant us a royalty-free, sublicensable license to use, host, and display it for platform-related purposes.</p>
          </div>
          <div>
            <h3 className="font-medium">5.2 Platform Content</h3>
            <p>All {process.env.NEXT_PUBLIC_SERVICE_NAME} trademarks, software, designs, and proprietary content are owned by {process.env.NEXT_PUBLIC_COMPANY_NAME}. Unauthorized use is prohibited.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Privacy Policy</h2>
        <p>Your use of {process.env.NEXT_PUBLIC_SERVICE_NAME} is also governed by our <a href="/legal/privacy" className="text-blue-500 hover:underline">Privacy Policy</a>. We take the protection of your data seriously and encourage you to review it.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
        <p className="mb-4">To the maximum extent permitted by law, {process.env.NEXT_PUBLIC_COMPANY_NAME} shall not be liable for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Loss of profits, business, or data.</li>
          <li>Errors in user-provided content or service delivery.</li>
          <li>Interruptions or bugs on the platform.</li>
          <li>Any dispute or transaction between users.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">8. Indemnification</h2>
        <p>You agree to indemnify and hold harmless {process.env.NEXT_PUBLIC_SERVICE_NAME}, its affiliates, officers, and employees from any claim or demand arising from your use of the platform, your content, or your breach of these Terms.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
        <p>We may modify these Terms at any time. Updates will be posted on this page with a revised "Last updated" date. Continued use after changes constitutes acceptance of the new Terms.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">10. Governing Law and Jurisdiction</h2>
        <p>These Terms are governed by the laws of the State of Texas, U.S.A. Any dispute shall be resolved exclusively in the courts of Dallas County, Texas, unless otherwise required by local law.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">11. Termination and Account Deletion</h2>
        <p>You may terminate your account at any time. To delete your account, visit your account settings or contact support. You remain responsible for any outstanding payments or obligations.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">12. Entire Agreement</h2>
        <p>These Terms, along with our Privacy Policy, represent the entire agreement between you and {process.env.NEXT_PUBLIC_SERVICE_NAME}. If any part is deemed unenforceable, the remainder shall remain in full force and effect.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">13. Contact Us</h2>
        <div className="space-y-2">
          <p><strong>{process.env.NEXT_PUBLIC_COMPANY_NAME}</strong></p>
          <p><strong>Email:</strong> {process.env.NEXT_PUBLIC_COMPANY_CONTACT_EMAIL}</p>
        </div>
      </section>
    </div>
  );
};

export default TermsPage; 