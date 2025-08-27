"use client";
import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { CalenderIcon } from '@/icons';

type PropsType = {
  id: string;
  selected: Date;
  onChange: (date: Date) => void;
  enableSundaysAndWednesdays?: boolean;
};

export default function DatePickerCustom({
  id,
  selected,
  onChange,
  enableSundaysAndWednesdays = false,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);
  const flatpickrInstance = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      const options: flatpickr.Options.Options = {
        static: true,
        monthSelectorType: "static",
        dateFormat: "Y-m-d",
        defaultDate: selected,
        onChange: (selectedDates) => {
          if (onChange && selectedDates[0]) {
            onChange(selectedDates[0]);
          }
        },
      };

      if (enableSundaysAndWednesdays) {
        options.disable = [
          function(date) {
            return (date.getDay() !== 0 && date.getDay() !== 3);
          }
        ];
      }
      
      flatpickrInstance.current = flatpickr(inputRef.current, options);
    }

    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
      }
    };
  }, []); // Run only on mount

  // This effect ensures the calendar updates if the selected date changes from the parent
  useEffect(() => {
    if (flatpickrInstance.current && selected) {
        flatpickrInstance.current.setDate(selected, false); // false prevents re-triggering onChange
    }
  }, [selected]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        placeholder="Select a date"
        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
      />
      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
        <CalenderIcon className="size-6" />
      </span>
    </div>
  );
}