import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Image } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  partnerData: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface DocumentFile {
  file: File | null;
  preview?: string;
  uploaded: boolean;
  uploading: boolean;
}

interface Documents {
  identity_proof: DocumentFile;
  address_proof: DocumentFile;
  business_license: DocumentFile;
  gst_certificate: DocumentFile;
  pan_card: DocumentFile;
  bank_statement: DocumentFile;
  profile_image: DocumentFile;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  partnerData
}) => {
  const [documents, setDocuments] = useState<Documents>({
    identity_proof: { file: null, uploaded: false, uploading: false },
    address_proof: { file: null, uploaded: false, uploading: false },
    business_license: { file: null, uploaded: false, uploading: false },
    gst_certificate: { file: null, uploaded: false, uploading: false },
    pan_card: { file: null, uploaded: false, uploading: false },
    bank_statement: { file: null, uploaded: false, uploading: false },
    profile_image: { file: null, uploaded: false, uploading: false }
  });

  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    {
      key: 'profile_image' as keyof Documents,
      label: 'Profile Image',
      description: 'Professional photo of the partner',
      required: true,
      accept: 'image/*'
    },
    {
      key: 'identity_proof' as keyof Documents,
      label: 'Identity Proof',
      description: 'Aadhar Card, Passport, or Driving License',
      required: true,
      accept: 'image/*,.pdf'
    },
    {
      key: 'address_proof' as keyof Documents,
      label: 'Address Proof',
      description: 'Utility bill, Bank statement, or Rental agreement',
      required: true,
      accept: 'image/*,.pdf'
    },
    {
      key: 'business_license' as keyof Documents,
      label: 'Business License',
      description: 'Trade license or Business registration certificate',
      required: true,
      accept: 'image/*,.pdf'
    },
    {
      key: 'pan_card' as keyof Documents,
      label: 'PAN Card',
      description: 'Permanent Account Number card',
      required: true,
      accept: 'image/*,.pdf'
    },
    {
      key: 'gst_certificate' as keyof Documents,
      label: 'GST Certificate',
      description: 'GST registration certificate (if applicable)',
      required: false,
      accept: 'image/*,.pdf'
    },
    {
      key: 'bank_statement' as keyof Documents,
      label: 'Bank Statement',
      description: 'Recent bank statement',
      required: true,
      accept: 'image/*,.pdf'
    }
  ];

  const handleFileSelect = (documentType: keyof Documents, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocuments(prev => ({
        ...prev,
        [documentType]: {
          file,
          preview: e.target?.result as string,
          uploaded: false,
          uploading: false
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const uploadDocument = async (documentType: keyof Documents) => {
    const document = documents[documentType];
    if (!document.file || !partnerData) return;

    setDocuments(prev => ({
      ...prev,
      [documentType]: { ...prev[documentType], uploading: true }
    }));

    try {
      const formData = new FormData();
      formData.append('file', document.file);  // Changed from 'document' to 'file' to match backend
      formData.append('type', documentType);  // Changed from 'documentType' to 'type' to match backend
      formData.append('partnerId', partnerData.id);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setDocuments(prev => ({
          ...prev,
          [documentType]: { 
            ...prev[documentType], 
            uploaded: true, 
            uploading: false 
          }
        }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setDocuments(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], uploading: false }
      }));
      alert('Failed to upload document. Please try again.');
    }
  };

  const uploadAllDocuments = async () => {
    setUploading(true);
    
    try {
      const uploadPromises = Object.entries(documents)
        .filter(([_, doc]) => doc.file && !doc.uploaded)
        .map(([type, _]) => uploadDocument(type as keyof Documents));

      await Promise.all(uploadPromises);
      
      // Check if all required documents are uploaded
      const requiredDocs = documentTypes.filter(doc => doc.required);
      const uploadedRequiredDocs = requiredDocs.filter(doc => 
        documents[doc.key].uploaded
      );

      if (uploadedRequiredDocs.length === requiredDocs.length) {
        onComplete();
      } else {
        alert('Please upload all required documents before proceeding.');
      }
    } catch (error) {
      console.error('Batch upload error:', error);
      alert('Some documents failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getUploadedCount = () => {
    return Object.values(documents).filter(doc => doc.uploaded).length;
  };

  const getRequiredCount = () => {
    return documentTypes.filter(doc => doc.required).length;
  };

  if (!isOpen || !partnerData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-kuddl-green">Document Upload</h2>
            <p className="text-gray-600">
              Upload documents for <span className="font-medium">{partnerData.name}</span>
            </p>
            <div className="mt-2 text-sm text-kuddl-orange">
              {getUploadedCount()}/{documentTypes.length} documents uploaded 
              ({getRequiredCount()} required)
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {documentTypes.map((docType) => {
            const document = documents[docType.key];
            const isImage = docType.key === 'profile_image' || 
                           (document.file && document.file.type.startsWith('image/'));

            return (
              <div key={docType.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      {isImage ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      {docType.label}
                      {docType.required && <span className="text-red-500">*</span>}
                    </h3>
                    <p className="text-sm text-gray-600">{docType.description}</p>
                  </div>
                  {document.uploaded && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>

                {document.file ? (
                  <div className="space-y-3">
                    {document.preview && isImage && (
                      <img
                        src={document.preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded border"
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate">
                        {document.file.name}
                      </span>
                      {!document.uploaded && (
                        <button
                          onClick={() => uploadDocument(docType.key)}
                          disabled={document.uploading}
                          className="px-3 py-1 bg-kuddl-green text-white text-sm rounded hover:bg-kuddl-green/90 disabled:opacity-50"
                        >
                          {document.uploading ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-kuddl-orange transition-colors">
                    <input
                      type="file"
                      accept={docType.accept}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(docType.key, file);
                      }}
                      className="hidden"
                      id={`file-${docType.key}`}
                    />
                    <label
                      htmlFor={`file-${docType.key}`}
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {docType.accept.includes('image') ? 'Images' : 'PDF'} up to 10MB
                      </span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-kuddl-cream/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-kuddl-orange mt-0.5" />
            <div>
              <p className="text-sm font-medium text-kuddl-green">Document Guidelines</p>
              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                <li>• All documents should be clear and readable</li>
                <li>• File size should not exceed 10MB per document</li>
                <li>• Accepted formats: JPG, PNG, PDF</li>
                <li>• Documents will be reviewed within 24-48 hours</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={uploadAllDocuments}
            disabled={uploading || Object.values(documents).every(doc => !doc.file)}
            className="flex-1 px-4 py-3 bg-kuddl-green text-white rounded-lg hover:bg-kuddl-green/90 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading Documents...' : 'Upload All Documents'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
