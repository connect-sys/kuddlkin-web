import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { WizardState, StepValidation } from '../../../types/service-wizard';
import {
  validateStep1,
  validateStep3,
  validateStep4,
  validateStep5,
} from '../../../utils/wizard-validation';

interface ReviewPublishStepProps {
  wizardState: WizardState;
  validation: StepValidation;
  isPublishing: boolean;
  onPublish: () => Promise<{ success: boolean; errors?: string[] }>;
}

const clean = (msg: string) => msg.replace(/^[❌⚠️]\s*/u, '');

export const ReviewPublishStep: React.FC<ReviewPublishStepProps> = ({ wizardState }) => {
  const { service, archetype, offering, schedules, price_rules } = wizardState;

  const sections = [
    { step: 'Basic Details', errors: validateStep1(wizardState).errors },
    {
      step: 'Program Type',
      errors: archetype ? [] : ['Please select a program type'],
    },
    { step: 'Configure Variant', errors: validateStep3(wizardState).errors },
    { step: 'Schedule', errors: validateStep4(wizardState).errors },
    { step: 'Pricing', errors: validateStep5(wizardState).errors },
  ].map((s) => ({
    ...s,
    errors: s.errors.filter((e) => !e.startsWith('⚠️')).map(clean),
  }));

  const hasErrors = sections.some((s) => s.errors.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Review & Publish</h3>
        <p className="text-sm text-gray-500">
          Check the details below before publishing your service.
        </p>
      </div>

      {/* Validation summary */}
      {hasErrors ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-900">
              Please fix the following before publishing:
            </h4>
          </div>
          <div className="space-y-3">
            {sections
              .filter((s) => s.errors.length > 0)
              .map((s) => (
                <div key={s.step}>
                  <p className="text-sm font-semibold text-red-800">{s.step}</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                    {s.errors.map((err, idx) => (
                      <li key={idx} className="text-sm text-red-700">{err}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            All required fields are complete. You're ready to publish.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
        <SummaryRow label="Service Name" value={service?.name} />
        <SummaryRow label="Category" value={service?.category_id} />
        <SummaryRow label="Subcategory" value={service?.subcategory_label} />
        <SummaryRow label="Program Type" value={archetype} />
        <SummaryRow
          label="Service Pincodes"
          value={offering?.serviceable_pincodes?.join(', ')}
        />
        <SummaryRow label="Mode" value={offering?.mode} />
        <SummaryRow
          label="Age Range"
          value={
            offering?.age_min != null && offering?.age_max != null
              ? `${offering.age_min} - ${offering.age_max} years`
              : undefined
          }
        />
        <SummaryRow
          label="Schedules"
          value={schedules?.length ? `${schedules.length} configured` : undefined}
        />
        <SummaryRow
          label="Pricing Rules"
          value={price_rules?.length ? `${price_rules.length} configured` : undefined}
        />
      </div>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between px-4 py-2.5">
    <span className="text-sm text-gray-500">{label}</span>
    <span
      className={`text-sm font-medium capitalize ${
        value ? 'text-gray-900' : 'text-red-500'
      }`}
    >
      {value || 'Not set'}
    </span>
  </div>
);
