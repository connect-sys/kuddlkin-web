import { useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

interface ValidationResult {
  isValid: boolean;
  message: string;
  isChecking: boolean;
}

export const useEmailValidation = () => {
  const [emailValidation, setEmailValidation] = useState<ValidationResult>({
    isValid: true,
    message: '',
    isChecking: false
  });

  const validateEmail = useCallback(async (email: string, currentUserId?: string) => {
    if (!email || email.length < 3) {
      setEmailValidation({
        isValid: true,
        message: '',
        isChecking: false
      });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailValidation({
        isValid: false,
        message: 'Invalid email format',
        isChecking: false
      });
      return;
    }

    setEmailValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const url = `${API_BASE_URL}/api/check-email?email=${encodeURIComponent(email)}${currentUserId ? `&currentUserId=${currentUserId}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setEmailValidation({
          isValid: !data.exists,
          message: data.exists ? 'Email already exists' : 'Email available',
          isChecking: false
        });
      } else {
        setEmailValidation({
          isValid: false,
          message: 'Error checking email',
          isChecking: false
        });
      }
    } catch (error) {
      console.error('Email validation error:', error);
      setEmailValidation({
        isValid: false,
        message: 'Error checking email',
        isChecking: false
      });
    }
  }, []);

  return { emailValidation, validateEmail };
};

export const usePhoneValidation = () => {
  const [phoneValidation, setPhoneValidation] = useState<ValidationResult>({
    isValid: true,
    message: '',
    isChecking: false
  });

  const validatePhone = useCallback(async (phone: string, currentUserId?: string) => {
    if (!phone || phone.length < 10) {
      setPhoneValidation({
        isValid: true,
        message: '',
        isChecking: false
      });
      return;
    }

    // Basic phone format validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      setPhoneValidation({
        isValid: false,
        message: 'Phone number must be 10 digits',
        isChecking: false
      });
      return;
    }

    setPhoneValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const url = `${API_BASE_URL}/api/check-phone?phone=${encodeURIComponent(phone)}${currentUserId ? `&currentUserId=${currentUserId}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPhoneValidation({
          isValid: !data.exists,
          message: data.exists ? 'Phone number already exists' : 'Phone number available',
          isChecking: false
        });
      } else {
        setPhoneValidation({
          isValid: false,
          message: 'Error checking phone number',
          isChecking: false
        });
      }
    } catch (error) {
      console.error('Phone validation error:', error);
      setPhoneValidation({
        isValid: false,
        message: 'Error checking phone number',
        isChecking: false
      });
    }
  }, []);

  return { phoneValidation, validatePhone };
};
