'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Camera, Search, Calendar, CreditCard, Star, Upload } from 'lucide-react'
import Link from 'next/link'

const clientSteps = [
  {
    icon: Search,
    title: 'Find the Right Professional',
    description: 'Browse through verified photographers and videographers in your area, or post a job and let them come to you.',
  },
  {
    icon: Calendar,
    title: 'Book Your Session',
    description: 'Choose your date, time, and location. Discuss your requirements directly with the professional.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Pay securely through our platform. Funds are held in escrow until the job is completed.',
  },
  {
    icon: Star,
    title: 'Get Your Photos/Videos',
    description: 'Receive your edited photos or videos through our platform and leave a review for your professional.',
  },
]

const proSteps = [
  {
    icon: Camera,
    title: 'Create Your Profile',
    description: 'Showcase your work, set your rates, and highlight your expertise and equipment.',
  },
  {
    icon: Search,
    title: 'Find Opportunities',
    description: 'Browse available jobs or receive matching requests from clients in your area.',
  },
  {
    icon: Calendar,
    title: 'Manage Bookings',
    description: 'Accept jobs, communicate with clients, and manage your schedule through our platform.',
  },
  {
    icon: Upload,
    title: 'Deliver & Get Paid',
    description: 'Upload completed work through our platform and receive payment automatically.',
  },
]

export default function HowItWorksPage() {
  return (
    <MainLayout>
      <div className="bg-gray-900 min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              How {process.env.NEXT_PUBLIC_COMPANY_NAME} Works
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Whether you&apos;re looking to hire a professional or offer your services,
              {process.env.NEXT_PUBLIC_COMPANY_NAME} makes it simple and secure.
            </p>
          </div>
        </section>

        {/* For Clients Section */}
        <section className="py-16 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">For Clients</h2>
              <p className="text-gray-300">
                Find and book the perfect photographer or videographer in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {clientSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
                    <step.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
            </div>
          </div>
        </section>

        {/* For Professionals Section */}
        <section className="py-16 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                For Professionals
              </h2>
              <p className="text-gray-300">
                Join our platform and grow your photography/videography business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {proSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
                    <step.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section className="py-16 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Trust & Safety
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-300 mb-8">
                Every professional on our platform is verified and reviewed. 
                Payments are secure and held in escrow until job completion.
                Our support team is available 24/7 to assist you.
              </p>
              <Link
                href="/trust"
                className="text-blue-400 hover:text-blue-300"
              >
                Learn more about our Trust & Safety policies →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
} 