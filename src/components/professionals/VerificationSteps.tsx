'use client'

import { useState } from 'react'
import { Phone, MapPin, CreditCard, Shield, CheckCircle } from 'lucide-react'
import type { Location } from '@/types/common/location'
import type { UserContact } from '@/types/user'

export interface VerificationFormData {
  phone: string
  email: string
  location: {
    city: string
    country: string
  }
  socialLinks: {
    instagram: string
    youtube: string
    linkedin: string
  }
  payment: {
    method: string
    securityDeposit: boolean
    checkoutMethod: string
  }
}

interface VerificationStepsProps {
  onComplete: (verificationData: {
    contact: UserContact,
    location: Location,
    socialLinks: string[],
    paymentVerified: boolean
  }) => void
  onStepChange: (step: number) => void
}

export default function VerificationSteps({ onComplete, onStepChange }: VerificationStepsProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<VerificationFormData>({
    phone: '',
    email: '',
    location: {
      city: '',
      country: '',
    },
    socialLinks: {
      instagram: '',
      youtube: '',
      linkedin: '',
    },
    payment: {
      method: '',
      securityDeposit: false,
      checkoutMethod: '',
    },
  })

  const handleStepComplete = (stepData: Partial<VerificationFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }))
    const nextStep = currentStep + 1
    if (nextStep > 4) {
      onComplete({
        contact: {
          phone: formData.phone,
          email: formData.email,
          emailVerified: false,
          phoneVerified: false
        },
        location: {
          city: formData.location.city,
          country: formData.location.country
        },
        socialLinks: [formData.socialLinks.instagram, formData.socialLinks.youtube, formData.socialLinks.linkedin],
        paymentVerified: formData.payment.securityDeposit
      })
    } else {
      setCurrentStep(nextStep)
      onStepChange(nextStep)
    }
  }

  const steps = [
    {
      title: 'Contact Verification',
      icon: Phone,
      description: 'Verify your phone number and email address',
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="flex-1 px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                placeholder="+1 (555) 000-0000"
              />
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500">
                Verify
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="flex-1 px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                placeholder="your@email.com"
              />
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500">
                Verify
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Location Verification',
      icon: MapPin,
      description: 'Verify your work location and social media presence',
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.location.city}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                location: { ...prev.location, city: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
              placeholder="Enter your city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Working Region
            </label>
            <input
              type="text"
              value={formData.location.country}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                location: { ...prev.location, country: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
              placeholder="Enter your working region"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium text-dark-text-secondary mb-2">Social Media Links (Optional)</h4>
            <div className="space-y-2">
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                placeholder="Instagram URL"
              />
              <input
                type="url"
                value={formData.socialLinks.youtube}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                placeholder="YouTube URL"
              />
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
                placeholder="LinkedIn URL"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Payment & Security',
      icon: CreditCard,
      description: 'Set up your payment and security preferences',
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Payment Method
            </label>
            <select
              value={formData.payment.method}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                payment: { ...prev.payment, method: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
            >
              <option value="">Select payment method</option>
              <option value="bank">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.payment.securityDeposit}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  payment: { ...prev.payment, securityDeposit: e.target.checked }
                }))}
                className="rounded border-dark-border text-primary-600"
              />
              <span className="text-dark-text-secondary">
                I agree to the security deposit policy
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Checkout Method
            </label>
            <select
              value={formData.payment.checkoutMethod}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                payment: { ...prev.payment, checkoutMethod: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-md text-dark-text-primary"
            >
              <option value="">Select checkout method</option>
              <option value="automatic">Automatic (After job completion)</option>
              <option value="manual">Manual (Request payout)</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      title: 'Review & Submit',
      icon: Shield,
      description: 'Review your verification details and submit',
      component: (
        <div className="space-y-4">
          <div className="bg-dark-input rounded-lg p-4">
            <h4 className="text-dark-text-primary font-medium mb-2">Contact Information</h4>
            <p className="text-dark-text-secondary">Phone: {formData.phone}</p>
            <p className="text-dark-text-secondary">Email: {formData.email}</p>
          </div>

          <div className="bg-dark-input rounded-lg p-4">
            <h4 className="text-dark-text-primary font-medium mb-2">Location</h4>
            <p className="text-dark-text-secondary">City: {formData.location.city}</p>
            <p className="text-dark-text-secondary">Region: {formData.location.country}</p>
          </div>

          <div className="bg-dark-input rounded-lg p-4">
            <h4 className="text-dark-text-primary font-medium mb-2">Payment & Security</h4>
            <p className="text-dark-text-secondary">Payment Method: {formData.payment.method}</p>
            <p className="text-dark-text-secondary">
              Security Deposit: {formData.payment.securityDeposit ? 'Agreed' : 'Not agreed'}
            </p>
            <p className="text-dark-text-secondary">
              Checkout Method: {formData.payment.checkoutMethod}
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep > index + 1
                  ? 'bg-green-600'
                  : currentStep === index + 1
                  ? 'bg-primary-600'
                  : 'bg-dark-input'
              }`}
            >
              {currentStep > index + 1 ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <step.icon className="w-5 h-5 text-white" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > index + 1 ? 'bg-green-600' : 'bg-dark-input'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step */}
      <div>
        <h3 className="text-xl font-semibold text-dark-text-primary mb-1">
          {steps[currentStep - 1].title}
        </h3>
        <p className="text-dark-text-secondary mb-6">
          {steps[currentStep - 1].description}
        </p>
        {steps[currentStep - 1].component}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            const prevStep = currentStep - 1
            if (prevStep >= 1) {
              setCurrentStep(prevStep)
              onStepChange(prevStep)
            }
          }}
          disabled={currentStep === 1}
          className="px-4 py-2 text-dark-text-secondary hover:text-dark-text-primary disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => handleStepComplete(formData)}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500"
        >
          {currentStep === steps.length ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  )
} 