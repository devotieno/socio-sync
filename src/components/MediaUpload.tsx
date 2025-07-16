'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PLATFORM_CONFIGS } from '@/types/post';

interface MediaUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  selectedPlatforms: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export default function MediaUpload({
  files,
  onFilesChange,
  selectedPlatforms,
  maxFiles = 4,
  maxFileSize = 10,
}: MediaUploadProps) {
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Get supported file types based on selected platforms
  const getSupportedTypes = () => {
    if (selectedPlatforms.length === 0) {
      return ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    }

    const supportedTypes = new Set<string>();
    selectedPlatforms.forEach(platform => {
      const config = PLATFORM_CONFIGS[platform];
      if (config?.supportedMediaTypes) {
        config.supportedMediaTypes.forEach(type => supportedTypes.add(type));
      }
    });

    return Array.from(supportedTypes);
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const errors: string[] = [];
    
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors: fileErrors }) => {
      fileErrors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          errors.push(`${file.name} is too large (max ${maxFileSize}MB)`);
        } else if (error.code === 'file-invalid-type') {
          errors.push(`${file.name} is not a supported file type`);
        } else if (error.code === 'too-many-files') {
          errors.push(`Too many files. Maximum ${maxFiles} files allowed`);
        }
      });
    });

    // Check if adding these files would exceed the limit
    if (files.length + acceptedFiles.length > maxFiles) {
      errors.push(`Cannot add ${acceptedFiles.length} files. Maximum ${maxFiles} files allowed`);
      setUploadErrors(errors);
      return;
    }

    setUploadErrors(errors);
    
    if (acceptedFiles.length > 0) {
      onFilesChange([...files, ...acceptedFiles]);
    }
  }, [files, onFilesChange, maxFiles, maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getSupportedTypes().reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: maxFiles - files.length,
    maxSize: maxFileSize * 1024 * 1024, // Convert MB to bytes
    disabled: files.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    setUploadErrors([]); // Clear errors when removing files
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const supportedTypes = getSupportedTypes();

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : files.length >= maxFiles
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl">
            {isDragActive ? '📤' : '📎'}
          </div>
          {files.length >= maxFiles ? (
            <div>
              <p className="text-gray-500">Maximum {maxFiles} files reached</p>
              <p className="text-sm text-gray-400">Remove a file to add more</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-700">
                {isDragActive ? 'Drop files here' : 'Drag & drop media files here'}
              </p>
              <p className="text-sm text-gray-500">or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">
                Max {maxFiles} files, {maxFileSize}MB each
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Supported Formats */}
      {selectedPlatforms.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Supported formats:</p>
          <div className="flex flex-wrap gap-1">
            {supportedTypes.map(type => (
              <span
                key={type}
                className="px-2 py-1 bg-white text-xs text-gray-600 rounded border"
              >
                {type.split('/')[1].toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          {uploadErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {files.map((file, index) => {
              const preview = getFilePreview(file);
              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
                >
                  {/* File Preview */}
                  <div className="flex-shrink-0">
                    {preview ? (
                      <img
                        src={preview}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xl">
                          {file.type.startsWith('video/') ? '🎥' : '📄'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
