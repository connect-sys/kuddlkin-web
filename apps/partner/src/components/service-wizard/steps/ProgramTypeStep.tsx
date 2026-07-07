/**
 * Step 2: Program Type (Archetype Selection)
 * Select service archetype with lock mechanism
 */

import React, { useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { ServiceArchetype } from '../../../types/service-wizard';
import { ARCHETYPE_CONFIGS } from '../../../config/archetypes';

interface ProgramTypeStepProps {
  selectedArchetype?: ServiceArchetype;
  isLocked: boolean;
  onSelect: (archetype: ServiceArchetype) => boolean;
  onLock: () => void;
  categoryLabel?: string;
  subcategoryLabel?: string;
}

export const ProgramTypeStep: React.FC<ProgramTypeStepProps> = ({
  selectedArchetype,
  isLocked,
  onSelect,
  onLock,
  categoryLabel,
  subcategoryLabel,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingArchetype, setPendingArchetype] = useState<ServiceArchetype | null>(null);

  const handleSelect = (archetype: ServiceArchetype) => {
    if (isLocked && archetype !== selectedArchetype) {
      setPendingArchetype(archetype);
      setShowConfirmation(true);
      return;
    }

    const success = onSelect(archetype);
    if (success && !isLocked) {
      onLock();
    }
  };

  const confirmChange = () => {
    if (pendingArchetype) {
      onSelect(pendingArchetype);
      setShowConfirmation(false);
      setPendingArchetype(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + step 1 context */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            How is{subcategoryLabel ? ` "${subcategoryLabel}"` : ' this service'} delivered?
          </h3>
          <p className="text-sm text-gray-500">
            Pick the format — this sets up scheduling and pricing. Not the same as your
            subcategory.
          </p>
        </div>
        {(subcategoryLabel || categoryLabel) && (
          <div className="flex flex-wrap gap-1.5">
            {categoryLabel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#578F82]/10 text-[#578F82] border border-[#578F82]/30 capitalize">
                {categoryLabel}
              </span>
            )}
            {subcategoryLabel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                {subcategoryLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Archetype Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.values(ARCHETYPE_CONFIGS).map((config) => {
          const isSelected = selectedArchetype === config.key;

          return (
            <button
              key={config.key}
              onClick={() => handleSelect(config.key)}
              className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-[#578F82] bg-[#578F82]/5'
                  : 'border-gray-200 hover:border-[#578F82]/50'
              }`}
            >
              {isSelected && isLocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3.5 h-3.5 text-[#578F82]" />
                </div>
              )}

              <div className="text-2xl mb-1.5">{config.icon}</div>
              <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{config.title}</h4>
              <p className="text-xs text-gray-500 leading-snug">{config.description}</p>
            </button>
          );
        })}
      </div>

      {/* Not Sure CTA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Not sure which type to choose?{' '}
          <button className="text-blue-600 font-medium hover:underline">Talk to us →</button>
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Change Program Type?
            </h3>
            <p className="text-gray-600 mb-4">
              Changing the program type will reset your configuration. Are you sure you want to continue?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmChange}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Yes, Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
