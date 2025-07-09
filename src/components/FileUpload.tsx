import React, { useRef, useState } from 'react';
import { Upload, File, X, Download, Eye } from 'lucide-react';
import { FileAttachment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { indexedDBManager } from '../utils/indexedDB';
import { v4 as uuidv4 } from 'uuid';
import { ImageModal } from './ImageModal';

interface FileUploadProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
}

export function FileUpload({ attachments, onAttachmentsChange }: FileUploadProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      // Check file size (limit to 10MB to prevent storage issues)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return;
      }

      const fileId = uuidv4();
      const newAttachment: FileAttachment = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileId, // Use the ID as reference
        uploadProgress: 0,
        isExternal: false
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

  const simulateFileUpload = async (file: File, fileId: string) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        let progress = 0;
        const interval = setInterval(async () => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            try {
              // Save file to IndexedDB
              await indexedDBManager.saveAttachment(
                fileId,
                file.name,
                file.size,
                file.type,
                reader.result as string
              );

              // Update attachment with final status and remove progress
              onAttachmentsChange(prev => 
                prev.map(att => 
                  att.id === fileId 
                    ? { ...att, uploadProgress: undefined }
                    : att
                )
              );
              setUploadingFiles(prev => prev.filter(id => id !== fileId));
            } catch (error) {
              console.error('Failed to save file to IndexedDB:', error);
              // Remove failed upload from attachments
              onAttachmentsChange(prev => prev.filter(att => att.id !== fileId));
              setUploadingFiles(prev => prev.filter(id => id !== fileId));
              alert('Failed to upload file. Please try again.');
            }
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
    } catch (error) {
      console.error('Failed to read file:', error);
      // Remove failed upload from attachments
      onAttachmentsChange(prev => prev.filter(att => att.id !== fileId));
      setUploadingFiles(prev => prev.filter(id => id !== fileId));
      alert('Failed to read file. Please try again.');
    }
  };

  const removeAttachment = async (fileId: string) => {
    try {
      // Remove from IndexedDB if it's not an external file
      const attachment = attachments.find(att => att.id === fileId);
      if (attachment && !attachment.isExternal) {
        await indexedDBManager.deleteAttachment(fileId);
      }
      
      // Immediately remove from attachments - this will trigger auto-save in CardModal
      onAttachmentsChange(attachments.filter(att => att.id !== fileId));
      setUploadingFiles(prev => prev.filter(id => id !== fileId));
    } catch (error) {
      console.error('Failed to remove attachment:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = async (attachment: FileAttachment) => {
    try {
      let dataUrl: string;
      
      if (attachment.isExternal) {
        // For external URLs, just open them
        window.open(attachment.url, '_blank');
        return;
      } else {
        // For IndexedDB files, get the data
        const data = await indexedDBManager.getAttachment(attachment.id);
        if (!data) {
          alert('File not found');
          return;
        }
        dataUrl = data;
      }

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Failed to download file');
    }
  };

  const isImageFile = (type: string) => {
    return type.startsWith('image/');
  };

  const handleFileClick = async (attachment: FileAttachment) => {
    if (isImageFile(attachment.type)) {
      try {
        let imageUrl: string;
        
        if (attachment.isExternal) {
          imageUrl = attachment.url;
        } else {
          const data = await indexedDBManager.getAttachment(attachment.id);
          if (!data) {
            alert('File not found');
            return;
          }
          imageUrl = data;
        }
        
        setSelectedImage({ url: imageUrl, name: attachment.name });
      } catch (error) {
        console.error('Failed to load image:', error);
        alert('Failed to load image');
      }
    } else {
      downloadFile(attachment);
    }
  };

  return (
    <>
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
                {isImageFile(attachment.type) ? (
                  <Eye className="w-4 h-4 text-blue-500 flex-shrink-0" />
                ) : (
                  <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div 
                    className={`text-sm font-medium truncate cursor-pointer ${
                      isImageFile(attachment.type) ? 'text-blue-600 hover:text-blue-700' : 'text-gray-800'
                    }`}
                    onClick={() => handleFileClick(attachment)}
                  >
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
                {attachment.uploadProgress === undefined && (
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

      <ImageModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage?.url || ''}
        imageName={selectedImage?.name || ''}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}