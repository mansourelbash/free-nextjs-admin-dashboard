import { useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import { CalenderIcon } from '../../icons';
import { getJordanianHolidays, getHolidayInfo, isWeekend as isJordanianWeekend } from '../../utils/jordanian-holidays';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type JordanianDatePickerProps = {
  id: string;
  mode?: "single" | "multiple" | "range";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  minDate?: DateOption;
  maxDate?: DateOption;
};

export default function JordanianDatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  minDate,
  maxDate,
}: JordanianDatePickerProps) {  useEffect(() => {
    // Inject custom CSS for Jordanian date picker
    const styleId = 'jordanian-flatpickr-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Jordanian Flatpickr Custom Styles */
        .flatpickr-day.weekend-day.disabled-day {
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
          cursor: default !important;
          pointer-events: none !important;
          opacity: 0.5 !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: none !important;
          transform: none !important;
        }
        
        .flatpickr-day.holiday-day.disabled-day {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
          color: #92400e !important;
          cursor: default !important;
          pointer-events: all !important;
          opacity: 1 !important;
          border: 2px solid #f59e0b !important;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2) !important;
          transform: none !important;
          position: relative !important;
          font-weight: 600 !important;
        }
        
        .flatpickr-day.holiday-day.disabled-day:hover {
          background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%) !important;
          box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3) !important;
        }
        
        .holiday-tooltip {
          position: absolute !important;
          bottom: 100% !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background-color: #1f2937 !important;
          color: white !important;
          padding: 8px 12px !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          white-space: nowrap !important;
          z-index: 1000 !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 0.2s ease-in-out !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
          margin-bottom: 5px !important;
        }
        
        .holiday-tooltip::after {
          content: '';
          position: absolute !important;
          top: 100% !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 0 !important;
          height: 0 !important;
          border-left: 5px solid transparent !important;
          border-right: 5px solid transparent !important;
          border-top: 5px solid #1f2937 !important;
        }
      `;
      document.head.appendChild(style);
    }    // Get holidays for current year and next year to cover calendar navigation
    const currentYear = new Date().getFullYear();
    
    // Get all holidays from utility functions for multiple years (dynamic, not hardcoded)
    const currentYearHolidays = getJordanianHolidays(currentYear);
    const nextYearHolidays = getJordanianHolidays(currentYear + 1);
    const yearAfterNextHolidays = getJordanianHolidays(currentYear + 2);    // Debug: Check if Hijri New Year 2025 is in the holidays
    console.log('🎯 Checking 2025 holidays from utility:');
    console.log('🎯 Current year holidays count:', currentYearHolidays.length);
    console.log('🎯 June 2025 holidays:', currentYearHolidays.filter(h => h.includes('2025-06')));
    
    // Test specific date
    const hijriDate = new Date('2025-06-26');
    console.log('🎯 Testing 2025-06-26:');
    console.log('🎯 Date object:', hijriDate);
    console.log('🎯 ISO string:', hijriDate.toISOString());
    console.log('🎯 Date part:', hijriDate.toISOString().split('T')[0]);
    console.log('🎯 Is in holiday list:', currentYearHolidays.includes('2025-06-26'));
    
    // Combine all holiday dates from utility
    const allHolidayDates = [...currentYearHolidays, ...nextYearHolidays, ...yearAfterNextHolidays];
    
    // Create holiday map with names using utility function
    const holidayMap = new Map<string, string>();
    allHolidayDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const holidayInfo = getHolidayInfo(date);
      if (holidayInfo) {
        holidayMap.set(dateStr, holidayInfo.name);
      }    });
    
    // Use utility functions for weekend and holiday checks
    const isWeekend = isJordanianWeekend;  // Use utility function    // Function to check if date is holiday using utility function
    const isHoliday = (date: Date): boolean => {
      const dateStr = date.toISOString().split('T')[0];
      const result = holidayMap.has(dateStr);
      return result;
    };

    // Function to get holiday name using utility function
    const getHolidayName = (date: Date): string | null => {
      const holidayInfo = getHolidayInfo(date);
      return holidayInfo ? holidayInfo.name : null;
    };// Function to check if date is disabled (weekend or holiday) - use utility function
    const isDisabledDate = (date: Date): boolean => {
      return isWeekend(date) || isHoliday(date);
    };

    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      minDate: minDate || "today",
      maxDate,
      onChange,      // Disable weekends (Friday=5, Saturday=6) and holidays
      disable: [
        // Single function to disable both weekends and holidays
        function(date: Date) {
          return isWeekend(date) || isHoliday(date);
        }
      ],      // Custom styling for disabled dates
      onDayCreate: function(dObj, dStr, fp, dayElem) {
        const date = dayElem.dateObj;
        const dateStr = date.toISOString().split('T')[0];
          // Handle weekends
        if (isWeekend(date)) {
          dayElem.classList.add('weekend-day', 'disabled-day');
          dayElem.setAttribute('aria-hidden', 'true');
        }
        // Hard-coded test for June 26, 2025 (Hijri New Year)
        else if (dateStr === '2025-06-26') {
          console.log('🟡 HARD-CODED TEST: Found June 26, 2025 - applying holiday styling');
          dayElem.classList.add('holiday-day', 'disabled-day');
          dayElem.style.cssText = `
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
            color: #92400e !important;
            cursor: default !important;
            pointer-events: all !important;
            opacity: 0.8 !important;
            border: 2px solid #f59e0b !important;
            box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2) !important;
            transform: none !important;
            position: relative !important;
            font-weight: 600 !important;
          `;
          
          // Add tooltip
          dayElem.setAttribute('data-tooltip', 'Hijri New Year (Islamic New Year)');
          dayElem.setAttribute('aria-label', 'Holiday: Hijri New Year (Islamic New Year)');
        }        // Handle holidays
        else if (isHoliday(date)) {
          const holidayName = getHolidayName(date);
          dayElem.classList.add('holiday-day', 'disabled-day');
          
          // Debug log for important dates
          if (dateStr.includes('2025-06-26')) {
            console.log('🎨 Applying holiday styling to:', dateStr, 'Name:', holidayName);
          }
          
          // Apply holiday styling directly with !important to override any conflicting styles
          dayElem.style.cssText = `
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
            color: #92400e !important;
            cursor: default !important;
            pointer-events: all !important;
            opacity: 0.8 !important;
            border: 2px solid #f59e0b !important;
            box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2) !important;
            transform: none !important;
            position: relative !important;
            font-weight: 600 !important;
          `;
          
          // Add tooltip functionality for holidays
          if (holidayName) {
            dayElem.setAttribute('data-tooltip', holidayName);
            dayElem.setAttribute('aria-label', `Holiday: ${holidayName}`);
            
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'holiday-tooltip';
            tooltip.textContent = holidayName;
            
            // Add hover events for tooltip
            dayElem.addEventListener('mouseenter', () => {
              dayElem.appendChild(tooltip);
              setTimeout(() => tooltip.style.opacity = '1', 10);
            });
            
            dayElem.addEventListener('mouseleave', () => {
              tooltip.style.opacity = '0';
              setTimeout(() => {
                if (tooltip.parentNode) {
                  tooltip.parentNode.removeChild(tooltip);
                }
              }, 200);
            });
          }
          
          // Prevent selection but allow hover
          dayElem.onclick = (e: Event) => { e.preventDefault(); e.stopPropagation(); return false; };
        }
        
        // Remove default click behavior for all disabled dates
        if (isDisabledDate(date)) {
          dayElem.removeAttribute('tabindex');
        }
      },
      // Show only working days in the calendar
      locale: {
        firstDayOfWeek: 0 // Sunday = 0 (start of work week in Jordan)
      }
    });    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, minDate, maxDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
          readOnly
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
        {/* Information about disabled dates */}
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-300 rounded border border-gray-400"></span>
            <span>Weekends (Fri-Sat) - Not available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded border-2 border-yellow-500"></span>
            <span>Public holidays - Hover to see holiday name</span>
          </div>
        </div>
      </div>{/* Enhanced CSS for weekends and holidays with different styling */}
      <style jsx global>{`
        /* Weekend styling - gray background */
        .flatpickr-day.weekend-day {
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
          cursor: default !important;
          pointer-events: none !important;
          opacity: 0.5 !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: none !important;
          transform: none !important;
          user-select: none !important;
        }

        .flatpickr-day.weekend-day:hover,
        .flatpickr-day.weekend-day:focus,
        .flatpickr-day.weekend-day:active {
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
          cursor: default !important;
          transform: none !important;
          box-shadow: none !important;
          border: 1px solid #e5e7eb !important;
        }

        /* Holiday styling - yellow/orange gradient with tooltip support */
        .flatpickr-day.holiday-day {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
          color: #92400e !important;
          cursor: default !important;
          pointer-events: all !important;
          opacity: 0.8 !important;
          border: 2px solid #f59e0b !important;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2) !important;
          transform: none !important;
          font-weight: 600 !important;
          position: relative !important;
          user-select: none !important;
        }

        .flatpickr-day.holiday-day:hover {
          background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%) !important;
          color: #9a3412 !important;
          cursor: default !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3) !important;
          border: 2px solid #ea580c !important;
          z-index: 10 !important;
        }

        /* Tooltip styling for holidays */
        .holiday-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: #1f2937;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease-in-out;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 5px;
        }

        .holiday-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #1f2937;
        }

        /* General disabled day base styling */
        .flatpickr-day.disabled-day {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        /* Dark mode support */
        .dark .flatpickr-day.weekend-day {
          background-color: #374151 !important;
          color: #6b7280 !important;
          border: 1px solid #4b5563 !important;
        }

        .dark .flatpickr-day.weekend-day:hover {
          background-color: #374151 !important;
          color: #6b7280 !important;
          border: 1px solid #4b5563 !important;
        }

        .dark .flatpickr-day.holiday-day {
          background: linear-gradient(135deg, #451a03 0%, #92400e 100%) !important;
          color: #fbbf24 !important;
          border: 2px solid #d97706 !important;
        }

        .dark .flatpickr-day.holiday-day:hover {
          background: linear-gradient(135deg, #78350f 0%, #a16207 100%) !important;
          color: #fcd34d !important;
          border: 2px solid #f59e0b !important;
        }

        .dark .holiday-tooltip {
          background-color: #111827;
          border: 1px solid #374151;
        }

        .dark .holiday-tooltip::after {
          border-top-color: #111827;
        }
      `}</style>
    </div>
  );
}
