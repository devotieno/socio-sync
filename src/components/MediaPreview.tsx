'use client';

import React from 'react';
import { MediaFile } from '@/types/post';

interface MediaPreviewProps {
  mediaFiles: MediaFile[];
  maxDisplay?: number;
}

export function MediaPreview({ mediaFiles, maxDisplay = 4 }: MediaPreviewProps) {
  const displayFiles = mediaFiles.slice(0, maxDisplay);
  const remainingCount = mediaFiles.length - maxDisplay;

  if (!mediaFiles.length) return null;

  return (
    <div className="mt-4">
      <span className="text-sm font-medium text-gray-700 mb-2 block">Media:</span>
      <div className="flex space-x-2">
        {displayFiles.map((media, index) => (
          <div key={media.id} className="relative group">
            {media.type === 'image' ? (
              <div className="relative">
                <img
                  src={media.url}
                  alt={media.filename}
                  className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                  title={media.filename}
                />
                {/* Overlay for remaining count */}
                {index === maxDisplay - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                    +{remainingCount}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors group">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                {/* Video overlay info */}
                <div className="absolute -bottom-6 left-0 text-xs text-gray-500 truncate w-16">
                  {media.filename}
                </div>
                {/* Overlay for remaining count */}
                {index === maxDisplay - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                    +{remainingCount}
                  </div>
                )}
              </div>
            )}
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {media.filename}
              <div className="text-gray-300">
                {(media.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* File count info */}
      <div className="mt-2 text-xs text-gray-500">
        {mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''} attached
        {mediaFiles.reduce((total, file) => total + file.size, 0) > 0 && (
          <span className="ml-2">
            • {(mediaFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB total
          </span>
        )}
      </div>
    </div>
  );
}
