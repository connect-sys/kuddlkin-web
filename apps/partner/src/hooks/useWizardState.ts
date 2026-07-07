/**
 * Wizard State Management Hook
 * Manages wizard navigation, state, and validation
 */

import { useState, useCallback, useEffect } from 'react';
import { WizardState, WizardStep, ServiceArchetype, StepStatus } from '../types/service-wizard';
import { validateWizard, canProceedToNextStep, getStepStatus } from '../utils/wizard-validation';
import { useAutosave } from './useAutosave';
import { deriveArchetypeFromLabel } from '../config/archetypes';

interface UseWizardStateOptions {
  providerId: string;
  entityType?: 'service' | 'camp';
  serviceId?: string;
  initialService?: any;
  // Add Another Batch flow: create a new batch under an existing service/camp.
  addBatchMode?: boolean;
  parentId?: string;
  fromBatchId?: string;
  onPublish?: (state: WizardState) => Promise<void>;
  onExit?: () => void;
}

const parseJson = (value: any, fallback: any) => {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

/**
 * Map a raw service DB row (as returned by the admin partner-services list)
 * back into the wizard's WizardState shape for editing.
 */
function mapServiceToWizardState(row: any): WizardState {
  const parse = parseJson;

  const features = parse(row.features, {}) || {};
  const pincodes = parse(row.available_pincodes, []) || [];
  const images = parse(row.image_urls, []) || [];

  return {
    service: {
      name: row.name || '',
      description: row.description || '',
      category_id: row.category_id || '',
      subcategory_id: row.subcategory_id || '',
      subcategory_label: features.subcategory_label || '',
      cover_image_url: row.primary_image_url || '',
      gallery_images: Array.isArray(images) ? images : [],
      tags: [],
    },
    archetype: features.archetype,
    archetype_locked: !!features.archetype,
    offering: {
      location_id: Array.isArray(pincodes) ? pincodes.join(',') : '',
      serviceable_pincodes: Array.isArray(pincodes) ? pincodes : [],
      variant_name: features.variant_name || '',
      archetype: features.archetype || 'workshop',
      mode: features.mode || 'offline',
      virtual_link: '',
      tech_requirements: '',
      recording_policy: false,
      age_min: features.age_min ?? row.age_group_min ?? 5,
      age_max: features.age_max ?? row.age_group_max ?? 12,
      per_session_capacity: features.per_session_capacity,
      cohort_capacity: features.cohort_capacity,
      booking_cutoff_hours: features.booking_cutoff_hours ?? 24,
      cancellation_policy: row.cancellation_policy || 'flexible',
      min_advance_booking_hours: 0,
      instructor_name: features.instructor || '',
      what_to_bring: features.what_to_bring || '',
      materials_provided: [],
    },
    schedules: Array.isArray(features.schedules) ? features.schedules : [],
    price_rules: Array.isArray(features.price_rules) ? features.price_rules : [],
  };
}

/**
 * Map a raw camp DB row back into WizardState for editing.
 * Camps store the wizard's rich data as the first element of the `features` array.
 */
function mapCampToWizardState(row: any): WizardState {
  const featuresRaw = parseJson(row.features, []);
  const features = Array.isArray(featuresRaw) ? featuresRaw[0] || {} : featuresRaw || {};
  const images = parseJson(row.image_urls, []) || [];
  const pincodes = row.pincode ? [String(row.pincode)] : [];

  return {
    service: {
      name: row.title || '',
      description: row.description || '',
      category_id: row.category_id || 'cat_discover',
      subcategory_id: row.subcategory_id || 'discover_camps_holiday_programs',
      subcategory_label: 'Camps & Holiday Programmes',
      camp_type: row.camp_type || '',
      cover_image_url: row.primary_image_url || '',
      gallery_images: Array.isArray(images) ? images : [],
      tags: [],
    },
    archetype: 'camp',
    archetype_locked: true,
    offering: {
      location_id: pincodes.join(','),
      serviceable_pincodes: pincodes,
      variant_name: features.variant_name || '',
      archetype: 'camp',
      mode: features.mode || 'offline',
      virtual_link: '',
      tech_requirements: '',
      recording_policy: false,
      age_min: row.age_min ?? features.age_min ?? 5,
      age_max: row.age_max ?? features.age_max ?? 12,
      cohort_capacity: row.max_members ?? features.cohort_capacity,
      booking_cutoff_hours: features.booking_cutoff_hours ?? 24,
      cancellation_policy: features.cancellation_policy || 'flexible',
      min_advance_booking_hours: 0,
      instructor_name: features.instructor || '',
      what_to_bring: features.what_to_bring || '',
      materials_provided: [],
    },
    schedules: Array.isArray(features.schedules) && features.schedules.length
      ? features.schedules
      : [{
          name: '',
          start_date: row.start_date || '',
          end_date: row.end_date || '',
          start_time: row.schedule_start_time || row.schedule_time || '',
          end_time: row.schedule_end_time || '',
          duration_minutes: 0,
          buffer_minutes: 0,
          recurrence_type: 'daily',
          recurrence_days: [],
          recurrence_interval: 1,
          skip_dates: [],
          respect_holidays: true,
        }],
    price_rules: Array.isArray(features.price_rules) && features.price_rules.length
      ? features.price_rules
      : [{
          name: 'Camp fee',
          type: 'standard',
          unit: row.price_type || 'per_camp',
          amount: Number(row.price) || 0,
          availability: 'always',
        }],
  };
}

/**
 * Build WizardState for the "Add Another Batch" flow — parent (service/camp)
 * supplies the locked Service-level fields; the source batch pre-fills the rest.
 */
function mapBatchToWizardState(parent: any, parentType: string, batch: any): WizardState {
  const features =
    batch?.features && typeof batch.features === 'object' ? batch.features : {};
  const pincodes = Array.isArray(batch?.pincodes) ? batch.pincodes : [];
  const images = parseJson(parent?.image_urls, []) || [];
  const isCamp = parentType === 'camp';
  const archetype = features.archetype || (isCamp ? 'camp' : 'workshop');

  return {
    service: {
      name: parent?.title || parent?.name || '',
      description: parent?.description || '',
      category_id: parent?.category_id || (isCamp ? 'cat_discover' : ''),
      subcategory_id: parent?.subcategory_id || '',
      subcategory_label: features.subcategory_label || '',
      camp_type: parent?.camp_type || '',
      cover_image_url: parent?.primary_image_url || '',
      gallery_images: Array.isArray(images) ? images : [],
      tags: [],
    },
    archetype,
    archetype_locked: true,
    offering: {
      location_id: pincodes.join(','),
      serviceable_pincodes: pincodes,
      variant_name: batch?.batch_name || '',
      archetype,
      mode: batch?.mode || 'offline',
      virtual_link: '',
      tech_requirements: '',
      recording_policy: false,
      age_min: batch?.age_min ?? 5,
      age_max: batch?.age_max ?? 12,
      cohort_capacity: batch?.total_seats ?? undefined,
      per_session_capacity: batch?.per_session_override ?? undefined,
      booking_cutoff_hours: batch?.booking_cutoff_hours ?? 24,
      cancellation_policy: batch?.cancellation_policy || 'flexible',
      min_advance_booking_hours: 0,
      instructor_name: batch?.instructor || '',
      what_to_bring: batch?.what_to_bring || '',
      materials_provided: [],
    },
    schedules:
      batch?.schedule && Object.keys(batch.schedule).length
        ? [batch.schedule]
        : Array.isArray(features.schedules)
        ? features.schedules
        : [],
    price_rules:
      Array.isArray(features.price_rules) && features.price_rules.length
        ? features.price_rules
        : [
            {
              name: batch?.batch_name || 'Price',
              type: 'standard',
              unit: batch?.price_type || 'per_session',
              amount: Number(batch?.price) || 0,
              availability: 'always',
            },
          ],
  };
}

const WIZARD_STEPS: Omit<WizardStep, 'status'>[] = [
  { id: 1, title: 'Basic Details', description: 'Service info & images' },
  { id: 2, title: 'Batch Details', description: 'Variant configuration' },
  { id: 3, title: 'Schedule & Pricing', description: 'Availability & prices' },
  { id: 4, title: 'Review & Publish', description: 'Final review' },
];

export function useWizardState(options: UseWizardStateOptions) {
  const {
    providerId,
    entityType = 'service',
    serviceId,
    initialService,
    addBatchMode = false,
    parentId,
    fromBatchId,
    onPublish,
    onExit,
  } = options;
  const isEditMode = !!serviceId;
  const isCamp = entityType === 'camp';

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [wizardState, setWizardState] = useState<WizardState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    autosaveState,
    debouncedSave,
    forceSave,
    loadDraft,
    deleteDraft,
  } = useAutosave({
    providerId,
    enabled: true,
  });

  /**
   * On mount: load the existing service (edit mode) or the saved draft (create mode)
   */
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        if (addBatchMode && parentId) {
          // Add Another Batch: load the parent + source batch, start at Step 2.
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/service-detail/${entityType}/${parentId}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          if (res.ok) {
            const data = await res.json();
            const batchList = data.batches || [];
            const fromBatch =
              batchList.find((b: any) => b.id === fromBatchId) || batchList[0] || {};
            setWizardState(mapBatchToWizardState(data.parent, entityType, fromBatch));
            setCompletedSteps([1]);
            setCurrentStep(2);
          }
        } else if (isEditMode) {
          let row = initialService;
          // Fallback (e.g. after a page refresh that drops router state):
          // refetch the partner's services/camps and find this one.
          if (!row) {
            const listPath = isCamp ? 'camps' : 'services';
            const res = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${providerId}/${listPath}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            if (res.ok) {
              const data = await res.json();
              const list = isCamp ? data.camps : data.services;
              row = (list || []).find((s: any) => s.id === serviceId);
            }
          }
          if (row) {
            setWizardState(isCamp ? mapCampToWizardState(row) : mapServiceToWizardState(row));
            setCompletedSteps([1, 2, 3]);
            setCurrentStep(1);
          }
        } else if (isCamp) {
          // New camp: pre-select the Camp program type and lock it.
          setWizardState({ archetype: 'camp', archetype_locked: true });
        } else {
          const draft = (await loadDraft()) as any;
          if (draft) {
            setWizardState(draft.draft_data ?? {});
            setCurrentStep(draft.current_step ?? 1);
            setCompletedSteps(draft.completed_steps ?? []);
          }
        }
      } catch (error) {
        console.error('Failed to initialize wizard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  /**
   * Auto-derive archetype from Step 1's subcategory_label whenever we enter step 2
   */
  useEffect(() => {
    if (currentStep !== 2) return;
    const label = wizardState.service?.subcategory_label;
    if (!label) return;
    const derived = deriveArchetypeFromLabel(label);
    if (derived && derived !== wizardState.archetype) {
      setWizardState(prev => ({
        ...prev,
        archetype: derived,
        archetype_locked: true,
      }));
    }
  }, [currentStep, wizardState.service?.subcategory_label]);

  /**
   * Get validation state for all steps
   */
  const validationState = validateWizard(wizardState);

  /**
   * Get steps with status
   */
  const steps: WizardStep[] = WIZARD_STEPS.map(step => ({
    ...step,
    status: getStepStatus(
      step.id,
      currentStep,
      validationState[step.id],
      completedSteps
    ),
  }));

  /**
   * Update wizard state
   */
  const updateState = useCallback((updates: Partial<WizardState>) => {
    setWizardState(prev => {
      const newState = { ...prev, ...updates };
      
      // Trigger autosave
      debouncedSave(newState, currentStep, completedSteps);
      
      return newState;
    });
  }, [currentStep, completedSteps, debouncedSave]);

  /**
   * Navigate to specific step
   */
  const goToStep = useCallback((stepNumber: number) => {
    // Allow backward navigation always
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
      return;
    }

    // For forward navigation, check if current step is valid
    if (stepNumber > currentStep) {
      if (!canProceedToNextStep(currentStep, wizardState)) {
        return; // Block navigation
      }
      
      // Mark current step as completed
      setCompletedSteps(prev => {
        if (!prev.includes(currentStep)) {
          return [...prev, currentStep];
        }
        return prev;
      });
    }

    setCurrentStep(stepNumber);
  }, [currentStep, wizardState]);

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep]);

  /**
   * Go to previous step
   */
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  /**
   * Check if archetype is locked
   */
  const isArchetypeLocked = useCallback(() => {
    return wizardState.archetype_locked || completedSteps.some(step => step >= 3);
  }, [wizardState.archetype_locked, completedSteps]);

  /**
   * Set archetype (with lock check)
   */
  const setArchetype = useCallback((archetype: ServiceArchetype) => {
    if (isArchetypeLocked()) {
      // Show confirmation modal in UI
      return false;
    }

    updateState({ archetype });
    return true;
  }, [isArchetypeLocked, updateState]);

  /**
   * Lock archetype
   */
  const lockArchetype = useCallback(() => {
    updateState({ archetype_locked: true });
  }, [updateState]);

  /**
   * Save and exit
   */
  const saveAndExit = useCallback(async () => {
    await forceSave(wizardState, currentStep, completedSteps);
    onExit?.();
  }, [wizardState, currentStep, completedSteps, forceSave, onExit]);

  /**
   * Publish service
   */
  const publishService = useCallback(async () => {
    const step6Validation = validationState[4];
    
    // Check if there are blocking errors
    const hasBlockingErrors = step6Validation.errors.some(e => e.startsWith('❌'));
    
    if (hasBlockingErrors) {
      return { success: false, errors: step6Validation.errors };
    }

    setIsPublishing(true);
    
    try {
      // Call publish handler
      await onPublish?.(wizardState);
      
      // Delete draft after successful publish
      // await deleteDraft(draftId); // Would need to track draft ID
      
      return { success: true };
    } catch (error) {
      console.error('Failed to publish:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to publish service'],
      };
    } finally {
      setIsPublishing(false);
    }
  }, [wizardState, validationState, onPublish]);

  /**
   * Reset wizard
   */
  const resetWizard = useCallback(() => {
    setWizardState({});
    setCurrentStep(1);
    setCompletedSteps([]);
  }, []);

  return {
    // State
    wizardState,
    currentStep,
    completedSteps,
    steps,
    validationState,
    isLoading,
    isPublishing,
    autosaveState,

    // Actions
    updateState,
    goToStep,
    nextStep,
    previousStep,
    setArchetype,
    lockArchetype,
    isArchetypeLocked,
    saveAndExit,
    publishService,
    resetWizard,

    // Helpers
    canProceed: canProceedToNextStep(currentStep, wizardState),
  };
}
