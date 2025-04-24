import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{process.env.NEXT_PUBLIC_SERVICE_NAME} Privacy Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: April 7, 2025</p>

      <section className="mb-8">
        <p className="mb-4">
          Hi there, {process.env.NEXT_PUBLIC_SERVICE_NAME} users<br />
          We get it reading a privacy policy isn&apos;t exactly thrilling. But we&apos;ve worked hard to make this one clear, straightforward, and worth your time. This policy explains what information we collect, why we collect it, and how it&apos;s used to give you the best experience on {process.env.NEXT_PUBLIC_SERVICE_NAME}, the platform connecting clients with talented photographers, videographers, photo editors, and video editors.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Who We Are</h2>
        <p className="mb-4">
          {process.env.NEXT_PUBLIC_SERVICE_NAME} is a platform operated by <strong>{process.env.NEXT_PUBLIC_COMPANY_NAME}</strong>, based in Texas, USA. Our mission is to connect clients with creative professionals in a seamless and secure environment.
        </p>
        <div className="space-y-2">
          <p><strong>{process.env.NEXT_PUBLIC_COMPANY_NAME}</strong></p>
          <p>{process.env.NEXT_PUBLIC_COMPANY_ADDRESS}</p>
          <p><strong>Email:</strong> {process.env.NEXT_PUBLIC_COMPANY_CONTACT_EMAIL}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Scope of This Privacy Policy</h2>
        <p>
          This policy covers all {process.env.NEXT_PUBLIC_SERVICE_NAME} services whether you access us through our website or mobile app. If a feature or service has unique privacy terms, we&apos;ll let you know, and those terms will override this general policy if there&apos;s a conflict.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. What Data We Collect</h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">A. Information You Provide Directly</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Info</strong>: Name, email address, password, and any other sign-up details.</li>
            <li><strong>Profile Details</strong>: For professionals portfolio content, service categories, equipment, profile image, external links, and cover images. For clients profile basics and optional info.</li>
            <li><strong>Uploaded Content</strong>: Photos, videos, service listings, job postings, chat messages, and reviews.</li>
            <li><strong>Payment Info</strong>: Billing details (e.g., transaction ID, payment method, currency).</li>
            <li><strong>Support Interactions</strong>: Messages and support tickets submitted by you or about you.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-2">B. Automatically Collected Data</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Usage Info</strong>: Interactions on {process.env.NEXT_PUBLIC_SERVICE_NAME}, time spent on pages, actions taken, and communication logs.</li>
            <li><strong>Device Info</strong>: IP address, browser, OS, mobile device type, crash reports, and cookies.</li>
            <li><strong>Geolocation Data</strong> (with permission): Used to match services with nearby users or job locations.</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Why We Collect and Use Your Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-gray-900 font-semibold border-b border-gray-300">Purpose</th>
                <th className="px-4 py-2 text-left text-gray-900 font-semibold border-b border-gray-300">Data Used</th>
                <th className="px-4 py-2 text-left text-gray-900 font-semibold border-b border-gray-300">Why</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2 border-r border-gray-200">Account setup & login</td>
                <td className="px-4 py-2 border-r border-gray-200">Account Info</td>
                <td className="px-4 py-2">To manage and secure your access.</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2 border-r border-gray-200">Profile creation & discovery</td>
                <td className="px-4 py-2 border-r border-gray-200">Profile Details, Uploaded Content, Geolocation</td>
                <td className="px-4 py-2">To help clients and professionals connect effectively.</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2 border-r border-gray-200">Service fulfillment</td>
                <td className="px-4 py-2 border-r border-gray-200">Uploaded Content, Communication Logs</td>
                <td className="px-4 py-2">To enable professional-client collaborations.</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2 border-r border-gray-200">Payment processing</td>
                <td className="px-4 py-2 border-r border-gray-200">Payment Info, Transaction Records</td>
                <td className="px-4 py-2">To securely process transactions and commissions.</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2 border-r border-gray-200">Customer support</td>
                <td className="px-4 py-2 border-r border-gray-200">Support Data, Technical Data</td>
                <td className="px-4 py-2">To help troubleshoot and resolve issues.</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2 border-r border-gray-200">Marketing & research</td>
                <td className="px-4 py-2 border-r border-gray-200">Usage Info, Survey Responses (optional)</td>
                <td className="px-4 py-2">To inform you of new features and improve {process.env.NEXT_PUBLIC_SERVICE_NAME}.</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2 border-r border-gray-200">Security & legal</td>
                <td className="px-4 py-2 border-r border-gray-200">Any relevant data</td>
                <td className="px-4 py-2">To protect users, enforce our <a href="/legal/terms" className="text-blue-500 hover:underline">Terms</a>, and comply with the law.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Who We Share Your Data With</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Other Users</strong>: If you share content (e.g., a portfolio or job post), it may be publicly viewable by others.</li>
          <li><strong>Vendors & Service Providers</strong>: For hosting, analytics, email, payment, support, or fraud prevention.</li>
          <li><strong>Affiliates</strong>: To enhance {process.env.NEXT_PUBLIC_SERVICE_NAME} services or for business/legal compliance.</li>
          <li><strong>Legal Authorities</strong>: If required by law or for investigations related to safety or fraud.</li>
          <li><strong>During Business Changes</strong>: Your data may be part of a transfer in the event of a merger or acquisition.</li>
        </ul>
        <p className="mt-4 font-medium">We <strong>do not sell</strong> your personal data.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. International Data Transfers</h2>
        <p>
          {process.env.NEXT_PUBLIC_SERVICE_NAME} operates globally. If you&apos;re outside the U.S., your data may be transferred and processed in the U.S. or other countries. We use appropriate legal mechanisms (e.g., standard contractual clauses) to protect your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
        <p className="mb-4">Depending on your jurisdiction, you may have rights including:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Access</strong> to your data</li>
          <li><strong>Update or correction</strong></li>
          <li><strong>Deletion or deactivation</strong></li>
          <li><strong>Objection or restriction</strong></li>
          <li><strong>Consent withdrawal</strong></li>
          <li><strong>Portability</strong></li>
        </ul>
        <p className="mt-4">
          You can manage much of this through your {process.env.NEXT_PUBLIC_SERVICE_NAME} account. For further help, reach out to us at <strong>privacy@snap-hire.com</strong>.
        </p>
        <p className="mt-2">We may need to verify your identity before acting on your request.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">8. Data Retention</h2>
        <p className="mb-4">We keep your data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>For as long as your account is active.</li>
          <li>As needed to provide services or resolve disputes.</li>
          <li>As required by law (e.g., tax and legal obligations).</li>
          <li>For security reasons (e.g., preventing fraud or abuse).</li>
        </ul>
        <p className="mt-4">After account deletion, we remove or anonymize your data unless we&apos;re legally required or allowed to retain it.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
        <p>
          {process.env.NEXT_PUBLIC_SERVICE_NAME} is not intended for users under <strong>17 years of age</strong>. We do not knowingly collect data from minors. If you believe a minor is using our platform, please contact us so we can take appropriate action.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">10. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar technologies to enhance your experience, provide analytics, and support features like chat, login sessions, and location matching. You can adjust your cookie preferences in your browser settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy occasionally. If the changes are significant, we will notify you by email or in-app. Check this page regularly for the most recent version. Continued use of {process.env.NEXT_PUBLIC_SERVICE_NAME} means you accept the revised policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
        <p className="mb-4">Have questions? Want to exercise your rights or raise a concern? Reach out anytime:</p>
        <div className="space-y-2">
          <p><strong>{process.env.NEXT_PUBLIC_SERVICE_NAME} / {process.env.NEXT_PUBLIC_COMPANY_NAME}</strong></p>
          <p>{process.env.NEXT_PUBLIC_COMPANY_CONTACT_EMAIL}</p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage; 