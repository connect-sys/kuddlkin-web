/**
 * Service Archetype Configurations
 * Defines behavior and field visibility for each service type
 */

import { ServiceArchetype, ArchetypeConfig, PricingUnit } from '../types/service-wizard';

export const ARCHETYPE_CONFIGS: Record<ServiceArchetype, ArchetypeConfig> = {
  workshop: {
    key: 'workshop',
    title: 'Workshop',
    description: 'One-time or short-term skill-building sessions',
    icon: '🎨',
    defaultUnit: 'per_session',
    fields: {
      capacity: 'single',
      schedule: 'single_date',
      batch: false,
      recurrence: false,
    },
  },
  
  camp: {
    key: 'camp',
    title: 'Camp',
    description: 'Multi-day immersive programs',
    icon: '⛺',
    defaultUnit: 'per_camp',
    fields: {
      capacity: 'cohort',
      schedule: 'date_range',
      batch: true,
      recurrence: false,
    },
  },
  
  class: {
    key: 'class',
    title: 'Class',
    description: 'Recurring structured learning programs',
    icon: '📚',
    defaultUnit: 'per_month',
    fields: {
      capacity: 'cohort',
      schedule: 'recurring',
      batch: true,
      recurrence: true,
    },
  },
  
  event: {
    key: 'event',
    title: 'Event',
    description: 'One-time special occasions or performances',
    icon: '🎉',
    defaultUnit: 'per_session',
    fields: {
      capacity: 'single',
      schedule: 'single_date',
      batch: false,
      recurrence: false,
    },
  },
  
  drop_in: {
    key: 'drop_in',
    title: 'Drop-in',
    description: 'Walk-in services without advance booking',
    icon: '🚪',
    defaultUnit: 'per_visit',
    fields: {
      capacity: 'daily',
      schedule: 'date_range',
      batch: false,
      recurrence: false,
    },
  },
  
  appointment: {
    key: 'appointment',
    title: 'Appointment',
    description: 'One-on-one scheduled consultations',
    icon: '📅',
    defaultUnit: 'per_session',
    fields: {
      capacity: 'locked',
      schedule: 'availability_windows',
      batch: false,
      recurrence: false,
    },
  },
};

/**
 * Get field visibility based on archetype and mode
 */
export function getFieldVisibility(archetype: ServiceArchetype, mode: string) {
  const config = ARCHETYPE_CONFIGS[archetype];
  
  return {
    // Capacity fields
    per_session_capacity: ['workshop', 'event', 'drop_in'].includes(archetype),
    cohort_capacity: ['camp', 'class'].includes(archetype),
    pass_type: archetype === 'drop_in',
    availability_windows: archetype === 'appointment',
    session_length: ['class', 'appointment'].includes(archetype),
    buffer_time: archetype === 'appointment',
    
    // Mode-specific fields
    virtual_link: ['online', 'hybrid'].includes(mode),
    tech_requirements: ['online', 'hybrid'].includes(mode),
    recording_policy: ['online', 'hybrid'].includes(mode),
    physical_location: ['offline', 'hybrid'].includes(mode),
    hybrid_capacity_split: mode === 'hybrid',
  };
}

/**
 * Get default pricing unit for archetype
 */
export function getDefaultPricingUnit(archetype: ServiceArchetype): PricingUnit {
  return ARCHETYPE_CONFIGS[archetype].defaultUnit;
}

/**
 * Check if archetype supports batches/cohorts
 */
export function supportsBatches(archetype: ServiceArchetype): boolean {
  return ARCHETYPE_CONFIGS[archetype].fields.batch;
}

/**
 * Check if archetype supports recurrence
 */
export function supportsRecurrence(archetype: ServiceArchetype): boolean {
  return ARCHETYPE_CONFIGS[archetype].fields.recurrence;
}

/**
 * Get capacity field type for archetype
 */
export function getCapacityType(archetype: ServiceArchetype): 'single' | 'cohort' | 'daily' | 'locked' | 'none' {
  return ARCHETYPE_CONFIGS[archetype].fields.capacity;
}

/**
 * Get schedule type for archetype
 */
export function getScheduleType(archetype: ServiceArchetype): 'single_date' | 'date_range' | 'recurring' | 'availability_windows' {
  return ARCHETYPE_CONFIGS[archetype].fields.schedule;
}

/**
 * Recurrence quick chips for classes
 */
export const RECURRENCE_CHIPS = [
  { label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { label: 'Weekends', days: [0, 6] },
  { label: 'Mon-Wed-Fri', days: [1, 3, 5] },
  { label: 'Tue-Thu', days: [2, 4] },
  { label: 'Every Day', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'Custom', days: [] },
];

/**
 * Day names for recurrence selector
 */
export const DAY_NAMES = [
  { short: 'Sun', full: 'Sunday', value: 0 },
  { short: 'Mon', full: 'Monday', value: 1 },
  { short: 'Tue', full: 'Tuesday', value: 2 },
  { short: 'Wed', full: 'Wednesday', value: 3 },
  { short: 'Thu', full: 'Thursday', value: 4 },
  { short: 'Fri', full: 'Friday', value: 5 },
  { short: 'Sat', full: 'Saturday', value: 6 },
];

/**
 * Cancellation policy descriptions
 */
export const CANCELLATION_POLICIES = {
  flexible: {
    label: 'Flexible',
    description: 'Full refund if cancelled 24 hours before',
    refund_percentage: 100,
    cutoff_hours: 24,
  },
  moderate: {
    label: 'Moderate',
    description: '50% refund if cancelled 48 hours before',
    refund_percentage: 50,
    cutoff_hours: 48,
  },
  strict: {
    label: 'Strict',
    description: '25% refund if cancelled 7 days before',
    refund_percentage: 25,
    cutoff_hours: 168,
  },
  no_refund: {
    label: 'No Refund',
    description: 'No refunds for cancellations',
    refund_percentage: 0,
    cutoff_hours: 0,
  },
};

/**
 * Pricing unit labels
 */
export const PRICING_UNIT_LABELS: Record<PricingUnit, string> = {
  per_session: 'Per Session',
  per_day: 'Per Day',
  per_month: 'Per Month',
  per_term: 'Per Term',
  per_visit: 'Per Visit',
  per_pass: 'Per Pass',
  per_camp: 'Per Camp (Total)',
};

/**
 * Derive ServiceArchetype from a human-readable service label.
 * Handles labels coming from the partner's specific_services profile field.
 */
export function deriveArchetypeFromLabel(label: string): ServiceArchetype | null {
  const l = label.toLowerCase();
  if (l.includes('camp')) return 'camp';
  if (l.includes('workshop')) return 'workshop';
  if (l.includes('class') || l.includes('enrich') || l.includes('course') || l.includes('lesson')) return 'class';
  if (l.includes('event') || l.includes('occasion') || l.includes('performance')) return 'event';
  if (l.includes('drop') || l.includes('walk')) return 'drop_in';
  if (l.includes('appointment') || l.includes('consult') || l.includes('session')) return 'appointment';
  return null;
}

/**
 * Camp types — shown in the Step 1 subcategory dropdown when creating a camp.
 * All camps belong to the "Camps & Holiday Programmes" subcategory of Discover.
 */
export const CAMP_TYPES: { value: string; label: string }[] = [
  { value: 'summer_camp', label: 'Summer Camp' },
  { value: 'winter_camp', label: 'Winter Camp' },
  { value: 'adventure_camp', label: 'Adventure Camp' },
  { value: 'art_camp', label: 'Art & Craft Camp' },
  { value: 'sports_camp', label: 'Sports Camp' },
  { value: 'coding_camp', label: 'Coding Camp' },
  { value: 'dance_camp', label: 'Dance Camp' },
  { value: 'music_camp', label: 'Music Camp' },
  { value: 'theatre_camp', label: 'Theatre Camp' },
  { value: 'other', label: 'Other' },
];

export const CAMP_CATEGORY_ID = 'cat_discover';
export const CAMP_SUBCATEGORY_ID = 'discover_camps_holiday_programs';

/**
 * Camp Architecture v2.0 — field-scope contract.
 * SERVICE_LOCKED_FIELDS belong to the Service shell and cannot vary per batch.
 * BATCH_DIFF_FIELDS are the variant fields the "Add Another Batch" modal lets
 * the partner change. This is the single source of truth — keep it in sync
 * with the backend batch schema.
 */
export const SERVICE_LOCKED_FIELDS = [
  'Service name',
  'Description',
  'Category',
  'Cover image',
  'Gallery',
];

export const BATCH_DIFF_FIELDS: { key: string; label: string }[] = [
  { key: 'mode', label: 'Mode' },
  { key: 'age', label: 'Age range' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'timing', label: 'Timing' },
  { key: 'instructor', label: 'Instructor' },
];

/**
 * Discount type labels
 */
export const DISCOUNT_TYPE_LABELS = {
  early_bird: 'Early Bird',
  sibling: 'Sibling Discount',
  group: 'Group Discount',
  trial: 'Trial Session',
  custom: 'Custom Discount',
};
