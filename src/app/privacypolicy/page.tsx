// src/app/privacypolicy/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.jpg" 
              alt="AlgoArena" 
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-gray-900">AlgoArena</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">
            Last Updated: December 6, 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              At AlgoArena, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our educational platform.
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  1.1 Information You Provide
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Name, email address, and profile picture provided through OAuth authentication (Google or GitHub)</li>
                  <li><strong>User Content:</strong> Code approaches, comments, and text explanation you submit</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  1.2 Automatically Collected Information
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform</li>
                  <li><strong>Progress Data:</strong> Questions solved, difficulty levels, timestamps</li>
                  <li><strong>Cookies:</strong> Essential cookies for authentication and session management</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>To provide and maintain the AlgoArena platform</li>
              <li>To authenticate your identity and manage your account</li>
              <li>To track your learning progress and provide personalized experiences</li>
              <li>To display your submitted approaches</li>
              <li>To improve our services and develop new features</li>
              <li>To communicate with you about updates, maintenance, or security issues</li>
              <li>To analyze platform usage and optimize performance</li>
              <li>To prevent fraud, abuse, and ensure platform security</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Information Sharing and Disclosure
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-gray-900">3.1 Public Information:</strong> Your username, profile picture, and submitted approaches are visible to other users for educational purposes.
              </p>
              <p>
                <strong className="text-gray-900">3.2 Third-Party Services:</strong> We use the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-8">
                <li><strong>OAuth Providers:</strong> Google and GitHub for authentication</li>
                <li><strong>Cloud Services:</strong> For hosting and data storage</li>
                <li><strong>Analytics:</strong> To understand platform usage (anonymized data)</li>
              </ul>
              <p>
                <strong className="text-gray-900">3.3 Legal Requirements:</strong> We may disclose information if required by law, court order, or to protect the rights and safety of AlgoArena, our users, or others.
              </p>
              <p>
                <strong className="text-gray-900">3.4 Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.
              </p>
              <p className="font-semibold text-gray-900">
                We do not sell your personal information to third parties.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Data Storage and Security
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-gray-900">4.1 Data Storage:</strong> Your data is stored securely on MongoDB cloud servers with encryption at rest and in transit.
              </p>
              <p>
                <strong className="text-gray-900">4.2 Security Measures:</strong> We implement industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-8">
                <li>OAuth2 authentication for secure login</li>
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication tokens</li>
                <li>Secure session management</li>
              </ul>
              <p>
                <strong className="text-gray-900">4.3 Data Retention:</strong> We retain your account information as long as your account is active. You can request deletion at any time.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Cookies and Tracking Technologies
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                We use cookies and similar technologies for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for authentication and basic platform functionality</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
              </ul>
              <p>
                You can control cookie preferences through your browser settings, but disabling essential cookies may affect platform functionality.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          {/* <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Your Rights and Choices
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your profile information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications (if any)</li>
              <li><strong>Visibility Control:</strong> Control what information is visible to other users</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, please contact us at privacy@algoarena.com or through your account settings.
            </p>
          </section> */}

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Childrens Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              AlgoArena is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete that information promptly. Users under 18 should use the platform with parental guidance.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be stored and processed in different countries where our service providers operate. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable data protection laws.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or platform notification. The Last Updated date at the top indicates when the policy was last revised. Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Contact Us
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-3">
                If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email: jbprogrammersguild@gmail.com</span>
                </p>
                {/* <p className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Data Protection Officer: dpo@algoarena.com</span>
                </p>
                <p className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>Website: www.algoarena.com</span>
                </p> */}
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="border-t border-gray-200 pt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 flex items-start space-x-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  By using AlgoArena, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
                </span>
              </p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © 2024 AlgoArena. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                Terms
              </Link>
              {/* <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                Contact
              </Link> */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}