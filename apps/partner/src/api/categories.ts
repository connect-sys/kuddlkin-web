const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ServiceField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox' | 'multiselect';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  fields?: ServiceField[];
  childSubcategories?: ServiceSubcategory[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  module: string;
  icon: string;
  subcategories: ServiceSubcategory[];
}

// Get all categories with subcategories and fields
export const getCategories = async (): Promise<ServiceCategory[]> => {
  try {
    console.log('🌐 [Categories API] Fetching from:', `${API_BASE_URL}/api/categories`);
    
    // Public endpoint - no auth required, no custom headers to avoid CORS preflight
    // Added timestamp to bypass CDN caching
    const response = await fetch(`${API_BASE_URL}/api/categories?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 [Categories API] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 [Categories API] Response data:', data);
    
    if (data.success) {
      console.log('✅ [Categories API] Categories data:', data.data);
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch categories');
    }
  } catch (error) {
    console.error('❌ [Categories API] Error fetching categories:', error);
    throw error;
  }
};

// Get categories by module (CARE, BLOOM, EVENTS, DISCOVER)
export const getCategoriesByModule = async (module: string): Promise<ServiceCategory[]> => {
  try {
    const allCategories = await getCategories();
    const filteredCategories = allCategories.filter(category => 
      category.module.toUpperCase() === module.toUpperCase()
    );
    console.log(`✅ [Categories API] Filtered ${filteredCategories.length} categories for module ${module}`);
    return filteredCategories;
  } catch (error) {
    console.error(`Error filtering categories for module ${module}:`, error);
    throw error;
  }
};

// Get subcategories for a specific category
export const getSubcategories = async (categoryId: string): Promise<ServiceSubcategory[]> => {
  try {
    const allCategories = await getCategories();
    const category = allCategories.find(cat => cat.id === categoryId);
    
    if (category) {
      console.log(`✅ [Categories API] Found ${category.subcategories.length} subcategories for category ${categoryId}`);
      return category.subcategories;
    } else {
      console.log(`⚠️ [Categories API] No category found with ID ${categoryId}`);
      return [];
    }
  } catch (error) {
    console.error('Error getting subcategories:', error);
    throw error;
  }
};

// Get service fields for a specific subcategory
export const getServiceFields = async (subcategoryId: string): Promise<ServiceField[]> => {
  try {
    const allCategories = await getCategories();
    
    for (const category of allCategories) {
      const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
      if (subcategory) {
        console.log(`✅ [Categories API] Found ${subcategory.fields?.length || 0} fields for subcategory ${subcategoryId}`);
        return subcategory.fields || [];
      }
    }
    
    console.log(`⚠️ [Categories API] No subcategory found with ID ${subcategoryId}`);
    return [];
  } catch (error) {
    console.error('Error getting service fields:', error);
    throw error;
  }
};

// Helper functions for backward compatibility
export const getServiceCategoryById = (categories: ServiceCategory[], id: string): ServiceCategory | undefined => {
  return categories.find(category => category.id === id);
};

export const getSubcategoryById = (categories: ServiceCategory[], categoryId: string, subcategoryId: string): ServiceSubcategory | undefined => {
  const category = getServiceCategoryById(categories, categoryId);
  return category?.subcategories.find(sub => sub.id === subcategoryId);
};

export const getAllSubcategories = (categories: ServiceCategory[]): ServiceSubcategory[] => {
  return categories.flatMap(category => category.subcategories);
};
