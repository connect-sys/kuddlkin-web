import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, Image, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

interface DocumentUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  showExistingDocuments?: boolean;
  maxSizePerFile?: number; // in MB
  partnerId?: string;
  documentType?: string;
}

interface ExistingDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSizePerFile = 5,
  partnerId = 'temp_partner_id',
  documentType = 'general'
}) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Validate file count
    if (documents.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of fileArray) {
      // Check file type with more flexible validation
      const isValidType = acceptedTypes.some(acceptedType => {
        if (acceptedType.includes('*')) {
          // Handle wildcard types like 'image/*'
          const baseType = acceptedType.split('/')[0];
          return file.type.startsWith(baseType + '/');
        } else if (acceptedType.startsWith('.')) {
          // Handle file extensions like '.pdf'
          const extension = acceptedType.toLowerCase();
          const fileName = file.name.toLowerCase();
          return fileName.endsWith(extension);
        } else {
          // Handle specific MIME types, but be flexible with JPEG variations
          if (acceptedType === 'image/jpeg' && (file.type === 'image/jpg' || file.type === 'image/jpeg')) {
            return true;
          }
          return file.type === acceptedType;
        }
      });

      if (!isValidType) {
        toast.error(`${file.name}: File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
        continue;
      }

      // Check file size
      if (file.size > maxSizePerFile * 1024 * 1024) {
        toast.error(`${file.name}: File size exceeds ${maxSizePerFile}MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Add files to state with uploading status
    const newDocuments: UploadedDocument[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    // Upload files to R2
    newDocuments.forEach((doc, index) => {
      uploadToR2(doc.id, validFiles[index]);
    });

    onUpload(validFiles);
  };

  const uploadToR2 = async (docId: string, file: File) => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      const formData = new FormData();
      formData.append('file', file);  // Changed from 'document' to 'file' to match backend
      formData.append('type', documentType);  // Changed from 'documentType' to 'type' to match backend
      formData.append('partnerId', partnerId);

      // Simulate progress updates
      let progress = 0;
      progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress < 90) {
          setDocuments(prev => prev.map(doc => 
            doc.id === docId ? { ...doc, progress } : doc
          ));
        }
      }, 300);

      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await fetch(`${apiUrl}/api/documents/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (progressInterval) clearInterval(progressInterval);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      setDocuments(prev => prev.map(doc => 
        doc.id === docId ? { 
          ...doc, 
          status: 'completed', 
          progress: 100,
          url: result.fileUrl || result.url
        } : doc
      ));

      // Persist to localStorage for session persistence
      const persistedDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
      const newDoc = {
        id: docId,
        name: file.name,
        type: file.type,
        size: file.size,
        url: result.fileUrl || result.url,
        uploadedAt: new Date().toISOString(),
        documentType: documentType
      };
      persistedDocs.push(newDoc);
      localStorage.setItem('uploadedDocuments', JSON.stringify(persistedDocs));

      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      if (progressInterval) clearInterval(progressInterval);
      
      setDocuments(prev => prev.map(doc => 
        doc.id === docId ? { ...doc, status: 'error', progress: 0 } : doc
      ));

      toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Load persisted documents on component mount
  useEffect(() => {
    const persistedDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
    const relevantDocs = persistedDocs
      .filter((doc: any) => doc.documentType === documentType)
      .map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        url: doc.url,
        status: 'completed' as const,
        progress: 100
      }));
    
    if (relevantDocs.length > 0) {
      setDocuments(relevantDocs);
    }
  }, [documentType]);

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return '🖼️';
    } else if (type === 'application/pdf') {
      return '📄';
    }
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-[#578f82] bg-[#578f82]/5'
            : 'border-gray-300 hover:border-[#578f82] hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-[#578f82]' : 'text-gray-400'}`} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Documents
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop files here, or click to browse
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-[#578f82] to-[#cf956d] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <div className="mt-4 text-sm text-gray-500">
          <p>Supported formats: JPG, PNG, PDF</p>
          <p>Maximum file size: {maxSizePerFile}MB</p>
          <p>Maximum {maxFiles} files</p>
        </div>
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900">Uploaded Documents</h4>
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-2xl">{getFileIcon(doc.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Icon */}
                  {doc.status === 'uploading' && (
                    <div className="w-5 h-5 border-2 border-[#578f82]/30 border-t-[#578f82] rounded-full animate-spin" />
                  )}
                  {doc.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {doc.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}

                  {/* Preview Button */}
                  {doc.status === 'completed' && doc.url && (
                    <button
                      onClick={() => window.open(doc.url, '_blank')}
                      className="p-1 text-gray-400 hover:text-[#578f82] transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {doc.status === 'uploading' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{Math.round(doc.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#578f82] to-[#cf956d] h-2 rounded-full transition-all duration-200"
                      style={{ width: `${doc.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default DocumentUpload;
