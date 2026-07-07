/**
 * Service Types API - Frontend Config Version
 * Re-exports from serviceTypeConfig.ts for backward compatibility
 */

export type {
  Category as ServiceTypeCategory,
  FieldType as BlockType,
  FieldOption as BlockOption,
  ConditionalRule as BlockConditional,
  CategoryBlock,
  ServiceTypeConfig,
  CategoryMeta
} from '../config/serviceTypeConfig';

export {
  CATEGORY_META,
  SERVICE_TYPE_CONFIGS,
  listServiceTypes,
  getServiceTypeConfig,
  getServiceTypesByCategory
} from '../config/serviceTypeConfig';

// Simple service type interface for list views
export interface ServiceType {
  id: string;
  label: string;
  category: 'adventure' | 'bloom' | 'care' | 'discover';
}

// Search service types by query string
export function searchServiceTypes(query: string): ServiceType[] {
  const { SERVICE_TYPE_CONFIGS } = require('../config/serviceTypeConfig');
  const q = query.toLowerCase().trim();
  
  return Object.values(SERVICE_TYPE_CONFIGS)
    .filter((config: any) => 
      config.label.toLowerCase().includes(q) ||
      config.id.toLowerCase().includes(q)
    )
    .map((config: any) => ({
      id: config.id,
      label: config.label,
      category: config.category
    }));
}
