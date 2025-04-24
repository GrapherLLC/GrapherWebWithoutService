'use client'

import Link from 'next/link'

const footerLinks = {
  Platform: [
    { label: 'How it Works', href: '/how-it-works' },
  ],
  Support: [
    { label: 'Contact Us', href: '/support/contact-us' },
  ],
  Company: [
    { label: 'About', href: '/company/about' },
  ],
  Legal: [
    { label: 'Privacy', href: '/legal/privacy' },
    { label: 'Terms', href: '/legal/terms' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-dark-card text-dark-text-primary border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-dark-text-secondary mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-dark-text-muted hover:text-dark-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-dark-border">
          <p className="text-center text-dark-text-muted">
            © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_COMPANY_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 