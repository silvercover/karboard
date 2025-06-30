import React, { useRef, useState } from 'react';
import { Upload, File, X, Download } from 'lucide-react';
import { FileAttachment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
}

export function FileUpload({ attachments, onAttachmentsChange }: FileUploadProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const fileId = uuidv4();
      const newAttachment: FileAttachment = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: '',
        uploadProgress: 0
      };

      // Immediately add to attachments - this will trigger auto-save in CardModal
      onAttachmentsChange([...attachments, newAttachment]);
      setUploadingFiles(prev => [...prev, fileId]);

      simulateFileUpload(file, fileId);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateFileUpload = (file: File, fileId: string) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Update attachment with final URL and remove progress
          onAttachmentsChange(prev => 
            prev.map(att => 
              att.id === fileId 
                ? { ...att, url: reader.result as string, uploadProgress: undefined }
                : att
            )
          );
          setUploadingFiles(prev => prev.filter(id => id !== fileId));
        } else {
          // Update progress
          onAttachmentsChange(prev => 
            prev.map(att => 
              att.id === fileId 
                ? { ...att, uploadProgress: Math.round(progress) }
                : att
            )
          );
        }
      }, 200);
    };

    reader.readAsDataURL(file);
  };

  const removeAttachment = (fileId: string) => {
    // Immediately remove from attachments - this will trigger auto-save in CardModal
    onAttachmentsChange(attachments.filter(att => att.id !== fileId));
    setUploadingFiles(prev => prev.filter(id => id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (attachment: FileAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3 w-full">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 w-full"
      >
        <Upload className="w-4 h-4" />
        <span className="text-sm">{t('attachment.upload')}</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1 min-w-0">
                <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {attachment.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)}
                  </div>
                  
                  {attachment.uploadProgress !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>{t('attachment.uploading')}</span>
                        <span>{attachment.uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${attachment.uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 rtl:space-x-reverse ml-3 rtl:mr-3 rtl:ml-0">
                {attachment.url && attachment.uploadProgress === undefined && (
                  <button
                    onClick={() => downloadFile(attachment)}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                    title={t('attachment.download')}
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors"
                  title={t('attachment.remove')}
                >
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}