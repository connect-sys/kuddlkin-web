/**
 * Step 5: Pricing Builder
 * PriceRule list per Offering — add / edit / remove inline.
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  ServiceArchetype,
  PriceRuleFormData,
  PricingUnit,
} from '../../../types/service-wizard';
import {
  getDefaultPricingUnit,
  PRICING_UNIT_LABELS,
  DISCOUNT_TYPE_LABELS,
} from '../../../config/archetypes';

interface PricingBuilderStepProps {
  archetype?: ServiceArchetype;
  data: PriceRuleFormData[];
  onChange: (data: PriceRuleFormData[]) => void;
}

const inputCls =
  'w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#578F82] focus:border-transparent';
const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

export const PricingBuilderStep: React.FC<PricingBuilderStepProps> = ({
  archetype,
  data,
  onChange,
}) => {
  if (!archetype) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">Please select a program type first</p>
      </div>
    );
  }

  const rules = data;

  const newRule = (): PriceRuleFormData => ({
    name: '',
    type: 'standard',
    unit: getDefaultPricingUnit(archetype),
    amount: 0,
    availability: 'always',
  });

  const addRule = () => onChange([...rules, newRule()]);

  const updateRule = (index: number, patch: Partial<PriceRuleFormData>) => {
    onChange(rules.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {rules.length === 0 && (
        <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-500">No pricing options yet.</p>
        </div>
      )}

      {rules.map((rule, index) => {
        const isDiscount = rule.type === 'discount';
        return (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Pricing option {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeRule(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Required fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => updateRule(index, { name: e.target.value })}
                  placeholder="e.g., Per session"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={rule.type}
                  onChange={(e) =>
                    updateRule(index, {
                      type: e.target.value as PriceRuleFormData['type'],
                    })
                  }
                  className={inputCls}
                >
                  <option value="standard">Standard</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={rule.unit}
                  onChange={(e) =>
                    updateRule(index, { unit: e.target.value as PricingUnit })
                  }
                  className={inputCls}
                >
                  {Object.entries(PRICING_UNIT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  // Show the actual amount including 0 (free). Using `|| ''` here
                  // would blank out a 0, making free pricing impossible to enter.
                  value={Number.isFinite(rule.amount) ? rule.amount : ''}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    updateRule(index, { amount: Number.isFinite(n) ? n : 0 });
                  }}
                  min={0}
                  placeholder="500"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Discount-specific fields */}
            {isDiscount && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Discount Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rule.discount_type || ''}
                    onChange={(e) =>
                      updateRule(index, {
                        discount_type: e.target
                          .value as PriceRuleFormData['discount_type'],
                      })
                    }
                    className={inputCls}
                  >
                    <option value="">-- Select --</option>
                    {Object.entries(DISCOUNT_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Discount %</label>
                  <input
                    type="number"
                    value={rule.discount_percentage || ''}
                    onChange={(e) =>
                      updateRule(index, {
                        discount_percentage: parseFloat(e.target.value) || undefined,
                      })
                    }
                    min={0}
                    max={100}
                    placeholder="10"
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Availability</label>
                <select
                  value={rule.availability}
                  onChange={(e) =>
                    updateRule(index, {
                      availability: e.target
                        .value as PriceRuleFormData['availability'],
                    })
                  }
                  className={inputCls}
                >
                  <option value="always">Always available</option>
                  <option value="between_dates">Between dates</option>
                  <option value="until_date">Until date</option>
                </select>
              </div>
              {rule.availability === 'between_dates' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>From</label>
                    <input
                      type="date"
                      value={rule.available_from || ''}
                      onChange={(e) =>
                        updateRule(index, { available_from: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Until</label>
                    <input
                      type="date"
                      value={rule.available_until || ''}
                      onChange={(e) =>
                        updateRule(index, { available_until: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
              {rule.availability === 'until_date' && (
                <div>
                  <label className={labelCls}>Until</label>
                  <input
                    type="date"
                    value={rule.available_until || ''}
                    onChange={(e) =>
                      updateRule(index, { available_until: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addRule}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-dashed border-[#578F82]/40 text-sm font-medium text-[#578F82] hover:bg-[#578F82]/5"
      >
        <Plus className="w-4 h-4" /> Add pricing option
      </button>
    </div>
  );
};
