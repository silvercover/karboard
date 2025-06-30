import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface JalaliDatePickerWrapperProps {
  value?: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    jalaliDatepicker: {
      startWatch: (options?: any) => void;
      show: (input: HTMLInputElement) => void;
      hide: () => void;
      updateOptions: (options: any) => void;
    };
  }
}

export function JalaliDatePickerWrapper({ value, onChange, onClose }: JalaliDatePickerWrapperProps) {
  const { language } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inputRef.current || !window.jalaliDatepicker) return;

    const input = inputRef.current;
    
    // Set initial value
    if (value) {
      if (language.code === 'fa') {
        // For Persian, format as Jalali date
        const jalaliDate = new Intl.DateTimeFormat('fa-IR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(value);
        input.value = jalaliDate;
      } else {
        // For English, format as Gregorian date
        input.value = value.toISOString().split('T')[0];
      }
    }

    // Configure options based on language
    const options = {
      locale: language.code === 'fa' ? 'fa' : 'en',
      format: language.code === 'fa' ? 'YYYY/MM/DD' : 'YYYY-MM-DD',
      calendar: language.code === 'fa' ? 'persian' : 'gregorian',
      onSelect: (selectedDate: string) => {
        if (selectedDate) {
          let date: Date;
          if (language.code === 'fa') {
            // Parse Persian date
            const parts = selectedDate.split('/');
            if (parts.length === 3) {
              // Convert Persian date to Gregorian
              const persianYear = parseInt(parts[0]);
              const persianMonth = parseInt(parts[1]);
              const persianDay = parseInt(parts[2]);
              
              // Simple conversion (you might want to use a proper library)
              const gregorianYear = persianYear + 621;
              date = new Date(gregorianYear, persianMonth - 1, persianDay);
            } else {
              date = new Date();
            }
          } else {
            date = new Date(selectedDate);
          }
          onChange(date);
          onClose();
        }
      }
    };

    // Initialize the date picker
    window.jalaliDatepicker.updateOptions(options);
    window.jalaliDatepicker.startWatch();
    
    // Show the picker
    setTimeout(() => {
      window.jalaliDatepicker.show(input);
    }, 100);

    // Handle click outside - but exclude modal backdrop
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking on modal backdrop or modal content
      if (target.classList.contains('fixed') && target.classList.contains('inset-0')) {
        return;
      }
      
      // Don't close if clicking inside the date picker
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking on date picker elements
      if (target.closest('.jdp-container') || target.closest('[data-jdp]')) {
        return;
      }
      
      // Only close if clicking outside the date picker area
      if (containerRef.current && !containerRef.current.contains(target)) {
        onClose();
      }
    };

    // Use capture phase to handle clicks before they bubble up
    document.addEventListener('mousedown', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      window.jalaliDatepicker.hide();
    };
  }, [language.code, value, onChange, onClose]);

  return (
    <div 
      ref={containerRef}
      className="absolute top-full left-0 rtl:right-0 rtl:left-auto mt-2 z-[70]"
      onClick={(e) => e.stopPropagation()} // Prevent event bubbling
    >
      <input
        ref={inputRef}
        data-jdp
        type="text"
        className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        placeholder={language.code === 'fa' ? 'تاریخ را انتخاب کنید' : 'Select date'}
        readOnly
        onClick={(e) => e.stopPropagation()} // Prevent modal close
      />
    </div>
  );
}