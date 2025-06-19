'use client';

import React from 'react';

interface JordanianDatePickerProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const JordanianDatePicker: React.FC<JordanianDatePickerProps> = ({
  id,
  name,
  value,
  onChange,
  min,
  max,
  required = false,
  className = '',
  disabled = false,
}) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        value={value || ''}
        onChange={handleDateChange}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        className={`
          w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition
          focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
          dark:bg-form-input dark:text-white dark:focus:border-primary
          ${className}
        `}
      />
      
      {/* Holiday Information */}
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>ℹ️</span>
          <span>Note: Weekends and public holidays are automatically excluded from leave calculations</span>
        </div>
      </div>
    </div>
  );
};

export default JordanianDatePicker;
