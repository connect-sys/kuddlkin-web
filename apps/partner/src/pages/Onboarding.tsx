import React, { useState } from 'react'
import StepIndicator from '../components/onboarding/StepIndicator'
import ProfileForm from '../components/onboarding/ProfileForm'
import KYCUpload from '../components/onboarding/KYCUpload'
import { CheckCircle } from 'lucide-react'

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const steps = [
    { id: 1, title: 'Business Profile', description: 'Tell us about your business' },
    { id: 2, title: 'KYC Verification', description: 'Upload verification documents' },
    { id: 3, title: 'Complete', description: 'You\'re all set!' }
  ]

  const handleStepComplete = (step: number) => {
    setCompletedSteps(prev => [...prev, step])
    if (step < steps.length) {
      setCurrentStep(step + 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ProfileForm onComplete={() => handleStepComplete(1)} />
      case 2:
        return <KYCUpload onComplete={() => handleStepComplete(2)} />
      case 3:
        return (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Kuddl!</h2>
            <p className="text-gray-600 mb-6">
              Your account is being reviewed. You'll receive an email once approved.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Go to Dashboard
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Let's get you set up to start receiving bookings
          </p>
        </div>

        <StepIndicator 
          steps={steps} 
          currentStep={currentStep} 
          completedSteps={completedSteps}
        />

        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          {renderStepContent()}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
