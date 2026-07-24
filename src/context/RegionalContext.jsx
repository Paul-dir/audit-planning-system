import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadData } from '../utils/data';

// Create the context
const RegionalContext = createContext();

// Tax center mapping: region -> list of tax centers
const TAX_CENTER_MAPPING = {
  'Addis Ababa': ['Addis Ababa-tc1', 'Addis Ababa-tc2', 'Addis Ababa-tc3'],
  'Oromia': ['Oromia-tc1', 'Oromia-tc2', 'Oromia-tc3'],
  'Amhara': ['Amhara-tc1', 'Amhara-tc2', 'Amhara-tc3'],
  'Sidama': ['Sidama-tc1', 'Sidama-tc2', 'Sidama-tc3'],
  'Dire Dawa': ['Dire Dawa-tc1', 'Dire Dawa-tc2', 'Dire Dawa-tc3'],
  'Somali': ['Somali-tc1', 'Somali-tc2', 'Somali-tc3']
};

// Provider component
export function RegionalProvider({ children, userRole }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedTaxCenter, setSelectedTaxCenter] = useState(null);
  const [storageUpdateTrigger, setStorageUpdateTrigger] = useState(0);
  
  // Assigned region for regional directors - now DYNAMIC from multiple sources
  let assignedRegion = null;
  
  if (userRole === 'regional') {
    // Try localStorage first (set when plan is sent)
    assignedRegion = localStorage.getItem('user_assigned_region');
    
    // If not found, check for plan-based regional assignments
    if (!assignedRegion) {
      const data = loadData();
      if (data.regionalDirectorAssignments) {
        // Get the first active assignment (in production, would be for logged-in user)
        const assignments = Object.entries(data.regionalDirectorAssignments)
          .filter(([_, a]) => a.status === 'active');
        
        if (assignments.length > 0) {
          assignedRegion = assignments[0][0]; // Get first assigned region
          // Store it in localStorage for quick access
          localStorage.setItem('user_assigned_region', assignedRegion);
        }
      }
    }
  }
  
  // Assigned tax center for tax center managers or cascade audit team
  // DYNAMIC from localStorage - can be set from multiple sources
  const [testTaxCenter, setTestTaxCenter] = useState(null);
  let assignedTaxCenter = null;
  let assignedTaxCenterRegion = null;
  
  if (userRole === 'tax_center' || userRole === 'cascade_audit_team') {
    // PRIORITY ORDER (most current first):
    // 1. Test tax center (for testing specific tax centers)
    // 2. Currently selected tax center (from cascade or other views) - PRIMARY
    // 3. user_assigned_tax_center (legacy, from allocations)
    // 4. First available tax center from localStorage keys (tax_center_0, tax_center_1, etc.)
    assignedTaxCenter = testTaxCenter || 
                       localStorage.getItem('tax_center_selection') ||
                       localStorage.getItem('user_assigned_tax_center') ||
                       localStorage.getItem('test_tax_center') || 
                       localStorage.getItem('tax_center_0') ||
                       null;
    
    // Get the region for this tax center - MUST use matching region key
    // Priority: use tax_center_selection_region if tax_center_selection is set
    const selectedTaxCenter = localStorage.getItem('tax_center_selection');
    if (selectedTaxCenter) {
      // If currently selected tax center exists, use its region
      assignedTaxCenterRegion = localStorage.getItem('tax_center_selection_region') || null;
    } else {
      // Otherwise fall back to allocation region keys
      assignedTaxCenterRegion = localStorage.getItem('user_assigned_tax_center_region') ||
                               localStorage.getItem('tax_center_0_region') ||
                               localStorage.getItem('tax_center_1_region') ||
                               localStorage.getItem('tax_center_2_region') ||
                               null;
    }
    
    console.log('🏢 Tax Center Assignment:', { 
      assignedTaxCenter, 
      assignedTaxCenterRegion, 
      testTaxCenter,
      selectedTaxCenter,
      debugKeys: {
        tax_center_selection: localStorage.getItem('tax_center_selection'),
        tax_center_selection_region: localStorage.getItem('tax_center_selection_region'),
        tax_center_0: localStorage.getItem('tax_center_0'),
        tax_center_0_region: localStorage.getItem('tax_center_0_region')
      }
    });
  }

  // When user role changes, reset selections
  useEffect(() => {
    setSelectedRegion(null);
    setSelectedTaxCenter(null);
  }, [userRole]);

  // When region changes, reset tax center selection
  useEffect(() => {
    setSelectedTaxCenter(null);
  }, [selectedRegion]);

  // Expose a way to trigger context updates when localStorage changes
  const triggerUpdate = () => {
    setStorageUpdateTrigger(prev => prev + 1);
  };

  return (
    <RegionalContext.Provider value={{ 
      selectedRegion, 
      setSelectedRegion,
      selectedTaxCenter,
      setSelectedTaxCenter,
      userRole,
      assignedRegion,
      assignedTaxCenter,
      assignedTaxCenterRegion: assignedTaxCenterRegion,  // Use only tax center's actual region, no fallback
      setTestTaxCenter,
      TAX_CENTER_MAPPING,
      triggerUpdate
    }}>
      {children}
    </RegionalContext.Provider>
  );
}

// Custom hook to use the context
export function useRegional() {
  const context = useContext(RegionalContext);
  if (!context) {
    throw new Error('useRegional must be used within RegionalProvider');
  }
  return context;
}
