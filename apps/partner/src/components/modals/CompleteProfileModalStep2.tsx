import React from 'react';
import { ServiceCategory } from '../../api/categories';
import { ServiceType, CATEGORY_META, ServiceTypeCategory } from '../../api/serviceTypes';
import ServiceTypePicker from '../ServiceTypePicker';

interface Step2FormData {
  primaryCategories: string[];
  specificServices: string[];
  serviceTypes: ServiceType[];
  ageGroups: string[];
  experience: string;
  description: string;
  languages: string[];
}

interface Step2Props {
  formData: Step2FormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: ServiceCategory[];
  categoriesLoading: boolean;
  // Pincode search props (kept for parity with existing modal contract)
  pincodeSearch: string;
  setPincodeSearch: (value: string) => void;
  availablePincodes: any[];
  pincodeLoading: boolean;
  showPincodeDropdown: boolean;
  setShowPincodeDropdown: (value: boolean) => void;
  searchPincodes: (query: string) => void;
  handlePincodeSelect: (pincode: any) => void;
  removePincode: (pincode: string) => void;
}

const ABCD_ORDER: ServiceTypeCategory[] = ['adventure', 'bloom', 'care', 'discover'];

const ageGroups = [
  'Newborn (0-3 months)',
  'Infant (3-12 months)',
  'Toddler (1-3 years)',
  'Preschooler (3-5 years)',
  'School Age (5-12 years)',
  'Teen (12+ years)',
  'All Ages'
];

const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada'];

const CompleteProfileModalStep2: React.FC<Step2Props> = ({
  formData,
  setFormData,
  categoriesLoading
}) => {
  const setServiceTypes = (next: ServiceType[]) => {
    const derivedCategories = Array.from(
      new Set(next.map((st) => CATEGORY_META[st.category].label))
    );
    const derivedServices = next.map((st) => st.label);

    setFormData((prev: any) => ({
      ...prev,
      serviceTypes: next,
      primaryCategories: derivedCategories,
      specificServices: derivedServices
    }));
  };

  const autoTaggedCategorySet = new Set(formData.serviceTypes.map((st) => st.category));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h3>

      {categoriesLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82]" />
          <span className="ml-2 text-gray-600">Loading…</span>
        </div>
      )}

      {!categoriesLoading && (
        <>
          <ServiceTypePicker
            selected={formData.serviceTypes}
            onChange={setServiceTypes}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              You've been added to
            </label>
            <div className="flex flex-wrap gap-2">
              {ABCD_ORDER.map((key) => {
                const meta = CATEGORY_META[key];
                const active = autoTaggedCategorySet.has(key);
                return (
                  <span
                    key={key}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                    style={
                      active
                        ? { backgroundColor: meta.bg, color: meta.color, borderColor: meta.color }
                        : { backgroundColor: '#F3F4F6', color: '#9CA3AF', borderColor: '#E5E7EB' }
                    }
                  >
                    Küddl {meta.label}
                  </span>
                );
              })}
            </div>
            {formData.serviceTypes.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Pick one or more service types above — your Küddl categories are tagged automatically.
              </p>
            )}
          </div>

          {/* Age Groups */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age Groups You Serve *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ageGroups.map((ageGroup) => (
                <label key={ageGroup} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.ageGroups.includes(ageGroup)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev: any) => ({ ...prev, ageGroups: [...prev.ageGroups, ageGroup] }));
                      } else {
                        setFormData((prev: any) => ({ ...prev, ageGroups: prev.ageGroups.filter((ag: string) => ag !== ageGroup) }));
                      }
                    }}
                    className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
                  />
                  <span className="text-sm text-gray-700">{ageGroup}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
            <select
              value={formData.experience}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, experience: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
            >
              <option value="">Select experience</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {languages.map((language) => (
                <label key={language} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev: any) => ({ ...prev, languages: [...prev.languages, language] }));
                      } else {
                        setFormData((prev: any) => ({ ...prev, languages: prev.languages.filter((l: string) => l !== language) }));
                      }
                    }}
                    className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
                  />
                  <span className="text-sm text-gray-700">{language}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Service Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
              placeholder="Describe your services and expertise..."
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CompleteProfileModalStep2;
