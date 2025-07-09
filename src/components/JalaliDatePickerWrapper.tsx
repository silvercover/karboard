import React, { useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import gregorian from 'react-date-object/calendars/gregorian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import DateObject from 'react-date-object';
import { useLanguage } from '../contexts/LanguageContext';

interface JalaliDatePickerWrapperProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export function JalaliDatePickerWrapper({ value, onChange, placeholder }: JalaliDatePickerWrapperProps) {
  const { language } = useLanguage();
  const datePickerRef = useRef<any>(null);

  // تنظیمات تقویم بر اساس زبان
  const getCalendarConfig = () => {
    if (language.code === 'fa') {
      return {
        calendar: persian,
        locale: persian_fa
      };
    } else {
      return {
        calendar: gregorian,
        locale: gregorian_en
      };
    }
  };

  // مقدار اولیه
  const getInitialValue = () => {
    if (!value) {
      return null;
    }
    
    const config = getCalendarConfig();
    return new DateObject({
      date: value,
      calendar: config.calendar,
      locale: config.locale
    });
  };

  const handleDateChange = (selectedDate: any) => {
    if (selectedDate && selectedDate.isValid) {
      const jsDate = selectedDate.toDate();
      onChange(jsDate);
    } else {
      onChange(undefined);
    }
  };

  const config = getCalendarConfig();
  const initialValue = getInitialValue();

  return (
    <div className="relative">
      <DatePicker
        ref={datePickerRef}
        value={initialValue}
        onChange={handleDateChange}
        calendar={config.calendar}
        locale={config.locale}
        format={language.code === 'fa' ? 'YYYY/MM/DD' : 'YYYY-MM-DD'}
        onlyShowInRangeDates={false}
        render={(value, openCalendar) => {
          return (
            <button
              type="button"
              onClick={openCalendar}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 w-full text-left rtl:text-right"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {value || placeholder}
              </span>
            </button>
          );
        }}
        containerStyle={{
          position: 'relative',
          zIndex: 10000
        }}
        calendarPosition="bottom-left"
      />
    </div>
  );
}