'use client';

import React from 'react';

interface SimpleDatePickerProps {
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

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = (props) => {
  return (
    <input
      type="date"
      {...props}
      className={`
        w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition
        focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
        dark:bg-form-input dark:text-white dark:focus:border-primary
        ${props.className || ''}
      `}
    />
  );
};

export default SimpleDatePicker;
