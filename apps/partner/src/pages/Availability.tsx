import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Settings, Save, Plus, Trash2, Users, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import PartnerBookingCalendar from '../components/calendar/PartnerBookingCalendar';
import CustomTimePicker from '../components/ui/CustomTimePicker';

interface WorkingHour {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
}

interface BatchTiming {
  batchName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  isActive: boolean;
}

interface AvailabilityData {
  partnerType: 'solo' | 'academy';
  bufferTimeMinutes: number;
  calendarSyncEnabled: boolean;
  googleCalendarId: string;
  icalUrl: string;
  workingHours: WorkingHour[];
  batchTimings: BatchTiming[];
}

const Availability: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'settings'>('calendar');
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>({
    partnerType: 'solo',
    bufferTimeMinutes: 30,
    calendarSyncEnabled: false,
    googleCalendarId: '',
    icalUrl: '',
    workingHours: [
      { dayOfWeek: 0, isAvailable: false, startTime: '09:00', endTime: '17:00', breakStartTime: '', breakEndTime: '' },
      { dayOfWeek: 1, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 2, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 3, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 4, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 5, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 6, isAvailable: false, startTime: '09:00', endTime: '17:00', breakStartTime: '', breakEndTime: '' }
    ],
    batchTimings: []
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchAvailabilityData();
  }, []);

  const fetchAvailabilityData = async () => {
    try {
      const savedData = localStorage.getItem(`availability_${user?.id}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setAvailabilityData(parsedData);
      }
    } catch (error) {
      console.error('Error fetching availability data:', error);
      toast.error('Failed to load availability settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerTypeChange = async (newType: 'solo' | 'academy') => {
    try {
      setAvailabilityData(prev => ({ ...prev, partnerType: newType }));
      
      const updatedData = { ...availabilityData, partnerType: newType };
      localStorage.setItem(`availability_${user?.id}`, JSON.stringify(updatedData));
      
      toast.success('Partner type updated successfully');
    } catch (error) {
      console.error('Error updating partner type:', error);
      toast.error('Failed to update partner type');
    }
  };

  const handleWorkingHoursChange = (index: number, field: keyof WorkingHour, value: any) => {
    const newWorkingHours = [...availabilityData.workingHours];
    newWorkingHours[index] = { ...newWorkingHours[index], [field]: value };
    setAvailabilityData(prev => ({ ...prev, workingHours: newWorkingHours }));
  };

  const handleBatchTimingChange = (index: number, field: keyof BatchTiming, value: any) => {
    const newBatchTimings = [...availabilityData.batchTimings];
    newBatchTimings[index] = { ...newBatchTimings[index], [field]: value };
    setAvailabilityData(prev => ({ ...prev, batchTimings: newBatchTimings }));
  };

  const addBatchTiming = () => {
    const newBatch: BatchTiming = {
      batchName: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      maxCapacity: 10,
      isActive: true
    };
    setAvailabilityData(prev => ({
      ...prev,
      batchTimings: [...prev.batchTimings, newBatch]
    }));
  };

  const removeBatchTiming = (index: number) => {
    const newBatchTimings = availabilityData.batchTimings.filter((_, i) => i !== index);
    setAvailabilityData(prev => ({ ...prev, batchTimings: newBatchTimings }));
  };

  const saveAvailabilitySettings = async () => {
    try {
      setSaving(true);
      
      // Save to database via API
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/partner/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          providerId: user?.id,
          partnerType: availabilityData.partnerType,
          bufferTimeMinutes: availabilityData.bufferTimeMinutes,
          calendarSyncEnabled: availabilityData.calendarSyncEnabled,
          googleCalendarId: availabilityData.googleCalendarId,
          icalUrl: availabilityData.icalUrl,
          workingHours: availabilityData.workingHours,
          batchTimings: availabilityData.batchTimings
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Also save to localStorage as backup
        localStorage.setItem(`availability_${user?.id}`, JSON.stringify(availabilityData));
        toast.success('Availability settings saved successfully');
        
        // Auto-sync calendar if enabled and iCal URL is provided
        if (availabilityData.calendarSyncEnabled && availabilityData.icalUrl) {
          toast.success('Syncing calendar in background...');
          syncCalendar();
        }
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving availability settings:', error);
      toast.error('Failed to save availability settings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const syncCalendar = async () => {
    try {
      setSyncing(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/partner/calendar/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          providerId: user?.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Calendar synced! ${data.syncedEvents} events blocked.`);
      } else {
        throw new Error(data.message || 'Failed to sync calendar');
      }
    } catch (error) {
      console.error('Error syncing calendar:', error);
      toast.error('Failed to sync calendar: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#578f82]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-6rem)] bg-[#faf8f5]">
      <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6">
        {/* Header - Hidden on mobile as it takes too much space, or shown with smaller padding */}
        <div className="px-4 pt-6 sm:px-0 sm:pt-0 mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Availability Management</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">Manage your calendar and availability settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white sm:rounded-xl shadow-sm sm:border border-b border-gray-100 overflow-hidden mb-0 sm:mb-6 rounded-t-3xl sm:rounded-t-xl">
          <div className="border-b border-gray-100">
            <nav className="flex px-0 sm:px-6 overflow-x-auto scrollbar-hide pt-2 sm:pt-0" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 sm:py-4 px-4 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex-1 sm:flex-none justify-center ${
                  activeTab === 'calendar'
                    ? 'border-[#578f82] text-[#578f82]'
                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Calendar</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 sm:py-4 px-4 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex-1 sm:flex-none justify-center ${
                  activeTab === 'settings'
                    ? 'border-[#578f82] text-[#578f82]'
                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Availability Settings</span>
                  <span className="sm:hidden">Settings</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-0 sm:p-6 bg-white sm:bg-transparent min-h-[500px]">
            {activeTab === 'calendar' && (
              <div className="animate-in fade-in duration-300 p-4 sm:p-0">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Your Booking Calendar</h2>
                  <p className="text-sm sm:text-base text-gray-600">View and manage your bookings with real-time updates</p>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <div className="min-w-[600px] sm:min-w-0 bg-white rounded-xl">
                    <PartnerBookingCalendar 
                      view="week"
                      height="auto"
                      showHeader={true}
                      selectable={true}
                      onDateSelect={(selectInfo) => {
                        const duration = (selectInfo.end - selectInfo.start) / (1000 * 60);
                        if (duration >= 30) {
                          toast.success(`Selected ${duration} minutes slot from ${selectInfo.start.toLocaleString()}`);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="animate-in fade-in duration-300 p-4 sm:p-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Availability Settings</h2>
                    <p className="text-sm sm:text-base text-gray-600">Configure your working hours and availability preferences</p>
                  </div>
                  <button
                    onClick={saveAvailabilitySettings}
                    disabled={saving}
                    className="flex items-center justify-center space-x-2 bg-[#578f82] text-white px-6 py-2.5 sm:py-2 rounded-lg hover:bg-[#4a7c70] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto transition-colors"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Partner Type Selection */}
                  <div className="bg-gray-50/50 rounded-xl p-4 sm:p-6 border border-gray-100">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-[#578f82]" />
                      Partner Type
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div
                        onClick={() => handlePartnerTypeChange('solo')}
                        className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                          availabilityData.partnerType === 'solo' 
                            ? 'border-[#578f82] bg-[#578f82]/5 shadow-sm' 
                            : 'border-gray-200 hover:border-[#578f82]/50 hover:bg-gray-50 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-semibold text-base sm:text-lg ${availabilityData.partnerType === 'solo' ? 'text-[#578f82]' : 'text-gray-900'}`}>
                              Solo Partner
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              Individual service provider with flexible working hours
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                            availabilityData.partnerType === 'solo' 
                              ? 'border-[#578f82] bg-[#578f82]' 
                              : 'border-gray-300'
                          }`}>
                            {availabilityData.partnerType === 'solo' && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => handlePartnerTypeChange('academy')}
                        className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                          availabilityData.partnerType === 'academy' 
                            ? 'border-[#578f82] bg-[#578f82]/5 shadow-sm' 
                            : 'border-gray-200 hover:border-[#578f82]/50 hover:bg-gray-50 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-semibold text-base sm:text-lg ${availabilityData.partnerType === 'academy' ? 'text-[#578f82]' : 'text-gray-900'}`}>
                              Big Academy
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              Academy or institution with structured batch timings
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                            availabilityData.partnerType === 'academy' 
                              ? 'border-[#578f82] bg-[#578f82]' 
                              : 'border-gray-300'
                          }`}>
                            {availabilityData.partnerType === 'academy' && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Working Hours for Solo Partners — Google-My-Business style.
                      Each row: day name, Open/Closed toggle, open time – close time, "Add hours" link.
                      The "Add hours" link toggles an optional second time range stored as the day's break window
                      (re-using the existing breakStartTime/breakEndTime fields to avoid a schema change). */}
                  {availabilityData.partnerType === 'solo' && (
                    <div className="bg-white rounded-2xl ring-1 ring-gray-200/70 p-6">
                      <div className="mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">Add business hours</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Let customers know when you are open for business.</p>
                      </div>

                      <div className="mt-4 divide-y divide-gray-100">
                        {availabilityData.workingHours.map((workingHour, index) => {
                          const isOpen = workingHour.isAvailable;
                          const hasExtraRange = !!(workingHour.breakStartTime || workingHour.breakEndTime);
                          return (
                            <div key={index} className="py-4 grid grid-cols-12 items-center gap-3">
                              {/* Day name */}
                              <div className="col-span-12 sm:col-span-3 font-medium text-gray-900">
                                {dayNames[workingHour.dayOfWeek]}
                              </div>

                              {/* Open toggle */}
                              <div className="col-span-4 sm:col-span-2 flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleWorkingHoursChange(index, 'isAvailable', !isOpen)}
                                  className={`relative w-11 h-6 rounded-full transition-colors ${
                                    isOpen ? 'bg-[#1A73E8]' : 'bg-gray-300'
                                  }`}
                                  aria-pressed={isOpen}
                                  aria-label={`${isOpen ? 'Open' : 'Closed'} on ${dayNames[workingHour.dayOfWeek]}`}
                                >
                                  <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                      isOpen ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                <span className={`text-sm font-medium ${isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {isOpen ? 'Open' : 'Closed'}
                                </span>
                              </div>

                              {/* Open – Close times */}
                              <div className="col-span-8 sm:col-span-5 flex items-center gap-3 flex-wrap">
                                {isOpen ? (
                                  <>
                                    <div className="min-w-[120px] flex-1 sm:flex-none">
                                      <CustomTimePicker
                                        value={workingHour.startTime}
                                        onChange={(value) => handleWorkingHoursChange(index, 'startTime', value)}
                                        placeholder="Open"
                                      />
                                    </div>
                                    <span className="text-gray-400">–</span>
                                    <div className="min-w-[120px] flex-1 sm:flex-none">
                                      <CustomTimePicker
                                        value={workingHour.endTime}
                                        onChange={(value) => handleWorkingHoursChange(index, 'endTime', value)}
                                        placeholder="Close"
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-400 italic">Not open this day</span>
                                )}
                              </div>

                              {/* Add hours link */}
                              <div className="col-span-12 sm:col-span-2 text-right">
                                {isOpen && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (hasExtraRange) {
                                        handleWorkingHoursChange(index, 'breakStartTime', '');
                                        handleWorkingHoursChange(index, 'breakEndTime', '');
                                      } else {
                                        handleWorkingHoursChange(index, 'breakStartTime', '14:00');
                                        handleWorkingHoursChange(index, 'breakEndTime', '18:00');
                                      }
                                    }}
                                    className="text-sm font-medium text-[#1A73E8] hover:underline"
                                  >
                                    {hasExtraRange ? 'Remove hours' : 'Add hours'}
                                  </button>
                                )}
                              </div>

                              {/* Second time range (rendered when "Add hours" is enabled) */}
                              {isOpen && hasExtraRange && (
                                <>
                                  <div className="col-span-12 sm:col-span-5 sm:col-start-6 flex items-center gap-3 flex-wrap">
                                    <div className="min-w-[120px] flex-1 sm:flex-none">
                                      <CustomTimePicker
                                        value={workingHour.breakStartTime}
                                        onChange={(value) => handleWorkingHoursChange(index, 'breakStartTime', value)}
                                        placeholder="Open"
                                      />
                                    </div>
                                    <span className="text-gray-400">–</span>
                                    <div className="min-w-[120px] flex-1 sm:flex-none">
                                      <CustomTimePicker
                                        value={workingHour.breakEndTime}
                                        onChange={(value) => handleWorkingHoursChange(index, 'breakEndTime', value)}
                                        placeholder="Close"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Batch Timings for Academy Partners */}
                  {availabilityData.partnerType === 'academy' && (
                    <div className="bg-gray-50/50 rounded-xl p-4 sm:p-6 border border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                          <Users className="w-5 h-5 mr-2 text-[#578f82]" />
                          Batch Timings
                        </h3>
                        <button
                          onClick={addBatchTiming}
                          className="flex items-center justify-center space-x-2 bg-[#578f82] text-white px-4 py-2 rounded-lg hover:bg-[#4a7c70] text-sm font-medium w-full sm:w-auto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Batch</span>
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {availabilityData.batchTimings.map((batch, index) => (
                          <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                            {/* Mobile delete button positioned top right */}
                            <button
                              onClick={() => removeBatchTiming(index)}
                              className="absolute top-3 right-3 sm:hidden p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                              <div className="lg:col-span-3 pr-8 sm:pr-0">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Batch Name</label>
                                <input
                                  type="text"
                                  value={batch.batchName}
                                  onChange={(e) => handleBatchTimingChange(index, 'batchName', e.target.value)}
                                  placeholder="e.g., Morning Batch"
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#578f82] focus:border-transparent text-sm"
                                />
                              </div>
                              
                              <div className="lg:col-span-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Day</label>
                                <select
                                  value={batch.dayOfWeek}
                                  onChange={(e) => handleBatchTimingChange(index, 'dayOfWeek', parseInt(e.target.value))}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#578f82] focus:border-transparent text-sm"
                                >
                                  {dayNames.map((day, dayIndex) => (
                                    <option key={dayIndex} value={dayIndex}>{day}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="lg:col-span-4">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Time</label>
                                <div className="flex items-center space-x-2 relative z-10">
                                  <div className="flex-1 min-w-[110px]">
                                    <CustomTimePicker
                                      value={batch.startTime}
                                      onChange={(value) => handleBatchTimingChange(index, 'startTime', value)}
                                      placeholder="Start time"
                                    />
                                  </div>
                                  <span className="text-gray-500 text-sm">to</span>
                                  <div className="flex-1 min-w-[110px]">
                                    <CustomTimePicker
                                      value={batch.endTime}
                                      onChange={(value) => handleBatchTimingChange(index, 'endTime', value)}
                                      placeholder="End time"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-end space-x-2 lg:col-span-2">
                                <div className="flex-1">
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Capacity</label>
                                  <input
                                    type="number"
                                    value={batch.maxCapacity}
                                    onChange={(e) => handleBatchTimingChange(index, 'maxCapacity', parseInt(e.target.value))}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#578f82] focus:border-[#578f82]"
                                  />
                                </div>
                                <button
                                  onClick={() => removeBatchTiming(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {availabilityData.batchTimings.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No batch timings configured</p>
                            <p className="text-sm">Click "Add Batch" to create your first batch timing</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* General Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-[#578f82]" />
                      General Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Buffer Time (Minutes)
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                          Time between bookings for travel and preparation
                        </p>
                        <select
                          value={availabilityData.bufferTimeMinutes}
                          onChange={(e) => setAvailabilityData(prev => ({ ...prev, bufferTimeMinutes: parseInt(e.target.value) }))}
                          className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-[#578f82] focus:border-[#578f82]"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>60 minutes</option>
                        </select>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={availabilityData.calendarSyncEnabled}
                            onChange={(e) => setAvailabilityData(prev => ({ ...prev, calendarSyncEnabled: e.target.checked }))}
                            className="mt-1 w-4 h-4 text-[#578f82] border-gray-300 rounded focus:ring-[#578f82]"
                          />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Enable calendar sync
                            </label>
                            <p className="text-sm text-gray-500 mt-1">
                              Prevent double-booking with external calendars
                            </p>
                          </div>
                        </div>

                        {availabilityData.calendarSyncEnabled && (
                          <div className="mt-4 space-y-4 pl-7">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Google Calendar ID
                              </label>
                              <input
                                type="text"
                                value={availabilityData.googleCalendarId}
                                onChange={(e) => setAvailabilityData(prev => ({ ...prev, googleCalendarId: e.target.value }))}
                                placeholder="your-calendar@gmail.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#578f82] focus:border-[#578f82]"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                iCal URL
                              </label>
                              <input
                                type="url"
                                value={availabilityData.icalUrl}
                                onChange={(e) => setAvailabilityData(prev => ({ ...prev, icalUrl: e.target.value }))}
                                placeholder="https://calendar.google.com/calendar/ical/..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#578f82] focus:border-[#578f82]"
                              />
                            </div>
                            
                            {availabilityData.icalUrl && (
                              <button
                                onClick={syncCalendar}
                                disabled={syncing}
                                className="flex items-center space-x-2 bg-[#578f82] text-white px-4 py-2 rounded-lg hover:bg-[#4a7c70] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                {syncing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Syncing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Calendar className="w-4 h-4" />
                                    <span>Sync Now</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
