'use client';

import React from 'react';
import { isNonWorkingDay, getHolidayInfo, JORDANIAN_HOLIDAYS_2025 } from '@/utils/jordanian-holidays';

interface DatePickerProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  name,
  value,
  onChange,
  min,
  max,
  required = false,
  className = '',
  placeholder,  disabled = false,
}) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    
    // Check if the selected date is a non-working day
    if (isNonWorkingDay(selectedDate)) {
      const holidayInfo = getHolidayInfo(selectedDate);
      let message = '';
      
      if (holidayInfo) {
        message = `${holidayInfo.name} (${holidayInfo.description || 'Public Holiday'}) is not a working day. Please select a different date.`;
      } else {
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
        message = `${dayName} is not a working day in Jordan. Please select a weekday (Sunday-Thursday).`;
      }
      
      alert(message);
      
      // Clear the input
      event.target.value = '';
      if (onChange) {
        onChange(event);
      }
      return;
    }
    
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className="relative">
      <input
        type="date"
        id={id}
        name={name}
        value={value}
        onChange={handleDateChange}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition
          focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary
          ${className}
        `}
      />
      
      {/* Holiday Information Tooltip */}
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>🚫</span>
          <span>Weekends (Fri-Sat) and public holidays are automatically excluded</span>
        </div>
        
        {/* Show upcoming holidays */}
        <div className="mt-1">
          <details className="cursor-pointer">
            <summary className="text-primary hover:underline">
              View Jordanian Public Holidays 2025
            </summary>
            <div className="mt-2 max-h-32 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-800">
              {JORDANIAN_HOLIDAYS_2025.map((holiday, index) => (
                <div key={index} className="flex justify-between items-center py-1 text-xs">
                  <span className="font-medium">{holiday.name}</span>
                  <span className="text-gray-500">{new Date(holiday.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
