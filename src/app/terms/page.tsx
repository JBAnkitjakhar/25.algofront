// src/app/terms/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function TermsAndConditions() {
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
            Terms and Conditions
          </h1>
          <p className="text-gray-600">
            Last Updated: December 6, 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using AlgoArena the Platform, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. These terms apply to all users, including visitors, registered users, and contributors.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              AlgoArena is an educational platform designed to help users learn and master Data Structures and Algorithms. Our services include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access to algorithm questions and problems</li>
              <li>Ability to submit and share coding solutions</li>
              <li>Educational courses and learning materials</li>
              <li>Progress tracking and statistics</li>
              <li>User-generated content and approaches</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. User Accounts and Registration
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-gray-900">3.1 Account Creation:</strong> To access certain features, you must create an account using Google or GitHub OAuth authentication. You agree to provide accurate and complete information during registration.
              </p>
              <p>
                <strong className="text-gray-900">3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <p>
                <strong className="text-gray-900">3.3 Age Requirement:</strong> You must be at least 13 years old to use this platform. Users under 18 should have parental consent.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. User-Generated Content
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-gray-900">4.1 Code Solutions:</strong> You retain ownership of the code solutions you submit. By submitting solutions, you grant AlgoArena a non-exclusive, worldwide license to display, store, and use your content for educational purposes.
              </p>
              <p>
                <strong className="text-gray-900">4.2 User Approaches:</strong> Any approaches, explanations, or comments you share may be visible to other users for educational purposes.
              </p>
              <p>
                <strong className="text-gray-900">4.3 Content Standards:</strong> You agree not to submit content that is offensive, harmful, violates intellectual property rights, or violates any applicable laws.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Intellectual Property Rights
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-gray-900">5.1 Platform Content:</strong> All algorithm questions, courses, documentation, and platform features are owned by AlgoArena and are protected by copyright and intellectual property laws.
              </p>
              <p>
                <strong className="text-gray-900">5.2 Limited License:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use the platform for personal, educational purposes only.
              </p>
              <p>
                <strong className="text-gray-900">5.3 Restrictions:</strong> You may not reproduce, distribute, modify, or create derivative works from our content without explicit permission.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Acceptable Use Policy
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              {/* <li>Plagiarize or copy solutions from other users without attribution</li> */}
              <li>Share or sell access to premium content</li>
              <li>Attempt to hack, disrupt, or compromise the platforms security</li>
              <li>Use automated tools to scrape or download content</li>
              <li>Impersonate other users or misrepresent your identity</li>
              <li>Submit malicious code or harmful content</li>
              <li>Use the platform for commercial purposes without authorization</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Account Termination
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                We reserve the right to suspend or terminate your account if you violate these terms or engage in activities that harm the platform or other users. You may also delete your account at any time through your account settings.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Educational Purpose and Disclaimers
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-gray-900">8.1 No Guarantee:</strong> AlgoArena is an educational platform. We do not guarantee job placement, interview success, or specific learning outcomes.
              </p>
              <p>
                <strong className="text-gray-900">8.2 Content Accuracy:</strong> While we strive for accuracy, we do not warrant that all content is error-free or up-to-date.
              </p>
              <p>
                <strong className="text-gray-900">8.3 External Links:</strong> We are not responsible for the content or practices of external websites linked from our platform.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, AlgoArena shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the platform, including but not limited to loss of data, loss of profits, or business interruption.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms and Conditions at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Privacy and Data Protection
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of AlgoArena is also governed by our Privacy Policy. Please review our{' '}
              <Link href="/privacypolicy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and protect your data.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              13. Contact Information
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-3">
                If you have any questions about these Terms and Conditions, please contact us:
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>Website: www.algoarena.com</span>
                </p> */}
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 italic">
              By using AlgoArena, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
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
              <Link href="/privacypolicy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy policy
              </Link>
              {/* <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy
              </Link> */}
              {/* <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                Contact
              </Link> */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}