/**
 * DEPRECATED: Backward Compatibility Shim
 * ⚠️  This file is deprecated. New code should import from src/services/dataService.jsx
 * 
 * This file re-exports functions from the new React-based data service
 * to maintain backward compatibility with existing imports.
 * 
 * Migration Guide:
 * OLD: import { loadData, saveData } from '../../utils/data';
 * NEW: import { loadData, saveData, useData } from '../../services/dataService';
 *      (Use useData hook within React components)
 * 
 * Why the change?
 * - Centralized React Context for better state management
 * - Easier to debug with React DevTools
 * - Automatic re-renders when data changes
 * - Better integration with React component lifecycle
 */

// Re-export all functions from new location
// These are pure functions (no React dependency) for backward compatibility
export { 
  loadDataDirect as loadData,
  saveDataDirect as saveData,
  getDefaultDataDirect as getDefaultData,
  STORAGE_KEY,
  DATA_VERSION,
  resetAllData,
  clearAllPlans,
  // NEW React exports
  DataProvider,
  useData
} from '../services/dataService';

console.warn('⚠️  WARNING: You are importing from src/utils/data.js (deprecated). Please update to src/services/dataService.jsx');
