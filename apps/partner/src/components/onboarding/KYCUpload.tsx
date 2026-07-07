import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '../common/Button'

interface KYCUploadProps {
  onComplete: () => void
}

const KYCUpload: React.FC<KYCUploadProps> = ({ onComplete }) => {
  const [uploadedFiles, setUploadedFiles] = useState<{
    idProof?: File
    addressProof?: File
    businessProof?: File
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileUpload = (type: 'idProof' | 'addressProof' | 'businessProof', file: File) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call for KYC upload
      await new Promise(resolve => setTimeout(resolve, 3000))
      onComplete()
    } catch (error) {
      console.error('Error uploading KYC:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const FileUploadBox: React.FC<{
    title: string
    description: string
    type: 'idProof' | 'addressProof' | 'businessProof'
    required?: boolean
  }> = ({ title, description, type, required = false }) => {
    const file = uploadedFiles[type]
    
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
        <div className="text-center">
          {file ? (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-8 h-8" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">Uploaded successfully</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {title}
                {required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{description}</p>
            </>
          )}
          
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile) {
                handleFileUpload(type, selectedFile)
              }
            }}
            className="hidden"
            id={`file-${type}`}
          />
          <label
            htmlFor={`file-${type}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2" />
            {file ? 'Change File' : 'Choose File'}
          </label>
        </div>
      </div>
    )
  }

  const isFormValid = uploadedFiles.idProof && uploadedFiles.addressProof

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Verification</h2>
        <p className="text-gray-600">
          Upload the required documents to verify your identity and business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadBox
          title="ID Proof"
          description="Aadhaar Card, PAN Card, or Passport (PDF/Image)"
          type="idProof"
          required
        />
        
        <FileUploadBox
          title="Address Proof"
          description="Utility Bill, Bank Statement, or Rental Agreement"
          type="addressProof"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FileUploadBox
          title="Business Proof (Optional)"
          description="GST Certificate, Shop License, or Business Registration"
          type="businessProof"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All documents should be clear and readable</li>
              <li>Accepted formats: PDF, JPG, JPEG, PNG</li>
              <li>Maximum file size: 5MB per document</li>
              <li>KYC verification typically takes 24-48 hours</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline">
          Back to Profile
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          loading={isSubmitting}
          className="px-8"
        >
          Submit for Verification
        </Button>
      </div>
    </div>
  )
}

export default KYCUpload
