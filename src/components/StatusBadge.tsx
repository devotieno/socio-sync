'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const styles = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    published: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
  };

  const icons = {
    draft: '📝',
    scheduled: '⏰',
    published: '✅',
    failed: '❌',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full font-medium border ${styles[status]} ${sizeClasses[size]}`}>
      <span>{icons[status]}</span>
      <span className="capitalize">{status}</span>
    </span>
  );
}
