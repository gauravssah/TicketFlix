import React from "react";
import BlurCircle from "../components/BlurCircle";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "When you use TicketFlix, we may collect certain personal information to provide and improve our services. This includes:",
    ],
    list: [
      "Account Information — Name, email address, phone number, and profile picture provided during sign-up.",
      "Booking Details — Movies you book, show times, seat selections, theater locations, and transaction history.",
      "Payment Information — Payment method details processed securely through our payment partner (Stripe). We do not store your full card number on our servers.",
      "Device & Usage Data — IP address, browser type, operating system, device identifiers, pages visited, and interaction patterns within the app.",
      "Location Data — Approximate location (city-level) to display relevant theaters and shows near you.",
      "Cookies & Local Storage — Used to maintain your session, remember preferences, and enhance your browsing experience.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: ["We use the information we collect for the following purposes:"],
    list: [
      "To process and confirm movie ticket bookings.",
      "To manage your account and provide customer support.",
      "To personalize your experience — such as showing recommended movies and favorite theaters.",
      "To send booking confirmations, reminders, and ticket details via email.",
      "To process payments securely and detect fraudulent transactions.",
      "To analyze usage patterns and improve our platform's performance and features.",
      "To comply with legal obligations and enforce our terms of service.",
    ],
  },
  {
    title: "3. Sharing Your Information",
    content: [
      "We respect your privacy and do not sell your personal data. We may share your information only in the following cases:",
    ],
    list: [
      "Service Providers — With trusted third-party services like Stripe (payments), Clerk (authentication), and Inngest (background processing) that help us operate the platform.",
      "Theater Partners — Limited booking details shared with partnered cinemas to fulfil your reservation.",
      "Legal Requirements — When required by law, regulation, or legal process, or to protect the rights and safety of TicketFlix and its users.",
      "Business Transfers — In the event of a merger, acquisition, or asset sale, your data may be transferred as part of that transaction.",
    ],
  },
  {
    title: "4. Data Security",
    content: [
      "We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:",
    ],
    list: [
      "Encryption of data in transit using HTTPS/TLS protocols.",
      "Secure authentication powered by Clerk with session management and multi-factor support.",
      "Payment processing handled entirely by Stripe — a PCI DSS Level 1 certified provider.",
      "Regular security reviews and access controls on our servers and databases.",
    ],
    footer:
      "While we strive to protect your data, no method of electronic transmission or storage is 100% secure. We encourage you to use strong passwords and keep your account credentials confidential.",
  },
  {
    title: "5. Cookies & Tracking",
    content: [
      "TicketFlix uses cookies and similar technologies to enhance your experience:",
    ],
    list: [
      "Essential Cookies — Required for core functionality like authentication and booking sessions.",
      "Preference Cookies — Store your settings such as favorite movies and preferred language.",
      "Analytics Cookies — Help us understand how users interact with our platform so we can improve it.",
    ],
    footer:
      "You can manage cookie preferences through your browser settings. Disabling essential cookies may affect the functionality of the platform.",
  },
  {
    title: "6. Your Rights & Choices",
    content: [
      "Depending on your location, you may have the following rights regarding your personal data:",
    ],
    list: [
      "Access — Request a copy of the personal data we hold about you.",
      "Correction — Request correction of inaccurate or incomplete data.",
      "Deletion — Request deletion of your personal data, subject to legal retention requirements.",
      "Opt-out — Unsubscribe from promotional emails at any time using the link in the email.",
      "Data Portability — Request your data in a portable, machine-readable format.",
    ],
    footer:
      "To exercise any of these rights, contact us at support@ticketflix.com. We will respond to your request within 30 days.",
  },
  {
    title: "7. Children's Privacy",
    content: [
      "TicketFlix is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal data, we will promptly delete it. If you believe a child has shared information with us, please contact us immediately.",
    ],
  },
  {
    title: "8. Third-Party Links",
    content: [
      "Our platform may contain links to third-party websites, such as movie trailers on YouTube or social media pages. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party services you interact with.",
    ],
  },
  {
    title: "9. Data Retention",
    content: [
      "We retain your personal information for as long as your account is active or as needed to provide you services. Booking history and transaction records may be retained for a longer period to comply with legal, accounting, or reporting obligations. When data is no longer needed, we securely delete or anonymize it.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make significant changes, we will notify you by posting the updated policy on this page and updating the "Last Updated" date. We encourage you to review this page periodically.',
    ],
  },
  {
    title: "11. Contact Us",
    content: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please reach out to us:",
    ],
    list: [
      "Email — support@ticketflix.com",
      "Phone — +91 98765 43210",
      "Address — 123 Movie Street, Entertainment City, India",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <div className="relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="100px" left="-50px" />
      <BlurCircle bottom="100px" right="0px" />

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Privacy Policy
        </h1>
        <p className="text-gray-400 text-sm">Last Updated: February 17, 2026</p>
        <p className="text-gray-300 mt-4 leading-relaxed max-w-3xl">
          At <span className="text-white font-medium">TicketFlix</span>, we
          value your privacy and are committed to protecting your personal
          information. This Privacy Policy explains what data we collect, how we
          use it, and the choices you have regarding your information when you
          use our movie ticket booking platform.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section, index) => (
          <div key={index}>
            <h2 className="text-xl font-semibold text-white mb-3">
              {section.title}
            </h2>

            {section.content.map((para, i) => (
              <p key={i} className="text-gray-300 text-sm leading-relaxed mb-3">
                {para}
              </p>
            ))}

            {section.list && (
              <ul className="space-y-2 ml-4">
                {section.list.map((item, i) => (
                  <li
                    key={i}
                    className="text-gray-400 text-sm leading-relaxed flex gap-2"
                  >
                    <span className="text-primary mt-1 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.footer && (
              <p className="text-gray-400 text-sm leading-relaxed mt-3 italic">
                {section.footer}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Note */}
      <div className="mt-16 pt-8 border-t border-gray-700">
        <p className="text-gray-500 text-xs text-center">
          © {new Date().getFullYear()} TicketFlix. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
