import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AvailabilityManagementProps {
  partnerId: string;
  partnerType: 'solo' | 'academy';
  businessName?: string;
}

interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface BatchTiming {
  batchName: string;
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  maxCapacity: number;
}

const AvailabilityManagement: React.FC<AvailabilityManagementProps> = ({ 
  partnerId, 
  partnerType, 
  businessName 
}) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [batchTimings, setBatchTimings] = useState<BatchTiming[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  useEffect(() => {
    initializeAvailability();
  }, [partnerType]);

  const initializeAvailability = () => {
    if (partnerType === 'solo') {
      // Initialize working hours for all days
      const initialHours: WorkingHours[] = daysOfWeek.map((_, index) => ({
        dayOfWeek: index,
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: index >= 1 && index <= 5 // Monday to Friday by default
      }));
      setWorkingHours(initialHours);
    } else {
      // Initialize with empty batch timings
      setBatchTimings([]);
    }
  };

  const updateWorkingHours = (dayIndex: number, field: keyof WorkingHours, value: any) => {
    setWorkingHours(prev => prev.map((hours, index) => 
      index === dayIndex ? { ...hours, [field]: value } : hours
    ));
  };

  const addBatchTiming = () => {
    const newBatch: BatchTiming = {
      batchName: `Batch ${batchTimings.length + 1}`,
      dayOfWeek: 1, // Monday
      startTime: '16:00',
      durationMinutes: 120,
      maxCapacity: 15
    };
    setBatchTimings(prev => [...prev, newBatch]);
  };

  const updateBatchTiming = (index: number, field: keyof BatchTiming, value: any) => {
    setBatchTimings(prev => prev.map((batch, i) => 
      i === index ? { ...batch, [field]: value } : batch
    ));
  };

  const removeBatchTiming = (index: number) => {
    setBatchTimings(prev => prev.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      let response;
      
      if (partnerType === 'solo') {
        // Save working hours
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/partner/working-hours`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            providerId: partnerId,
            workingHours: workingHours
          })
        });
      } else {
        // Save batch timings
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/partner/batch-timings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            providerId: partnerId,
            batchTimings: batchTimings
          })
        });
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Availability settings saved successfully!');
      } else {
        toast.error(data.message || 'Failed to save availability settings');
      }
    } catch (error) {
      console.error('Save availability error:', error);
      toast.error('Failed to save availability settings');
    } finally {
      setSaving(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#24335A] mb-2">
          {partnerType === 'solo' ? 'Working Hours' : 'Batch Timings'}
        </h2>
        <p className="text-gray-600">
          {partnerType === 'solo' 
            ? 'Set your available working hours for each day of the week'
            : 'Configure your batch schedules and capacity management'
          }
        </p>
      </div>

      {partnerType === 'solo' ? (
        /* Solo Partner - Working Hours */
        <div className="space-y-4">
          {workingHours.map((hours, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.isAvailable}
                    onChange={(e) => updateWorkingHours(index, 'isAvailable', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="font-medium text-gray-700 w-24">
                    {daysOfWeek[index]}
                  </span>
                </div>

                {hours.isAvailable ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <select
                        value={hours.startTime}
                        onChange={(e) => updateWorkingHours(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#267D71]"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">to</span>
                      <select
                        value={hours.endTime}
                        onChange={(e) => updateWorkingHours(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#267D71]"
                      >
                        {timeOptions.filter(time => time > hours.startTime).map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Not available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Academy Partner - Batch Timings */
        <div className="space-y-6">
          {batchTimings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Batch Timings Set</h3>
              <p className="text-gray-400 mb-4">Create your first batch to start accepting bookings</p>
              <button
                onClick={addBatchTiming}
                className="bg-[#267D71] text-white px-6 py-2 rounded-lg hover:bg-[#1e635c] flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Batch
              </button>
            </div>
          ) : (
            <>
              {batchTimings.map((batch, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-[#24335A]">Batch {index + 1}</h4>
                    <button
                      onClick={() => removeBatchTiming(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batch Name
                      </label>
                      <input
                        type="text"
                        value={batch.batchName}
                        onChange={(e) => updateBatchTiming(index, 'batchName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#267D71]"
                        placeholder="e.g., Morning Batch"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day of Week
                      </label>
                      <select
                        value={batch.dayOfWeek}
                        onChange={(e) => updateBatchTiming(index, 'dayOfWeek', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#267D71]"
                      >
                        {daysOfWeek.map((day, dayIndex) => (
                          <option key={dayIndex} value={dayIndex}>{day}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <select
                        value={batch.startTime}
                        onChange={(e) => updateBatchTiming(index, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#267D71]"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <select
                        value={batch.durationMinutes}
                        onChange={(e) => updateBatchTiming(index, 'durationMinutes', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#267D71]"
                      >
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                        <option value={150}>2.5 hours</option>
                        <option value={180}>3 hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Capacity
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={batch.maxCapacity}
                        onChange={(e) => updateBatchTiming(index, 'maxCapacity', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <div className="flex items-center bg-[#E6F8F6] px-3 py-2 rounded-lg">
                        <Users className="w-4 h-4 text-[#267D71] mr-2" />
                        <span className="font-bold text-[#267D71]">{batch.maxCapacity} kids</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <strong>Batch Summary:</strong> {batch.batchName} on {daysOfWeek[batch.dayOfWeek]}s 
                        at {batch.startTime} for {batch.durationMinutes} minutes (max {batch.maxCapacity} children)
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addBatchTiming}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#267D71] hover:text-[#267D71] transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Batch
              </button>
            </>
          )}
        </div>
      )}

      {/* Buffer Time Info */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Buffer Time Protection</h4>
            <p className="text-yellow-700 text-sm mt-1">
              A 30-minute buffer is automatically added before and after each {partnerType === 'solo' ? 'booking' : 'batch'} 
              to prevent overlapping schedules and allow for travel time.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveAvailability}
          disabled={saving || (partnerType === 'academy' && batchTimings.length === 0)}
          className="bg-[#267D71] text-white px-8 py-3 rounded-lg hover:bg-[#1e635c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Availability Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AvailabilityManagement;
