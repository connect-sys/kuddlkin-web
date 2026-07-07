import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useEmailValidation, usePhoneValidation } from '../../hooks/useValidation';

interface ValidatedInputProps {
  type: 'email' | 'phone' | 'text';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  validateOnChange?: boolean;
  currentUserId?: string; // To exclude current user from validation
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  className = '',
  validateOnChange = true,
  currentUserId
}) => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const { emailValidation, validateEmail } = useEmailValidation();
  const { phoneValidation, validatePhone } = usePhoneValidation();

  const validation = type === 'email' ? emailValidation : type === 'phone' ? phoneValidation : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (!validateOnChange || type === 'text') return;

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced validation
    const timer = setTimeout(() => {
      if (type === 'email') {
        validateEmail(newValue, currentUserId);
      } else if (type === 'phone') {
        validatePhone(newValue, currentUserId);
      }
    }, 500); // 500ms debounce

    setDebounceTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const getValidationIcon = () => {
    if (!validation || type === 'text') return null;
    
    if (validation.isChecking) {
      return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    }
    
    if (value && value.length > 0) {
      if (validation.isValid) {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      } else {
        return <XCircle className="w-4 h-4 text-red-500" />;
      }
    }
    
    return null;
  };

  const getInputClassName = () => {
    let baseClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${className}`;
    
    if (validation && value && value.length > 0) {
      if (validation.isValid) {
        baseClass += ' border-green-300 bg-green-50';
      } else {
        baseClass += ' border-red-300 bg-red-50';
      }
    } else {
      baseClass += ' border-gray-300';
    }
    
    if (disabled) {
      baseClass += ' bg-gray-100 cursor-not-allowed';
    }
    
    return baseClass;
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type === 'phone' ? 'tel' : type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={getInputClassName()}
          maxLength={type === 'phone' ? 10 : undefined}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {getValidationIcon()}
        </div>
      </div>
      
      {validation && validation.message && value && value.length > 0 && (
        <p className={`text-xs ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
          {validation.message}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;
