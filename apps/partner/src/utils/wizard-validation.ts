/**
 * Service Wizard Validation Utilities
 */

import { WizardState, StepValidation, ServiceArchetype } from '../types/service-wizard';
import { getFieldVisibility } from '../config/archetypes';

/**
 * Validate Step 1: Basic Details
 */
export function validateStep1(state: WizardState): StepValidation {
  const errors: string[] = [];
  const service = state.service;

  if (!service) {
    // Return early with no errors if service hasn't been initialized yet
    // This allows the form to load without showing errors immediately
    return { step: 1, rules: [], isValid: false, errors: [] };
  }

  // Name validation
  if (!service.name || service.name.trim().length < 3) {
    errors.push('Service name must be at least 3 characters');
  }
  if (service.name && service.name.length > 80) {
    errors.push('Service name must not exceed 80 characters');
  }

  // Description validation
  if (!service.description || service.description.trim().length < 50) {
    errors.push('Description must be at least 50 characters');
  }
  if (service.description && service.description.length > 2000) {
    errors.push('Description must not exceed 2000 characters');
  }
  if (service.description && service.description.length < 100) {
    errors.push('⚠️ Description is short. Consider adding more details for better visibility.');
  }

  // Category validation
  if (!service.category_id) {
    errors.push('Category is required');
  }

  // Cover image validation
  if (!service.cover_image_url) {
    errors.push('Cover image is required');
  }

  return {
    step: 1,
    rules: [],
    isValid: errors.filter(e => !e.startsWith('⚠️')).length === 0,
    errors,
  };
}

/**
 * Validate Step 2: Program Type
 */
export function validateStep2(state: WizardState): StepValidation {
  const errors: string[] = [];

  if (!state.archetype) {
    errors.push('Please select a program type');
  }

  return {
    step: 2,
    rules: [],
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Step 3: Configure Variant
 */
export function validateStep3(state: WizardState): StepValidation {
  const errors: string[] = [];
  const offering = state.offering;

  if (!offering) {
    return { step: 3, rules: [], isValid: false, errors: ['Offering data is required'] };
  }

  if (!state.archetype) {
    return { step: 3, rules: [], isValid: false, errors: ['Archetype must be selected first'] };
  }

  const visibility = getFieldVisibility(state.archetype, offering.mode);

  // Location validation
  if (!offering.serviceable_pincodes || offering.serviceable_pincodes.length === 0) {
    errors.push('At least one service pincode is required');
  }

  // Mode validation
  if (!offering.mode) {
    errors.push('Mode is required');
  }

  // Mode-specific validations
  if (visibility.virtual_link && !offering.virtual_link) {
    errors.push('Virtual meeting link is required for online/hybrid mode');
  }

  // Age range validation
  if (!offering.age_min || !offering.age_max) {
    errors.push('Age range is required');
  }
  if (offering.age_min && offering.age_max && offering.age_min >= offering.age_max) {
    errors.push('Minimum age must be less than maximum age');
  }

  // Capacity validation
  if (visibility.per_session_capacity && !offering.per_session_capacity) {
    errors.push('Per-session capacity is required');
  }
  if (visibility.cohort_capacity && !offering.cohort_capacity) {
    errors.push('Cohort capacity is required');
  }
  if (visibility.hybrid_capacity_split) {
    if (!offering.online_capacity || !offering.offline_capacity) {
      errors.push('Both online and offline capacity are required for hybrid mode');
    }
  }

  // Booking settings validation
  if (!offering.booking_cutoff_hours || offering.booking_cutoff_hours < 0) {
    errors.push('Booking cutoff hours is required');
  }

  // Cancellation policy validation
  if (!offering.cancellation_policy) {
    errors.push('❌ Cancellation policy is required (blocking)');
  }

  return {
    step: 3,
    rules: [],
    isValid: errors.filter(e => !e.startsWith('⚠️')).length === 0,
    errors,
  };
}

/**
 * Validate Step 4: Schedule
 */
export function validateStep4(state: WizardState): StepValidation {
  const errors: string[] = [];
  const schedules = state.schedules;

  if (!schedules || schedules.length === 0) {
    errors.push('At least one schedule is required');
    return { step: 4, rules: [], isValid: false, errors };
  }

  schedules.forEach((schedule, index) => {
    const prefix = schedules.length > 1 ? `Schedule ${index + 1}: ` : '';

    // Date validation
    if (!schedule.start_date) {
      errors.push(`${prefix}Start date is required`);
    }

    // Time validation
    if (!schedule.start_time || !schedule.end_time) {
      errors.push(`${prefix}Start and end time are required`);
    }

    // End time must be after start time (duration is auto-derived from these)
    if (
      schedule.start_time &&
      schedule.end_time &&
      schedule.duration_minutes <= 0
    ) {
      errors.push(`${prefix}End time must be after start time`);
    }

    // Recurrence validation
    if (schedule.recurrence_type === 'weekly' && (!schedule.recurrence_days || schedule.recurrence_days.length === 0)) {
      errors.push(`${prefix}At least one day must be selected for weekly recurrence`);
    }
  });

  return {
    step: 4,
    rules: [],
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Step 5: Pricing
 */
export function validateStep5(state: WizardState): StepValidation {
  const errors: string[] = [];
  const priceRules = state.price_rules;

  if (!priceRules || priceRules.length === 0) {
    errors.push('At least one pricing option is required');
    return { step: 5, rules: [], isValid: false, errors };
  }

  priceRules.forEach((rule, index) => {
    const prefix = priceRules.length > 1 ? `Rule ${index + 1}: ` : '';

    // Name validation
    if (!rule.name || rule.name.trim().length === 0) {
      errors.push(`${prefix}Name is required`);
    }

    // Amount validation
    if (rule.amount === undefined || rule.amount === null || rule.amount < 0) {
      errors.push(`${prefix}Amount must be 0 or greater`);
    }

    // Unit validation
    if (!rule.unit) {
      errors.push(`${prefix}Pricing unit is required`);
    }

    // Discount validation
    if (rule.type === 'discount') {
      if (!rule.discount_type) {
        errors.push(`${prefix}Discount type is required`);
      }
      if (!rule.discount_percentage && !rule.discount_amount) {
        errors.push(`${prefix}Either discount percentage or amount is required`);
      }
    }

    // Availability validation
    if (rule.availability === 'between_dates' && (!rule.available_from || !rule.available_until)) {
      errors.push(`${prefix}Both start and end dates are required for date range availability`);
    }
    if (rule.availability === 'until_date' && !rule.available_until) {
      errors.push(`${prefix}End date is required for until date availability`);
    }
  });

  return {
    step: 5,
    rules: [],
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Step 6: Review & Publish (Preflight Checks)
 */
export function validateStep6(state: WizardState): StepValidation {
  const errors: string[] = [];

  // Run all previous step validations
  const step1 = validateStep1(state);
  const step2 = validateStep2(state);
  const step3 = validateStep3(state);
  const step4 = validateStep4(state);
  const step5 = validateStep5(state);

  if (!step1.isValid) {
    errors.push('❌ Basic details are incomplete');
  }
  if (!step2.isValid) {
    errors.push('❌ Program type not selected');
  }
  if (!step3.isValid) {
    errors.push('❌ Variant configuration is incomplete');
  }
  if (!step4.isValid) {
    errors.push('❌ Schedule is incomplete');
  }
  if (!step5.isValid) {
    errors.push('❌ Pricing is incomplete');
  }

  // Additional preflight checks
  if (state.service?.description && state.service.description.length < 100) {
    errors.push('⚠️ Description is short (recommended: 100+ characters)');
  }

  if (!state.offering?.cancellation_policy) {
    errors.push('❌ Cancellation policy is required (blocking)');
  }

  return {
    step: 6,
    rules: [],
    isValid: errors.filter(e => e.startsWith('❌')).length === 0,
    errors,
  };
}

/**
 * Validate Step 2 (new 4-step): Program Type + Configure Variant combined
 */
export function validateStep2Combined(state: WizardState): StepValidation {
  const pt = validateStep2(state);
  const cv = validateStep3(state);
  const errors = [...pt.errors, ...cv.errors];
  return {
    step: 2,
    rules: [],
    isValid: pt.isValid && cv.isValid,
    errors,
  };
}

/**
 * Validate Step 3 (new 4-step): Schedule + Pricing combined
 */
export function validateStep3Combined(state: WizardState): StepValidation {
  const sched = validateStep4(state);
  const price = validateStep5(state);
  const errors = [...sched.errors, ...price.errors];
  return {
    step: 3,
    rules: [],
    isValid: sched.isValid && price.isValid,
    errors,
  };
}

/**
 * Validate Step 4 (new 4-step): Review & Publish — checks all previous
 */
export function validateStep4Review(state: WizardState): StepValidation {
  const errors: string[] = [];

  if (!validateStep1(state).isValid) errors.push('❌ Basic details are incomplete');
  if (!validateStep2(state).isValid) errors.push('❌ Program type not selected');
  if (!validateStep3(state).isValid) errors.push('❌ Variant configuration is incomplete');
  if (!validateStep4(state).isValid) errors.push('❌ Schedule is incomplete');
  if (!validateStep5(state).isValid) errors.push('❌ Pricing is incomplete');

  if (state.service?.description && state.service.description.length < 100) {
    errors.push('⚠️ Description is short (recommended: 100+ characters)');
  }
  if (!state.offering?.cancellation_policy) {
    errors.push('❌ Cancellation policy is required');
  }

  return {
    step: 4,
    rules: [],
    isValid: errors.filter(e => e.startsWith('❌')).length === 0,
    errors,
  };
}

/**
 * Validate entire wizard state (4-step structure)
 */
export function validateWizard(state: WizardState): Record<number, StepValidation> {
  return {
    1: validateStep1(state),
    2: validateStep2Combined(state),
    3: validateStep3Combined(state),
    4: validateStep4Review(state),
  };
}

/**
 * Get step status based on validation
 */
export function getStepStatus(
  stepNumber: number,
  currentStep: number,
  validation: StepValidation,
  completedSteps: number[]
): 'complete' | 'active' | 'pending' | 'has-issues' {
  if (stepNumber === currentStep) {
    return 'active';
  }

  if (completedSteps.includes(stepNumber)) {
    // Warnings (⚠️) don't block — only hard validation failures mark a step as having issues
    return validation.isValid ? 'complete' : 'has-issues';
  }

  return 'pending';
}

/**
 * Check if can proceed to next step.
 * Navigation is always allowed — required-field validation is surfaced
 * only on the final Review & Publish step.
 */
export function canProceedToNextStep(_currentStep: number, _state: WizardState): boolean {
  return true;
}

/**
 * Check if can publish (all blocking errors resolved)
 */
export function canPublish(state: WizardState): boolean {
  const validation = validateStep6(state);
  return !validation.errors.some(e => e.startsWith('❌'));
}
