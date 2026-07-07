/**
 * Step 4: Schedule Builder (archetype-aware)
 * Single-schedule editor with auto-generated session summary.
 */

import React, { useState } from 'react';
import { Plus, X, CalendarDays } from 'lucide-react';
import { ServiceArchetype, ScheduleFormData } from '../../../types/service-wizard';
import { getScheduleType, DAY_NAMES, RECURRENCE_CHIPS } from '../../../config/archetypes';

interface ScheduleBuilderStepProps {
  archetype?: ServiceArchetype;
  offeringId?: string;
  data: ScheduleFormData[];
  onChange: (data: ScheduleFormData[]) => void;
}

const defaultSchedule: ScheduleFormData = {
  name: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  duration_minutes: 60,
  buffer_minutes: 0,
  recurrence_type: 'once',
  recurrence_days: [],
  recurrence_interval: 1,
  skip_dates: [],
  respect_holidays: true,
};

const minutesBetween = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
};

const countSessions = (
  s: ScheduleFormData,
  scheduleType: string
): { sessions: number; skipped: number } => {
  if (scheduleType === 'single_date') {
    return { sessions: s.start_date ? 1 : 0, skipped: 0 };
  }
  if (!s.start_date || !s.end_date) return { sessions: 0, skipped: 0 };
  const start = new Date(s.start_date);
  const end = new Date(s.end_date);
  if (end < start) return { sessions: 0, skipped: 0 };

  const skip = new Set(s.skip_dates || []);
  let sessions = 0;
  let skipped = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const matchesDay =
      scheduleType === 'recurring'
        ? (s.recurrence_days || []).includes(d.getDay())
        : true;
    if (!matchesDay) continue;
    if (skip.has(iso)) {
      skipped++;
      continue;
    }
    sessions++;
  }
  return { sessions, skipped };
};

export const ScheduleBuilderStep: React.FC<ScheduleBuilderStepProps> = ({
  archetype,
  data,
  onChange,
}) => {
  const [schedule, setSchedule] = useState<ScheduleFormData>(
    data[0] || defaultSchedule
  );
  const [skipInput, setSkipInput] = useState('');

  if (!archetype) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">Please select a program type first</p>
      </div>
    );
  }

  const scheduleType = getScheduleType(archetype);
  const isRecurring = scheduleType === 'recurring';
  const isRange = scheduleType === 'date_range' || scheduleType === 'availability_windows';
  const showEndDate = isRecurring || isRange;

  const inputCls =
    'w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#578F82] focus:border-transparent';
  const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

  const update = (patch: Partial<ScheduleFormData>) => {
    const next = { ...schedule, ...patch };
    if (patch.start_time !== undefined || patch.end_time !== undefined) {
      next.duration_minutes = minutesBetween(next.start_time, next.end_time);
    }
    setSchedule(next);
    onChange([next]);
  };

  const toggleDay = (day: number) => {
    const days = schedule.recurrence_days || [];
    update({
      recurrence_days: days.includes(day)
        ? days.filter((d) => d !== day)
        : [...days, day],
      recurrence_type: 'weekly',
    });
  };

  const addSkipDate = () => {
    if (!skipInput) return;
    const skips = schedule.skip_dates || [];
    if (!skips.includes(skipInput)) update({ skip_dates: [...skips, skipInput] });
    setSkipInput('');
  };

  const { sessions, skipped } = countSessions(schedule, scheduleType);
  const isOngoing = isRecurring && !schedule.end_date;

  return (
    <div className="space-y-3">
      {/* Required fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={schedule.start_date}
            onChange={(e) => update({ start_date: e.target.value })}
            className={inputCls}
          />
        </div>
        {showEndDate && (
          <div>
            <label className={labelCls}>
              End Date{' '}
              {isRecurring ? (
                <span className="text-gray-400">(blank = ongoing)</span>
              ) : (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="date"
              value={schedule.end_date || ''}
              onChange={(e) => update({ end_date: e.target.value })}
              className={inputCls}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>
            Start Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={schedule.start_time}
            onChange={(e) => update({ start_time: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            End Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={schedule.end_time}
            onChange={(e) => update({ end_time: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {/* Recurrence (Class) */}
      {isRecurring && (
        <div>
          <label className={labelCls}>
            Recurrence <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {RECURRENCE_CHIPS.filter((c) => c.label !== 'Custom').map((chip) => {
              const active =
                chip.days.length > 0 &&
                chip.days.every((d) => (schedule.recurrence_days || []).includes(d)) &&
                (schedule.recurrence_days || []).length === chip.days.length;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => update({ recurrence_days: chip.days, recurrence_type: 'weekly' })}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'bg-[#578F82] text-white border-[#578F82]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#578F82]'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1.5">
            {DAY_NAMES.map((day) => {
              const active = (schedule.recurrence_days || []).includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? 'bg-[#578F82] text-white border-[#578F82]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#578F82]'
                  }`}
                >
                  {day.short[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional fields */}
      <div className="border-t pt-3 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Optional
        </p>

        {/* Batch Name is set once in Step 2 (Batch Details) — not re-asked here. */}

        {showEndDate && (
          <div>
            <label className={labelCls}>Skip Dates (holidays / exceptions)</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={skipInput}
                onChange={(e) => setSkipInput(e.target.value)}
                className={inputCls}
              />
              <button
                type="button"
                onClick={addSkipDate}
                disabled={!skipInput}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#578F82] text-white hover:bg-[#467063] disabled:bg-gray-200 disabled:text-gray-400"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {(schedule.skip_dates || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(schedule.skip_dates || []).map((date) => (
                  <span
                    key={date}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    {date}
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          skip_dates: (schedule.skip_dates || []).filter((d) => d !== date),
                        })
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input
            type="checkbox"
            checked={schedule.respect_holidays}
            onChange={(e) => update({ respect_holidays: e.target.checked })}
            className="w-3.5 h-3.5 accent-[#578F82]"
          />
          Respect public holiday calendar
        </label>
      </div>

      {/* Auto-generated summary */}
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Auto-generated
        </p>
        <div className="bg-[#578F82]/5 border border-[#578F82]/20 rounded-lg p-3 flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-[#578F82] flex-shrink-0" />
          <div className="text-sm text-gray-700">
            {schedule.start_date ? (
              <>
                <span className="font-semibold text-[#578F82]">
                  {sessions} session{sessions === 1 ? '' : 's'}
                </span>{' '}
                will be created
                {skipped > 0 && (
                  <span className="text-gray-500"> · {skipped} skipped</span>
                )}
                {schedule.duration_minutes > 0 && (
                  <span className="text-gray-500"> · {schedule.duration_minutes} min each</span>
                )}
                {isOngoing && (
                  <span className="text-gray-500"> · ongoing (no end date)</span>
                )}
              </>
            ) : (
              <span className="text-gray-500">Set a start date to preview sessions</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
