import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock } from 'lucide-react';

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Select time'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [time, period] = value.split(' ');
      if (time && period) {
        const [hour, minute] = time.split(':');
        setSelectedHour(hour);
        setSelectedMinute(minute);
        setSelectedPeriod(period);
      } else if (time) {
        // Handle 24-hour format
        const [hour, minute] = time.split(':');
        const hourNum = parseInt(hour);
        const displayHour = hourNum > 12 ? (hourNum - 12).toString().padStart(2, '0') : 
                           hourNum === 0 ? '12' : hour;
        const period = hourNum >= 12 ? 'PM' : 'AM';
        setSelectedHour(displayHour);
        setSelectedMinute(minute);
        setSelectedPeriod(period);
      }
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleTimeChange = (hour: string, minute: string, period: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    
    // Convert to 24-hour format for the onChange callback
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    onChange(timeString);
  };

  const displayValue = value ? `${selectedHour}:${selectedMinute} ${selectedPeriod}` : '';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#578f82] focus:border-[#578f82] cursor-pointer bg-white flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
            {displayValue || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[280px]">
            <div className="flex divide-x divide-gray-200">
              {/* Hours */}
              <div className="flex-1 min-w-0">
                <div className="p-2 text-xs font-medium text-gray-500 text-center border-b border-gray-200 bg-gray-50">
                  Hour
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      onClick={() => {
                        handleTimeChange(hour, selectedMinute, selectedPeriod);
                        setIsOpen(false);
                      }}
                      className={`w-full px-2 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                        selectedHour === hour
                          ? 'bg-[#578f82] text-white hover:bg-[#4a7c70]'
                          : 'text-gray-700'
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div className="flex-1 min-w-0">
                <div className="p-2 text-xs font-medium text-gray-500 text-center border-b border-gray-200 bg-gray-50">
                  Min
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {minutes.filter((_, i) => i % 5 === 0).map((minute) => (
                    <button
                      key={minute}
                      onClick={() => {
                        handleTimeChange(selectedHour, minute, selectedPeriod);
                        setIsOpen(false);
                      }}
                      className={`w-full px-2 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                        selectedMinute === minute
                          ? 'bg-[#578f82] text-white hover:bg-[#4a7c70]'
                          : 'text-gray-700'
                      }`}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div className="flex-1 min-w-0">
                <div className="p-2 text-xs font-medium text-gray-500 text-center border-b border-gray-200 bg-gray-50">
                  Period
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {['AM', 'PM'].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        handleTimeChange(selectedHour, selectedMinute, period);
                        setIsOpen(false);
                      }}
                      className={`w-full px-2 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                        selectedPeriod === period
                          ? 'bg-[#578f82] text-white hover:bg-[#4a7c70]'
                          : 'text-gray-700'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomTimePicker;
