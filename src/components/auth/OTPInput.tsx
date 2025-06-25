'use client';

import React, { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = false
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(length).fill(null));

  // Update local state when prop value changes
  useEffect(() => {
    const otpArray = value.split('').slice(0, length);
    const paddedArray = [...otpArray, ...new Array(length - otpArray.length).fill('')];
    setOtp(paddedArray);
  }, [value, length]);

  // Auto focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (disabled) return;

    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange(otpString);

    // Move to next input
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const pastedOtp = text.replace(/\D/g, '').slice(0, length);
        const otpArray = pastedOtp.split('');
        const paddedArray = [...otpArray, ...new Array(length - otpArray.length).fill('')];
        setOtp(paddedArray);
        onChange(pastedOtp);

        // Focus appropriate input
        const nextIndex = Math.min(pastedOtp.length, length - 1);
        inputRefs.current[nextIndex]?.focus();

        if (pastedOtp.length === length && onComplete) {
          onComplete(pastedOtp);
        }
      }).catch((err) => {
        console.error('Failed to read clipboard:', err);
      });
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={handleFocus}
          disabled={disabled}
          className={`
            w-12 h-12 text-center text-lg font-semibold
            border-2 rounded-lg
            focus:outline-none focus:ring-2
            transition-all duration-200
            ${
              error
                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-200'
                : disabled
                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-400'
            }
          `}
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OTPInput;
