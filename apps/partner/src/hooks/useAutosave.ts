/**
 * Autosave Hook for Service Wizard
 * Local-only stub — backend draft endpoints not yet implemented.
 * All API calls are skipped; state is maintained in-memory only.
 */

import { useState, useCallback } from 'react';
import { WizardState, AutosaveState } from '../types/service-wizard';

interface UseAutosaveOptions {
  providerId: string;
  enabled?: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

export function useAutosave(_options: UseAutosaveOptions) {
  const [autosaveState] = useState<AutosaveState>({
    isSaving: false,
    hasUnsavedChanges: false,
  });

  // No-op — backend not ready
  const debouncedSave = useCallback(
    (_draftData: WizardState, _currentStep: number, _completedSteps: number[]) => {},
    []
  );

  const forceSave = useCallback(
    async (_draftData: WizardState, _currentStep: number, _completedSteps: number[]) => {},
    []
  );

  // Always returns null — no persisted draft
  const loadDraft = useCallback(async () => null, []);

  const deleteDraft = useCallback(async (_draftId: string) => {}, []);

  return {
    autosaveState,
    debouncedSave,
    forceSave,
    loadDraft,
    deleteDraft,
  };
}
