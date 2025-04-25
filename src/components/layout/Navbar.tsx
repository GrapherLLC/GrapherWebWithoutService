'use client'

import Link from 'next/link'
import Image from 'next/image'

interface NavItem {
  label: string
  href: string
  roles?: ('client' | 'professional' | 'both')[]
}

const navItems: NavItem[] = [
  { label: 'How it Works', href: '/how-it-works' },
  { label: 'About', href: '/company/about' },
  { label: 'Contac Us', href: '/support/contact-us' },
]

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/grapher-500x130.svg"
                alt="home Logo"
                width={150}
                height={42}
                className="h-auto"
                priority
              />
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-input transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
          </div>

          <div className="md:hidden">
          </div>
        </div>
      </div>
    </nav>
  )
} 