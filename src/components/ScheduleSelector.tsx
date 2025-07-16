'use client';

import React, { useState, useEffect } from 'react';

interface ScheduleSelectorProps {
  onDateTimeChange: (date: Date) => void;
  error?: string;
}

export default function ScheduleSelector({ onDateTimeChange, error }: ScheduleSelectorProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [quickSchedule, setQuickSchedule] = useState('');

  // Get current date and time for minimum values
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);

  // Quick schedule options
  const quickOptions = [
    { label: 'In 1 hour', value: '1h', minutes: 60 },
    { label: 'In 2 hours', value: '2h', minutes: 120 },
    { label: 'Tomorrow 9 AM', value: 'tomorrow9', minutes: 0 },
    { label: 'Next week', value: 'nextweek', minutes: 0 },
  ];

  const handleQuickSchedule = (option: string) => {
    const now = new Date();
    let targetDate = new Date();

    switch (option) {
      case '1h':
        targetDate = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case '2h':
        targetDate = new Date(now.getTime() + 120 * 60 * 1000);
        break;
      case 'tomorrow9':
        targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(9, 0, 0, 0);
        break;
      case 'nextweek':
        targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + 7);
        targetDate.setHours(9, 0, 0, 0);
        break;
    }

    setQuickSchedule(option);
    setSelectedDate(targetDate.toISOString().split('T')[0]);
    setSelectedTime(targetDate.toTimeString().slice(0, 5));
    onDateTimeChange(targetDate);
  };

  const handleDateTimeChange = () => {
    if (selectedDate && selectedTime) {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);
      if (dateTime > new Date()) {
        onDateTimeChange(dateTime);
        setQuickSchedule(''); // Clear quick schedule when manual date is set
      }
    }
  };

  useEffect(() => {
    handleDateTimeChange();
  }, [selectedDate, selectedTime]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScheduledDateTime = () => {
    if (selectedDate && selectedTime) {
      return new Date(`${selectedDate}T${selectedTime}`);
    }
    return null;
  };

  const scheduledDateTime = getScheduledDateTime();

  return (
    <div className="space-y-4">
      {/* Quick Schedule Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Schedule
        </label>
        <div className="grid grid-cols-2 gap-2">
          {quickOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleQuickSchedule(option.value)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                quickSchedule === option.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Date/Time Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Date & Time
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setQuickSchedule(''); // Clear quick schedule
              }}
              min={currentDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => {
                setSelectedTime(e.target.value);
                setQuickSchedule(''); // Clear quick schedule
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Schedule Preview */}
      {scheduledDateTime && scheduledDateTime > new Date() && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="text-purple-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">
                Scheduled for {formatDateTime(scheduledDateTime)}
              </p>
              <p className="text-xs text-purple-600">
                {Math.round((scheduledDateTime.getTime() - new Date().getTime()) / (1000 * 60))} minutes from now
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Timezone Info */}
      <div className="text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
              clipRule="evenodd"
            />
          </svg>
          <span>Times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
        </div>
      </div>
    </div>
  );
}
