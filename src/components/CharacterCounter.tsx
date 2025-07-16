'use client';

import React from 'react';
import { PLATFORM_CONFIGS } from '@/types/post';

interface CharacterCounterProps {
  content: string;
  limit: number;
  selectedPlatforms: string[];
}

export default function CharacterCounter({ content, limit, selectedPlatforms }: CharacterCounterProps) {
  const currentLength = content.length;
  const isOverLimit = currentLength > limit;
  const isNearLimit = currentLength > limit * 0.8;

  const getProgressColor = () => {
    if (isOverLimit) return 'text-red-600';
    if (isNearLimit) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProgressBarColor = () => {
    if (isOverLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const progressPercentage = Math.min((currentLength / limit) * 100, 100);

  return (
    <div className="flex items-center space-x-3">
      {/* Platform-specific limits */}
      {selectedPlatforms.length > 0 && (
        <div className="flex space-x-2">
          {selectedPlatforms.map(platform => {
            const config = PLATFORM_CONFIGS[platform];
            if (!config) return null;
            
            const platformLength = currentLength;
            const platformLimit = config.maxCharacters;
            const platformOverLimit = platformLength > platformLimit;
            
            return (
              <div
                key={platform}
                className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
                  platformOverLimit ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                }`}
                title={`${config.name}: ${platformLength}/${platformLimit} characters`}
              >
                <span>{config.icon}</span>
                <span className={platformOverLimit ? 'font-semibold' : ''}>
                  {platformLength}/{platformLimit}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Overall counter */}
      <div className="flex items-center space-x-2">
        <div className={`text-sm font-medium ${getProgressColor()}`}>
          {currentLength}/{limit}
        </div>
        
        {/* Progress circle */}
        <div className="relative w-8 h-8">
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
            {/* Background circle */}
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - progressPercentage / 100)}`}
              className={getProgressBarColor()}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Warning icon when over limit */}
          {isOverLimit && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
