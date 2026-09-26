import React from 'react';

const sections = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'September 27, 2026',
    intro: 'This Privacy Policy explains how PrepXAI handles information when you use the PrepXAI website and related study features.',
    items: [
      ['Information you provide', 'When you create an account, we may receive information such as your email address, username or nickname, target exam, and information you choose to add to your profile or use in study and social features.'],
      ['Google sign-in', 'If you choose Google sign-in, authentication is handled through Google and our authentication provider. We receive the account information needed to create and maintain your PrepXAI account.'],
      ['How information is used', 'We use account and activity information to authenticate you, provide study tools, save progress and test results, operate study circles and messaging features, personalize the experience, and maintain security and reliability.'],
      ['Information sharing', 'We do not sell your personal information. Information may be processed by service providers that help us operate authentication, hosting, databases, and other core website functions. We may also disclose information when required by applicable law or to protect the security of the service.'],
      ['Social features', 'If you use features such as connections, chats, or study circles, some information you choose to share may be visible to other members according to the feature settings.'],
      ['Data security', 'We use reasonable technical and organizational measures intended to protect account information. No internet service can guarantee absolute security.'],
      ['Your choices', 'You can stop using the service and sign out at any time. Some account information may need to be retained where necessary for security, legal obligations, or legitimate operation of the service.'],
      ['Minors and students', 'PrepXAI is intended for students and exam preparation. We aim to collect only information needed to provide the service and do not knowingly sell personal information belonging to minors. If a parent or guardian has a concern about information associated with a minor, they should use the support channel provided by PrepXAI.'],
      ['Changes to this policy', 'We may update this policy when the service or applicable requirements change. The updated version will be posted on this page with a revised date.']
    ]
  },
  terms: {
    title: 'Terms of Service',
    updated: 'September 27, 2026',
    intro: 'These Terms of Service describe the basic rules for using PrepXAI and its study, testing, communication, and account features.',
    items: [
      ['Using PrepXAI', 'You may use PrepXAI for lawful educational and personal study purposes. You are responsible for keeping your account credentials secure and for activity carried out through your account.'],
      ['Educational content', 'PrepXAI provides study tools, practice questions, tests, analytics, and related educational features. Content is provided for learning and practice and should not be treated as a guarantee of exam results.'],
      ['User content and conduct', 'Do not use the service to harass, impersonate, threaten, spam, distribute malicious content, or otherwise interfere with other users or the operation of PrepXAI. Use social and study-circle features respectfully.'],
      ['Account information', 'Provide information that is accurate enough for your account to function. We may restrict or suspend access when reasonably necessary to protect the service, users, or security of the platform.'],
      ['Third-party services', 'Some PrepXAI features depend on third-party services such as authentication, hosting, or databases. Those services may have their own terms and privacy practices.'],
      ['Intellectual property', 'PrepXAI software, branding, interface, and original materials are protected by applicable intellectual-property laws. You may not copy, modify, redistribute, or commercially exploit them except where permitted by law or by written permission.'],
      ['Availability', 'We work to keep PrepXAI available and reliable, but features may occasionally be changed, interrupted, or unavailable because of maintenance, updates, technical problems, or circumstances outside our control.'],
      ['Limitation', 'To the extent permitted by applicable law, PrepXAI is provided without guarantees that every feature will always be uninterrupted, error-free, or suitable for a particular result.'],
      ['Changes to these terms', 'We may update these terms as the service develops. Continued use after an updated version is posted means the updated terms will apply to future use of the service.']
    ]
  }
};

export default function LegalPage({ type = 'privacy' }) {
  const content = sections[type] || sections.privacy;
  const otherPath = type === 'privacy' ? '/terms' : '/privacy';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-300 hover:text-white transition">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500">✦</span>
          PrepXAI
        </a>

        <main className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl sm:p-9">
          <div className="border-b border-slate-800 pb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">Legal</p>
            <h1 className="mt-2 text-3xl font-black text-white">{content.title}</h1>
            <p className="mt-2 text-xs text-slate-500">Last updated: {content.updated}</p>
            <p className="mt-5 text-sm leading-7 text-slate-300">{content.intro}</p>
          </div>

          <div className="mt-7 space-y-7">
            {content.items.map(([heading, body]) => (
              <section key={heading}>
                <h2 className="text-base font-bold text-white">{heading}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">{body}</p>
              </section>
            ))}
          </div>

          <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-500">
            This page is general service information and is not legal advice.
          </div>
        </main>

        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-500">
          <a href={otherPath} className="hover:text-slate-200 transition">
            {type === 'privacy' ? 'Terms of Service' : 'Privacy Policy'}
          </a>
          <span aria-hidden="true">•</span>
          <a href="/" className="hover:text-slate-200 transition">Back to PrepXAI</a>
        </div>
      </div>
    </div>
  );
}
