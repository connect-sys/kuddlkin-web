/**
 * Küddl Service Creation Wizard - Type Definitions
 * Version: 1.0
 * Date: 20 May 2026
 */

// =====================================================
// ENUMS
// =====================================================

export type ServiceArchetype = 'workshop' | 'camp' | 'class' | 'event' | 'drop_in' | 'appointment';

export type ServiceMode = 'online' | 'offline' | 'hybrid';

export type ServiceStatus = 'draft' | 'published' | 'paused' | 'archived';

export type OfferingStatus = 'active' | 'paused' | 'archived';

export type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'rescheduled';

export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'no_refund';

export type PriceRuleType = 'standard' | 'discount';

export type PricingUnit = 'per_session' | 'per_day' | 'per_month' | 'per_term' | 'per_visit' | 'per_pass' | 'per_camp';

export type DiscountType = 'early_bird' | 'sibling' | 'group' | 'trial' | 'custom';

export type PriceAvailability = 'always' | 'between_dates' | 'until_date';

export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'custom';

export type ConflictType = 'location' | 'instructor' | 'time';

export type ConflictSeverity = 'warning' | 'error';

export type StepStatus = 'complete' | 'active' | 'pending' | 'has-issues';

// =====================================================
// LOCATION
// =====================================================

export interface Location {
  id: string;
  provider_id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationFormData {
  name: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
}

// =====================================================
// SERVICE
// =====================================================

export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  cover_image_url: string;
  gallery_images?: string[];
  tags?: string[];
  status: ServiceStatus;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  subcategory_label?: string; // human-readable label from Step 1 dropdown (e.g. "Camps & Holiday Programmes")
  camp_type?: string; // camp-mode only: selected camp type (e.g. "summer_camp")
  cover_image_url: string;
  gallery_images?: string[];
  tags?: string[];
}

// =====================================================
// OFFERING
// =====================================================

export interface Offering {
  id: string;
  service_id: string;
  location_id: string;
  archetype: ServiceArchetype;
  mode: ServiceMode;
  virtual_link?: string;
  tech_requirements?: string;
  recording_policy: boolean;
  age_min: number;
  age_max: number;
  per_session_capacity?: number;
  cohort_capacity?: number;
  online_capacity?: number;
  offline_capacity?: number;
  booking_cutoff_hours: number;
  cancellation_policy: CancellationPolicy;
  min_advance_booking_hours: number;
  max_advance_booking_days?: number;
  instructor_name?: string;
  instructor_bio?: string;
  instructor_image_url?: string;
  materials_provided?: string[];
  prerequisites?: string;
  what_to_bring?: string;
  special_instructions?: string;
  status: OfferingStatus;
  created_at: string;
  updated_at: string;
}

export interface OfferingFormData {
  location_id: string;
  serviceable_pincodes?: string[];
  variant_name?: string;
  archetype: ServiceArchetype;
  mode: ServiceMode;
  virtual_link?: string;
  tech_requirements?: string;
  recording_policy: boolean;
  age_min: number;
  age_max: number;
  per_session_capacity?: number;
  cohort_capacity?: number;
  online_capacity?: number;
  offline_capacity?: number;
  booking_cutoff_hours: number;
  cancellation_policy: CancellationPolicy;
  min_advance_booking_hours: number;
  max_advance_booking_days?: number;
  instructor_name?: string;
  instructor_bio?: string;
  instructor_image_url?: string;
  materials_provided?: string[];
  prerequisites?: string;
  what_to_bring?: string;
  special_instructions?: string;
}

// =====================================================
// SCHEDULE
// =====================================================

export interface Schedule {
  id: string;
  offering_id: string;
  name?: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  buffer_minutes: number;
  recurrence_type?: RecurrenceType;
  recurrence_days?: number[];
  recurrence_interval: number;
  skip_dates?: string[];
  respect_holidays: boolean;
  capacity_override?: number;
  availability_windows?: AvailabilityWindow[];
  status: OfferingStatus;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityWindow {
  day: number; // 0-6 (Sunday-Saturday)
  start: string; // HH:MM
  end: string; // HH:MM
  slots: number;
}

export interface ScheduleFormData {
  name?: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  buffer_minutes: number;
  recurrence_type?: RecurrenceType;
  recurrence_days?: number[];
  recurrence_interval: number;
  skip_dates?: string[];
  respect_holidays: boolean;
  capacity_override?: number;
  availability_windows?: AvailabilityWindow[];
}

// =====================================================
// SESSION
// =====================================================

export interface Session {
  id: string;
  schedule_id: string;
  offering_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  waitlist_count: number;
  status: SessionStatus;
  cancellation_reason?: string;
  instructor_override?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// PRICE RULE
// =====================================================

export interface PriceRule {
  id: string;
  offering_id: string;
  name: string;
  type: PriceRuleType;
  unit: PricingUnit;
  amount: number;
  currency: string;
  discount_type?: DiscountType;
  discount_percentage?: number;
  discount_amount?: number;
  min_quantity?: number;
  availability: PriceAvailability;
  available_from?: string;
  available_until?: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceRuleFormData {
  name: string;
  type: PriceRuleType;
  unit: PricingUnit;
  amount: number;
  discount_type?: DiscountType;
  discount_percentage?: number;
  discount_amount?: number;
  min_quantity?: number;
  availability: PriceAvailability;
  available_from?: string;
  available_until?: string;
}

// =====================================================
// SERVICE DRAFT
// =====================================================

export interface ServiceDraft {
  id: string;
  provider_id: string;
  draft_data: WizardState;
  current_step: number;
  completed_steps: number[];
  validation_errors?: Record<number, string[]>;
  last_saved_at: string;
  created_at: string;
}

// =====================================================
// WIZARD STATE
// =====================================================

export interface WizardState {
  // Step 1: Basic Details
  service?: ServiceFormData;
  
  // Step 2: Program Type
  archetype?: ServiceArchetype;
  archetype_locked?: boolean;
  
  // Step 3: Configure Variant
  offering?: OfferingFormData;
  
  // Step 4: Schedule
  schedules?: ScheduleFormData[];
  
  // Step 5: Pricing
  price_rules?: PriceRuleFormData[];
  
  // Step 6: Review
  preflight_checks?: PreflightCheck[];
}

export interface PreflightCheck {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'error';
  message?: string;
  blocking: boolean;
}

// =====================================================
// WIZARD STEP
// =====================================================

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
  validation?: () => boolean;
}

// =====================================================
// CONFLICT
// =====================================================

export interface ServiceConflict {
  id: string;
  provider_id: string;
  session_id: string;
  conflict_type: ConflictType;
  conflict_with_session_id?: string;
  conflict_details: string;
  severity: ConflictSeverity;
  resolved: boolean;
  created_at: string;
}

// =====================================================
// CALENDAR PREVIEW
// =====================================================

export interface CalendarPreviewData {
  sessions: Session[];
  conflicts: ServiceConflict[];
  total_sessions: number;
  holidays_skipped: number;
  date_range: {
    start: string;
    end: string;
  };
}

// =====================================================
// ARCHETYPE CONFIGURATION
// =====================================================

export interface ArchetypeConfig {
  key: ServiceArchetype;
  title: string;
  description: string;
  icon: string;
  defaultUnit: PricingUnit;
  fields: {
    capacity: 'single' | 'cohort' | 'daily' | 'locked' | 'none';
    schedule: 'single_date' | 'date_range' | 'recurring' | 'availability_windows';
    batch: boolean;
    recurrence: boolean;
  };
}

// =====================================================
// FIELD VISIBILITY
// =====================================================

export interface FieldVisibility {
  // Step 3 fields
  per_session_capacity: boolean;
  cohort_capacity: boolean;
  pass_type: boolean;
  availability_windows: boolean;
  session_length: boolean;
  buffer_time: boolean;
  
  // Mode-specific
  virtual_link: boolean;
  tech_requirements: boolean;
  recording_policy: boolean;
  physical_location: boolean;
  hybrid_capacity_split: boolean;
}

// =====================================================
// VALIDATION RULES
// =====================================================

export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface StepValidation {
  step: number;
  rules: ValidationRule[];
  isValid: boolean;
  errors: string[];
}

// =====================================================
// API RESPONSES
// =====================================================

export interface ServiceWizardResponse {
  success: boolean;
  message: string;
  data?: {
    service?: Service;
    offering?: Offering;
    schedules?: Schedule[];
    sessions?: Session[];
    price_rules?: PriceRule[];
    draft?: ServiceDraft;
  };
  errors?: Record<string, string[]>;
}

// =====================================================
// AUTOSAVE
// =====================================================

export interface AutosaveState {
  isSaving: boolean;
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
  error?: string;
}

// =====================================================
// DUPLICATE/COPY OPTIONS
// =====================================================

export interface DuplicateOptions {
  what_changes: {
    mode?: boolean;
    age?: boolean;
    instructor?: boolean;
    location?: boolean;
  };
  copy_schedule: boolean;
  copy_pricing: boolean;
}

export interface CopyToLocationOptions extends DuplicateOptions {
  target_location_id: string;
}
