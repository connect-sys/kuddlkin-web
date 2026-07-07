/**
 * Service Wizard Sidebar
 * Shows step navigation with status indicators
 */

import React from 'react';
import { Check, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { WizardStep, AutosaveState } from '../../types/service-wizard';

interface WizardSidebarProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
  autosaveState: AutosaveState;
}

export const WizardSidebar: React.FC<WizardSidebarProps> = ({
  steps,
  currentStep,
  onStepClick,
  autosaveState,
}) => {
  const getStepIcon = (step: WizardStep) => {
    switch (step.status) {
      case 'complete':
        return <Check className="w-4 h-4" />;
      case 'active':
        return <Circle className="w-4 h-4 fill-current" />;
      case 'has-issues':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getStepColor = (step: WizardStep) => {
    switch (step.status) {
      case 'complete':
        return 'bg-green-500 text-white border-green-500';
      case 'active':
        return 'bg-[#578F82] text-white border-[#578F82]';
      case 'has-issues':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'pending':
      default:
        return 'bg-white text-gray-400 border-gray-300';
    }
  };

  const getStepTextColor = (step: WizardStep) => {
    switch (step.status) {
      case 'complete':
      case 'active':
        return 'text-gray-900';
      case 'has-issues':
        return 'text-yellow-700';
      case 'pending':
      default:
        return 'text-gray-500';
    }
  };

  const canNavigateToStep = (step: WizardStep) => {
    // Can always go back
    if (step.id < currentStep) return true;
    
    // Can't skip ahead
    if (step.id > currentStep + 1) return false;
    
    return true;
  };

  const formatLastSaved = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col sticky top-0 self-start">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Create Service</h2>
        <p className="text-xs text-gray-500 mt-1">Complete all steps to publish</p>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-200px)]">
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isClickable = canNavigateToStep(step);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`w-full flex items-start gap-2 p-2 rounded-lg transition-all ${
                    isClickable
                      ? 'hover:bg-white cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                  } ${step.status === 'active' ? 'bg-white shadow-sm' : ''}`}
                >
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${getStepColor(
                      step
                    )}`}
                  >
                    {getStepIcon(step)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${getStepTextColor(step)}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {step.description}
                    </div>
                  </div>
                </button>

                {/* Connector line */}
                {!isLast && (
                  <div className="absolute left-[23px] top-[45px] w-0.5 h-3 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Autosave Status */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-sm">
          {autosaveState.isSaving ? (
            <>
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              <span className="text-gray-600">Saving...</span>
            </>
          ) : autosaveState.error ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600">Save failed</span>
            </>
          ) : autosaveState.lastSaved ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">
                Saved {formatLastSaved(autosaveState.lastSaved)}
              </span>
            </>
          ) : autosaveState.hasUnsavedChanges ? (
            <>
              <Circle className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-gray-600">Unsaved changes</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
