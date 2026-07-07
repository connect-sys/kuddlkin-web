/**
 * Service Creation Wizard - Main Container
 * 4-step wizard with top stepper (no sidebar)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { useWizardState } from '../../hooks/useWizardState';
import { BasicDetailsStep } from './steps/BasicDetailsStep';
import { ProgramTypeStep } from './steps/ProgramTypeStep';
import { ConfigureVariantStep } from './steps/ConfigureVariantStep';
import { ScheduleBuilderStep } from './steps/ScheduleBuilderStep';
import { PricingBuilderStep } from './steps/PricingBuilderStep';
import { ReviewPublishStep } from './steps/ReviewPublishStep';
import { ARCHETYPE_CONFIGS } from '../../config/archetypes';

interface ServiceWizardProps {
  providerId: string;
  entityType?: 'service' | 'camp';
  serviceId?: string;
  initialService?: any;
  addBatchMode?: boolean;
  parentId?: string;
  fromBatchId?: string;
}

export const ServiceWizard: React.FC<ServiceWizardProps> = ({
  providerId,
  entityType = 'service',
  serviceId,
  initialService,
  addBatchMode = false,
  parentId,
  fromBatchId,
}) => {
  const isCamp = entityType === 'camp';
  const navigate = useNavigate();
  const [publishError, setPublishError] = useState<string | null>(null);

  const {
    wizardState,
    currentStep,
    steps,
    validationState,
    isLoading,
    isPublishing,
    updateState,
    goToStep,
    nextStep,
    previousStep,
    setArchetype,
    lockArchetype,
    isArchetypeLocked,
    publishService,
    canProceed,
  } = useWizardState({
    providerId,
    entityType,
    serviceId,
    initialService,
    addBatchMode,
    parentId,
    fromBatchId,
    onPublish: async (state) => {
      const schedule = state.schedules?.[0];
      const firstPrice = state.price_rules?.[0];

      const wizardFeatures = {
        archetype: state.archetype,
        mode: state.offering?.mode,
        instructor: state.offering?.instructor_name,
        what_to_bring: state.offering?.what_to_bring,
        variant_name: state.offering?.variant_name,
        subcategory_label: state.service?.subcategory_label,
        cancellation_policy: state.offering?.cancellation_policy,
        age_min: state.offering?.age_min,
        age_max: state.offering?.age_max,
        per_session_capacity: state.offering?.per_session_capacity,
        cohort_capacity: state.offering?.cohort_capacity,
        booking_cutoff_hours: state.offering?.booking_cutoff_hours,
        schedules: state.schedules,
        price_rules: state.price_rules,
      };

      // ---- Add Another Batch: create a batch under an existing service/camp ----
      if (addBatchMode && parentId) {
        const pincodes = state.offering?.serviceable_pincodes || [];
        const batchPayload = {
          parent_type: entityType,
          parent_id: parentId,
          provider_id: providerId,
          batch_name: state.offering?.variant_name || '',
          mode: state.offering?.mode || 'offline',
          age_min: state.offering?.age_min,
          age_max: state.offering?.age_max,
          pincodes,
          total_seats:
            state.offering?.cohort_capacity ||
            state.offering?.per_session_capacity ||
            null,
          per_session_override: state.offering?.cohort_capacity
            ? state.offering?.per_session_capacity ?? null
            : null,
          cancellation_policy: state.offering?.cancellation_policy || 'flexible',
          booking_cutoff_hours: state.offering?.booking_cutoff_hours ?? 24,
          instructor: state.offering?.instructor_name || null,
          what_to_bring: state.offering?.what_to_bring || null,
          price: firstPrice?.amount ?? 0,
          price_type: isCamp
            ? firstPrice?.unit === 'per_day'
              ? 'per_day'
              : 'camp'
            : firstPrice?.unit || 'per_session',
          schedule: schedule || {},
          features: wizardFeatures,
          status: 'live',
        };

        const batchRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/batches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(batchPayload),
        });
        const batchData = await batchRes.json().catch(() => ({}));
        if (!batchRes.ok || !batchData.success) {
          throw new Error(batchData.message || 'Failed to add batch. Please try again.');
        }
        navigate(`/manage/${entityType}/${parentId}`);
        return;
      }

      // ---- Camp publish: camps live in their own table / endpoint ----
      if (isCamp) {
        const pincodes = state.offering?.serviceable_pincodes || [];
        const campPayload = {
          provider_id: providerId,
          ...(serviceId ? { camp_id: serviceId } : {}),
          title: state.service?.name,
          description: state.service?.description,
          camp_type: state.service?.camp_type || 'other',
          category_id: state.service?.category_id,
          subcategory_id: state.service?.subcategory_id,
          start_date: schedule?.start_date,
          end_date: schedule?.end_date,
          schedule_time: schedule?.start_time,
          schedule_start_time: schedule?.start_time,
          schedule_end_time: schedule?.end_time,
          max_members:
            state.offering?.cohort_capacity ||
            state.offering?.per_session_capacity ||
            1,
          price: firstPrice?.amount ?? 0,
          // The camps table only allows price_type IN ('camp','per_day','per_week').
          price_type: firstPrice?.unit === 'per_day' ? 'per_day' : 'camp',
          age_min: state.offering?.age_min,
          age_max: state.offering?.age_max,
          pincode: pincodes[0] || '',
          image_urls: state.service?.gallery_images || [],
          primary_image_url: state.service?.cover_image_url || null,
          // Camp `features` column is an array — wrap the wizard data as element 0.
          features: [wizardFeatures],
          status: 'active',
        };

        const campRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/camps`, {
          method: serviceId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(campPayload),
        });
        const campData = await campRes.json().catch(() => ({}));
        if (!campRes.ok || !campData.success) {
          throw new Error(campData.message || 'Failed to save camp. Please try again.');
        }
        const campId = serviceId || campData.campId;
        navigate(campId ? `/manage/camp/${campId}` : '/dashboard');
        return;
      }

      const payload = {
        provider_id: providerId,
        name: state.service?.name,
        description: state.service?.description,
        category_id: state.service?.category_id,
        subcategory_id: state.service?.subcategory_id,
        subcategory_label: state.service?.subcategory_label,
        price_type: firstPrice?.unit || 'per_session',
        price: firstPrice?.amount ?? 0,
        duration_minutes: schedule?.duration_minutes || 60,
        cancellation_policy: state.offering?.cancellation_policy || '',
        available_pincodes: state.offering?.serviceable_pincodes || [],
        age_group_min: state.offering?.age_min,
        age_group_max: state.offering?.age_max,
        image_urls: state.service?.gallery_images || [],
        primary_image_url: state.service?.cover_image_url || null,
        features: wizardFeatures,
        status: 'active',
      };

      const response = await fetch(
        serviceId
          ? `${import.meta.env.VITE_API_BASE_URL}/api/services/${serviceId}`
          : `${import.meta.env.VITE_API_BASE_URL}/api/services`,
        {
          method: serviceId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create service. Please try again.');
      }

      const newServiceId = serviceId || data.serviceId;
      navigate(newServiceId ? `/manage/service/${newServiceId}` : '/dashboard');
    },
    onExit: () => navigate('/dashboard'),
  });

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicDetailsStep
            data={wizardState.service}
            validation={validationState[1]}
            onChange={(service: any) => updateState({ service })}
            providerId={providerId}
            entityType={entityType}
          />
        );
      case 2: {
        const autoDetected = !!wizardState.service?.subcategory_label && !!wizardState.archetype;
        const archetypeConfig = wizardState.archetype ? ARCHETYPE_CONFIGS[wizardState.archetype] : null;

        return (
          <div className="space-y-3">
            {/* Batch context banner */}
            <div className="bg-[#578F82]/10 border border-[#578F82]/30 rounded-lg px-3 py-2.5 flex items-start gap-2">
              <span className="text-lg leading-none">📦</span>
              <div>
                <p className="text-sm font-semibold text-[#578F82]">
                  {addBatchMode
                    ? `Adding a new batch to '${wizardState.service?.name || 'this service'}'`
                    : serviceId
                    ? `Editing '${wizardState.service?.name || 'this service'}'`
                    : `You're creating Batch #1 for '${wizardState.service?.name || 'this service'}'`}
                </p>
                <p className="text-xs text-gray-600">
                  {addBatchMode
                    ? 'Service-level details are locked — only this batch’s fields apply.'
                    : 'After publishing, add more batches from the Service Detail page.'}
                </p>
              </div>
            </div>

            {autoDetected && archetypeConfig ? (
              /* Auto-detected: show a compact banner and skip the picker */
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-xl">{archetypeConfig.icon}</span>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">{archetypeConfig.title}</span>{' '}
                  auto-selected from{' '}
                  <span className="font-medium">"{wizardState.service?.subcategory_label}"</span>
                </p>
              </div>
            ) : (
              <ProgramTypeStep
                selectedArchetype={wizardState.archetype}
                isLocked={isArchetypeLocked()}
                onSelect={setArchetype}
                onLock={lockArchetype}
                categoryLabel={wizardState.service?.category_id}
                subcategoryLabel={wizardState.service?.subcategory_label}
              />
            )}

            {wizardState.archetype && (
              <>
                <hr className="border-gray-200" />
                <ConfigureVariantStep
                  archetype={wizardState.archetype}
                  data={wizardState.offering}
                  onChange={(offering: any) => updateState({ offering })}
                />
              </>
            )}
          </div>
        );
      }
      case 3:
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                Schedule
              </h3>
              <ScheduleBuilderStep
                archetype={wizardState.archetype}
                offeringId={wizardState.offering?.location_id}
                data={wizardState.schedules || []}
                onChange={(schedules: any) => updateState({ schedules })}
              />
            </div>
            <hr className="border-gray-200" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                Pricing
              </h3>
              <PricingBuilderStep
                archetype={wizardState.archetype}
                data={wizardState.price_rules || []}
                onChange={(price_rules: any) => updateState({ price_rules })}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <ReviewPublishStep
            wizardState={wizardState}
            validation={validationState[4]}
            isPublishing={isPublishing}
            onPublish={publishService}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#578F82] mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading wizard...</p>
        </div>
      </div>
    );
  }

  // In Add Another Batch mode Step 1 (Basic Details) is skipped — Step 2 is first.
  const isFirstStep = currentStep === 1 || (addBatchMode && currentStep === 2);
  const isLastStep = currentStep === steps.length;
  const hasBlockingErrors = validationState[4]?.errors?.some(e => e.startsWith('❌'));

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden min-h-0">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
        <h1 className="text-base font-semibold text-gray-900">
          {addBatchMode
            ? 'Add Another Batch'
            : serviceId
            ? isCamp ? 'Edit Camp' : 'Edit Service'
            : isCamp ? 'Add New Camp' : 'Add New Service'}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Top Stepper */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {steps.map((step, index) => {
            const isDone = step.status === 'complete';
            const isActive = step.id === currentStep;
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => goToStep(step.id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#578F82] text-white shadow-md'
                        : isDone
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className={`text-xs hidden sm:block font-medium ${
                    isActive ? 'text-[#578F82]' : isDone ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                    steps[index].status === 'complete' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="max-w-3xl mx-auto">
          {renderStep()}
        </div>
      </div>

      {/* Publish error banner */}
      {publishError && (
        <div className="border-t border-red-200 bg-red-50 px-4 sm:px-6 py-2.5">
          <p className="text-sm text-red-700">
            <span className="font-semibold">Could not publish:</span> {publishError}
          </p>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-white flex items-center justify-between gap-3">
        <button
          onClick={previousStep}
          disabled={isFirstStep}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            isFirstStep
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          {!canProceed && !isLastStep && (
            <span className="text-xs text-red-500 hidden sm:block">
              Complete required fields
            </span>
          )}

          {!isLastStep ? (
            <button
              onClick={nextStep}
              disabled={!canProceed}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                canProceed
                  ? 'bg-[#578F82] text-white hover:bg-[#467063]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={async () => {
                setPublishError(null);
                const result = await publishService();
                if (!result.success) {
                  setPublishError(
                    result.errors?.join(' · ') || 'Failed to publish service'
                  );
                }
              }}
              disabled={isPublishing || hasBlockingErrors}
              className={`flex items-center gap-1.5 px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                isPublishing || hasBlockingErrors
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#578F82] text-white hover:bg-[#467063]'
              }`}
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                  <span>{serviceId ? 'Saving...' : 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {addBatchMode
                      ? 'Publish Batch'
                      : serviceId
                      ? 'Save Changes'
                      : isCamp ? 'Publish Camp' : 'Publish Service'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
