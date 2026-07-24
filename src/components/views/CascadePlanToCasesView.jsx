import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { useAuth } from '../../context/AuthContext';

function CascadePlanToCasesView() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  
  // Auto-populate from login context - use org_context which is set during login
  const userRegion = userInfo?.orgContext?.assignedRegion || null;
  const userTaxCenter = userInfo?.orgContext?.assignedTaxCenter || null;
  
  const [selectedRegion, setSelectedRegion] = useState(userRegion);
  const [selectedTaxCenter, setSelectedTaxCenter] = useState(userTaxCenter);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // DEBUG: Log what we got from auth
  useEffect(() => {
    console.log('🔐 CascadePlanToCasesView - User Context:', {
      userInfo: userInfo?.fullName,
      userRole: userInfo?.role,
      assignedRegion: userInfo?.orgContext?.assignedRegion,
      assignedTaxCenter: userInfo?.orgContext?.assignedTaxCenter
    });
  }, [userInfo]);
  
  const [allPlans, setAllPlans] = useState([]);
  const [approvedPlan, setApprovedPlan] = useState(null);
  const [taxCenterAllocation, setTaxCenterAllocation] = useState(null);
  const [allTaxpayers, setAllTaxpayers] = useState([]);
  const [selectedTaxpayers, setSelectedTaxpayers] = useState(new Map());
  const [filteredTaxpayers, setFilteredTaxpayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState('All');
  const [filterAuditType, setFilterAuditType] = useState('All');
  const [cascadedCases, setCascadedCases] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [remainingAllocations, setRemainingAllocations] = useState({});
  const itemsPerPage = 15;

  // Load approved plans - APPROVED plans that have allocations for cascade
  useEffect(() => {
    const data = loadData();
    // Load APPROVED plans that have allocations for cascade
    const plans = data.plans?.filter(p => p.status === 'APPROVED') || [];
    setAllPlans(plans);
    const cases = data.auditCases || [];
    setCascadedCases(cases);
    
    // DEBUG: No auto-select - let user choose from dropdown
    console.log('🔍 CASCADE VIEW - Plans Available:', {
      totalPlans: plans.length,
      userRegion,
      userTaxCenter,
      plans: plans.map(p => ({
        id: p.id,
        status: p.status,
        hasRegionalAllocation: !!p.regionalAllocation,
        hasTaxCenterAllocations: !!p.taxCenterAllocations,
        allocatedRegions: p.taxCenterAllocations ? Object.keys(p.taxCenterAllocations) : [],
        taxCenterAllocationKeys: p.taxCenterAllocations ? Object.entries(p.taxCenterAllocations).map(([region, tcs]) => ({ region, taxCenters: Object.keys(tcs) })) : []
      }))
    });
  }, []);

  // Helper: Map audit type name to key
  const getAuditTypeKey = (auditTypeName) => {
    const mapping = {
      'Desk Audit': 'desk_audit',
      'Field Audit': 'field_audit',
      'Joint Audit': 'joint_audit',
      'Transfer Pricing': 'transfer_pricing',
      'Comprehensive': 'comprehensive',
      'Single Issue': 'issue_audit'
    };
    return mapping[auditTypeName] || '';
  };

  // Helper: Map key to audit type name
  const getAuditTypeName = (key) => {
    const mapping = {
      'desk_audit': 'Desk Audit',
      'field_audit': 'Field Audit',
      'joint_audit': 'Joint Audit',
      'transfer_pricing': 'Transfer Pricing',
      'comprehensive': 'Comprehensive',
      'issue_audit': 'Single Issue'
    };
    return mapping[key] || '';
  };

  // Store tax center selection whenever it changes (for AuditCasesListView to find cases)
  useEffect(() => {
    if (selectedTaxCenter && selectedRegion) {
      localStorage.setItem('tax_center_selection', selectedTaxCenter);
      localStorage.setItem('tax_center_selection_region', selectedRegion);
      console.log('📍 Tax Center Selection Stored in Cascade View:', { selectedTaxCenter, selectedRegion });
    }
  }, [selectedTaxCenter, selectedRegion]);

  // Load allocation when plan/tax center selected
  useEffect(() => {
    if (selectedRegion && selectedTaxCenter && selectedPlan) {
      const plan = allPlans.find(p => p.id === selectedPlan);
      if (plan) {
        setApprovedPlan(plan);
        
        console.log('=== ALLOCATION LOOKUP START ===');
        console.log('Plan structure:', {
          planId: plan.id,
          hasRegionalAllocation: !!plan.regionalAllocation,
          regionalAllocationKeys: plan.regionalAllocation ? Object.keys(plan.regionalAllocation) : [],
          hasTaxCenterAllocations: !!plan.taxCenterAllocations,
          taxCenterAllocationKeys: plan.taxCenterAllocations ? Object.keys(plan.taxCenterAllocations) : [],
          selectedRegion,
          selectedTaxCenter
        });

        // CRITICAL: Look for allocation in regionalAllocation (regional view format)
        // This is the allocation sent from Director to Regional Director
        const regionalAlloc = plan.regionalAllocation?.[selectedRegion];
        
        console.log('Regional allocation lookup:', {
          path: `plan.regionalAllocation['${selectedRegion}']`,
          found: !!regionalAlloc,
          value: regionalAlloc
        });

        // FALLBACK: Look in taxCenterAllocations (old format)
        let taxCenterKey = selectedTaxCenter;
        let allocation = plan.taxCenterAllocations?.[selectedRegion]?.[selectedTaxCenter];
        
        // If not found, try the format "Region-tc#"
        if (!allocation) {
          const parts = selectedTaxCenter.split(' ');
          const tcNum = parts[parts.length - 1];
          taxCenterKey = `${selectedRegion}-tc${tcNum}`;
          allocation = plan.taxCenterAllocations?.[selectedRegion]?.[taxCenterKey];
        }

        console.log('Tax center allocation lookup:', {
          path: `plan.taxCenterAllocations['${selectedRegion}']['${taxCenterKey}']`,
          found: !!allocation,
          value: allocation
        });

        console.log('=== ALLOCATION LOOKUP END ===');
        
        // IMPORTANT: Use whichever one is found - prefer taxCenterAllocations if available
        // but accept regionalAllocation as fallback
        const finalAllocation = allocation || regionalAlloc;
        setTaxCenterAllocation(finalAllocation);
        
        // Debug: Log allocation info
        console.log('📋 Final Allocation loaded:', {
          plan: selectedPlan,
          region: selectedRegion,
          taxCenter: selectedTaxCenter,
          allocationType: allocation ? 'taxCenterAllocations' : (regionalAlloc ? 'regionalAllocation' : 'NONE'),
          allocation: finalAllocation
        });
        
        // Calculate remaining allocations - per THIS specific tax center
        const remaining = {};
        const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
        auditTypes.forEach(type => {
          const total = finalAllocation?.[type] || 0;
          // Count cascaded cases ONLY for this tax center
          const cascaded = cascadedCases.filter(c => 
            c.taxCenter === selectedTaxCenter && 
            c.region === selectedRegion && 
            c.planId === selectedPlan &&
            c.auditType === getAuditTypeName(type)
          ).length;
          remaining[type] = Math.max(0, total - cascaded);
        });
        setRemainingAllocations(remaining);
        
        generateTaxpayerList();
        setCurrentPage(1);
      }
    }
  }, [selectedRegion, selectedTaxCenter, selectedPlan, allPlans, cascadedCases]);

  // Apply filters
  useEffect(() => {
    let filtered = allTaxpayers;
    if (searchTerm) {
      filtered = filtered.filter(tp => 
        tp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tp.tin.includes(searchTerm)
      );
    }
    if (filterRiskLevel !== 'All') {
      filtered = filtered.filter(tp => tp.riskLevel === filterRiskLevel);
    }
    if (filterAuditType !== 'All') {
      filtered = filtered.filter(tp => tp.recommendedAuditType === filterAuditType);
    }
    setFilteredTaxpayers(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterRiskLevel, filterAuditType, allTaxpayers]);

  // Generate taxpayers
  const generateTaxpayerList = () => {
    const taxpayers = [];
    const riskLevels = ['Critical', 'High', 'Medium', 'Low'];
    const industries = ['Construction', 'Manufacturing', 'Wholesale', 'Services', 'Import/Export', 'Agriculture'];
    const businessNames = ['Trading PLC', 'Manufacturing Ltd', 'Wholesale Co', 'Services Inc', 'Import House', 'Agriculture Ltd'];
    const auditTypeRecommendations = {
      'Critical': 'Comprehensive',
      'High': 'Field Audit',
      'Medium': 'Desk Audit',
      'Low': 'Desk Audit'
    };

    for (let i = 1; i <= 410; i++) {
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const riskScore = riskLevel === 'Critical' ? Math.round(80 + Math.random() * 20) : 
                       riskLevel === 'High' ? Math.round(65 + Math.random() * 15) :
                       riskLevel === 'Medium' ? Math.round(45 + Math.random() * 20) :
                       Math.round(20 + Math.random() * 25);
      const recommendedType = auditTypeRecommendations[riskLevel];
      const estimatedHours = riskLevel === 'Critical' ? Math.round(180 + Math.random() * 60) :
                            riskLevel === 'High' ? Math.round(120 + Math.random() * 60) :
                            riskLevel === 'Medium' ? Math.round(80 + Math.random() * 40) :
                            Math.round(40 + Math.random() * 40);

      taxpayers.push({
        id: `TP-${String(i).padStart(4, '0')}`,
        tin: `ET${String(1000000 + i).padStart(6, '0')}`,
        name: `${['Solomon', 'Selam', 'Abebe', 'Medhin', 'Tigist', 'Dawit', 'Almaz'][Math.floor(Math.random() * 7)]} ${businessNames[Math.floor(Math.random() * businessNames.length)]}`,
        industry: industries[Math.floor(Math.random() * industries.length)],
        riskScore,
        riskLevel,
        revenueAtRisk: Math.round(500000 + Math.random() * 4500000),
        recommendedAuditType: recommendedType,
        estimatedHours
      });
    }
    setAllTaxpayers(taxpayers);
    setFilteredTaxpayers(taxpayers);
  };

  // Toggle selection with validation
  const toggleTaxpayerSelection = (taxpayerId) => {
    const taxpayer = allTaxpayers.find(tp => tp.id === taxpayerId);
    if (!taxpayer) return;
    
    const auditType = taxpayer.recommendedAuditType;
    const key = `${taxpayerId}-${auditType}`;
    const auditTypeKey = getAuditTypeKey(auditType);
    const remainingSlots = remainingAllocations[auditTypeKey] || 0;
    
    const newSelected = new Map(selectedTaxpayers);
    
    // If trying to add and no slots remaining
    if (!newSelected.has(key)) {
      if (remainingSlots <= 0) {
        alert(`❌ No available slots for ${auditType}\n\nAllocated: ${taxCenterAllocation?.[auditTypeKey] || 0}\nAlready cascaded: ${(taxCenterAllocation?.[auditTypeKey] || 0) - remainingSlots}\nRemaining: 0`);
        return;
      }
      // Add the selection
      newSelected.set(key, { taxpayerId, auditType });
    } else {
      // Remove the selection
      newSelected.delete(key);
    }
    setSelectedTaxpayers(newSelected);
  };

  // Auto-cascade - fill remaining slots by audit type
  const handleAutoCascade = () => {
    const newSelected = new Map(selectedTaxpayers);
    let casesAdded = 0;

    const auditTypeMapping = {
      'Comprehensive': 'comprehensive',
      'Field Audit': 'field_audit',
      'Joint Audit': 'joint_audit',
      'Desk Audit': 'desk_audit',
      'Transfer Pricing': 'transfer_pricing',
      'Single Issue': 'issue_audit'
    };

    // For each audit type, fill up to remaining slots
    Object.entries(auditTypeMapping).forEach(([typeName, typeKey]) => {
      let currentRemaining = remainingAllocations[typeKey] || 0;
      
      // Count already selected for this type
      let alreadySelectedForType = 0;
      newSelected.forEach(selection => {
        if (selection.auditType === typeName) {
          alreadySelectedForType++;
        }
      });
      
      // Calculate slots still available for this type
      const slotsAvailable = currentRemaining - alreadySelectedForType;
      let filled = 0;

      if (slotsAvailable > 0) {
        filteredTaxpayers.forEach(taxpayer => {
          if (filled >= slotsAvailable) return;
          if (taxpayer.recommendedAuditType === typeName) {
            const key = `${taxpayer.id}-${typeName}`;
            if (!newSelected.has(key)) {
              newSelected.set(key, { taxpayerId: taxpayer.id, auditType: typeName });
              filled++;
              casesAdded++;
            }
          }
        });
      }
    });

    setSelectedTaxpayers(newSelected);
    alert(`✓ Auto-cascaded ${casesAdded} taxpayers\n\nTotal selected: ${newSelected.size} cases`);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedTaxpayers(new Map());
  };

  // Create cases
  const handleCreateCases = () => {
    if (selectedTaxpayers.size === 0) {
      alert('Please select taxpayers');
      return;
    }

    // Validate allocation limits per audit type
    const byAuditType = {};
    selectedTaxpayers.forEach(selection => {
      if (!byAuditType[selection.auditType]) {
        byAuditType[selection.auditType] = 0;
      }
      byAuditType[selection.auditType]++;
    });

    // Check each audit type against its allocation
    for (const [auditType, count] of Object.entries(byAuditType)) {
      const auditTypeKey = getAuditTypeKey(auditType);
      const allocated = taxCenterAllocation?.[auditTypeKey] || 0;
      if (count > allocated) {
        alert(`❌ ${auditType} exceeds allocation\n\nSelected: ${count}\nAllocated: ${allocated}`);
        return;
      }
    }

    const data = loadData();
    const newCases = Array.from(selectedTaxpayers.values()).map((selection, idx) => {
      const taxpayer = allTaxpayers.find(tp => tp.id === selection.taxpayerId);
      return {
        id: `CASE-${selectedRegion}-${selectedTaxCenter}-${Date.now()}-${idx}`,
        planId: selectedPlan,
        taxCenter: selectedTaxCenter,
        region: selectedRegion,
        taxpayerId: selection.taxpayerId,
        taxpayerName: taxpayer?.name,
        tin: taxpayer?.tin,
        auditType: selection.auditType,
        riskLevel: taxpayer?.riskLevel,
        riskScore: taxpayer?.riskScore,
        revenueAtRisk: taxpayer?.revenueAtRisk,
        estimatedHours: taxpayer?.estimatedHours,
        status: 'ASSIGNED',
        createdDate: new Date().toISOString(),
        assignedTeam: null,
        leadAuditor: null
      };
    });

    data.auditCases = [...(data.auditCases || []), ...newCases];
    saveData(data);
    setCascadedCases([...cascadedCases, ...newCases]);
    setSelectedTaxpayers(new Map());
    alert(`✓ Created ${newCases.length} audit cases!\n✓ Automatically stored`);
  };

  // Get allocation summary
  const getAllocationSummary = () => {
    if (!taxCenterAllocation) return {};
    const summary = {};
    const types = {
      'desk_audit': 'Desk Audit',
      'field_audit': 'Field Audit',
      'joint_audit': 'Joint Audit',
      'transfer_pricing': 'Transfer Pricing',
      'comprehensive': 'Comprehensive',
      'issue_audit': 'Single Issue'
    };
    
    Object.entries(types).forEach(([key, name]) => {
      summary[name] = {
        total: taxCenterAllocation[key] || 0,
        remaining: remainingAllocations[key] || 0,
        cascaded: (taxCenterAllocation[key] || 0) - (remainingAllocations[key] || 0)
      };
    });
    return summary;
  };

  // Get selection summary
  const getSelectionSummary = () => {
    const selected = Array.from(selectedTaxpayers.values());
    let totalRevenue = 0;
    let totalHours = 0;
    
    selected.forEach(selection => {
      const taxpayer = allTaxpayers.find(tp => tp.id === selection.taxpayerId);
      if (taxpayer) {
        totalRevenue += taxpayer.revenueAtRisk;
        totalHours += taxpayer.estimatedHours;
      }
    });
    
    return { count: selected.length, totalRevenue, totalHours };
  };

  const paginatedTaxpayers = filteredTaxpayers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredTaxpayers.length / itemsPerPage);
  const allocationSummary = getAllocationSummary();
  const selectionSummary = getSelectionSummary();
  const totalAllocated = Object.values(remainingAllocations).reduce((a, b) => a + b, 0);
  
  // Selection screen
  if (!selectedPlan || allPlans.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '24px' }}><i className="fas fa-tasks"></i> Cascade Plan to Audit Cases</h2>
        
        {/* Display auto-assigned region and tax center */}
        {selectedRegion && selectedTaxCenter && (
          <div style={{ background: '#1c2128', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #30363d' }}>
            <p style={{ fontSize: '12px', color: '#8b949e', margin: '0 0 12px 0', fontWeight: 'bold' }}>📌 YOUR ASSIGNED LOCATION</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', border: '1px solid #30363d' }}>
                <p style={{ fontSize: '10px', color: '#8b949e', margin: 0, marginBottom: '4px' }}>REGION</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{selectedRegion}</p>
              </div>
              <div style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', border: '1px solid #30363d' }}>
                <p style={{ fontSize: '10px', color: '#8b949e', margin: 0, marginBottom: '4px' }}>TAX CENTER</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#f5c451', margin: 0 }}>{selectedTaxCenter}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Plan selector - SHOW ALL PLANS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ fontSize: '12px', color: '#8b949e', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>SELECT APPROVED PLAN TO CASCADE</label>
            <select value={selectedPlan || ''} onChange={(e) => setSelectedPlan(e.target.value || null)}
              style={{ width: '100%', padding: '10px 12px', border: '2px solid #4a8fd9', borderRadius: '8px', background: '#1c2128', color: '#f0f6fc', fontSize: '13px', fontWeight: '500' }}>
              <option value="">-- Choose a Plan to Start --</option>
              {allPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.id} (FY {plan.fiscalYear}) - {plan.name || 'Annual Plan'}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '11px', color: '#8b949e', marginTop: '6px', margin: '6px 0 0 0' }}>
              {allPlans.length} approved plan(s) available
            </p>
          </div>
        </div>

        {allPlans.length === 0 && (
          <div style={{ background: '#2a1a1a', border: '1px solid #ff7b7b', borderRadius: '6px', padding: '16px' }}>
            <p style={{ fontSize: '13px', color: '#ff7b7b', margin: 0, fontWeight: 'bold' }}>
              ⚠️ No APPROVED plans available
            </p>
            <p style={{ fontSize: '12px', color: '#8b949e', margin: '6px 0 0 0' }}>
              Ask your Regional Director to approve plans first
            </p>
          </div>
        )}
      </div>
    );
  }

  // Main cascade view
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}><i className="fas fa-tasks"></i> Cascade to Audit Cases</h2>

      {/* Plan Switcher - PROMINENT at top */}
      {allPlans.length > 0 && (
        <div style={{
          background: '#0f1419', color: '#f0f6fc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '2px solid #4a8fd9',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <label style={{ fontSize: '13px', fontWeight: '700', color: '#4a8fd9', whiteSpace: 'nowrap' }}>
            <i className="fas fa-file-alt"></i> CURRENT PLAN:
          </label>
          <select value={selectedPlan || ''} onChange={(e) => setSelectedPlan(e.target.value || null)}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: '2px solid #4a8fd9',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              background: '#1c2128',
              color: '#f0f6fc',
              minWidth: '220px'
            }}>
            <option value="">-- Select a Plan --</option>
            {allPlans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.id} (FY {plan.fiscalYear})
              </option>
            ))}
          </select>
          <div style={{ fontSize: '12px', color: '#a0aec0', marginLeft: 'auto' }}>
            {allPlans.length} total plan(s) available
          </div>
        </div>
      )}

      {/* Selection & Plan Overview */}
      <div style={{ background: '#1c2128', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #30363d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#f0f6fc', margin: 0 }}>📋 PLAN ALLOCATION FOR THIS TAX CENTER</h3>
          <button onClick={() => { setSelectedPlan(null); setSelectedRegion(null); setSelectedTaxCenter(null); }}
            style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid #30363d', borderRadius: '4px', background: '#0f1419', color: '#8b949e', cursor: 'pointer' }}>← Back to Select</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: '#0f1419', padding: '8px', borderRadius: '6px', border: '1px solid #30363d' }}>
            <p style={{ fontSize: '10px', color: '#8b949e', margin: 0, marginBottom: '4px' }}>PLAN ID</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>{selectedPlan}</p>
          </div>
          <div style={{ background: '#0f1419', padding: '8px', borderRadius: '6px', border: '1px solid #30363d' }}>
            <p style={{ fontSize: '10px', color: '#8b949e', margin: 0, marginBottom: '4px' }}>REGION</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{selectedRegion}</p>
          </div>
          <div style={{ background: '#0f1419', padding: '8px', borderRadius: '6px', border: '1px solid #30363d' }}>
            <p style={{ fontSize: '10px', color: '#8b949e', margin: 0, marginBottom: '4px' }}>TAX CENTER</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#f5c451', margin: 0 }}>{selectedTaxCenter}</p>
          </div>
          <div style={{ background: '#0f1419', padding: '8px', borderRadius: '6px', border: '1px solid #30363d' }}>
            <p style={{ fontSize: '10px', color: '#8b949e', margin: 0, marginBottom: '4px' }}>TOTAL ALLOCATED</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: totalAllocated === 0 ? '#ff7b7b' : '#5ee89c', margin: 0 }}>{totalAllocated} Cases</p>
          </div>
        </div>

        {/* Warning if no allocation */}
        {totalAllocated === 0 && taxCenterAllocation === undefined && (
          <div style={{ background: '#2a1a1a', border: '1px solid #ff7b7b', borderRadius: '6px', padding: '12px', marginTop: '12px' }}>
            <p style={{ fontSize: '12px', color: '#ff7b7b', margin: 0, fontWeight: 'bold' }}>
              ⚠️ NO ALLOCATION FOUND
            </p>
            <p style={{ fontSize: '11px', color: '#c9d1d9', margin: '4px 0 0 0' }}>
              This plan does not have allocations sent to {selectedTaxCenter} in {selectedRegion}.
            </p>
            <p style={{ fontSize: '11px', color: '#8b949e', margin: '4px 0 0 0' }}>
              Please ask the Director to send allocations for this tax center before cascading.
            </p>
          </div>
        )}
      </div>

      {/* Allocations - THIS TAX CENTER ONLY */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#f0f6fc' }}>✅ THIS TAX CENTER's ALLOCATION BREAKDOWN</h3>
        <p style={{ fontSize: '12px', color: '#8b949e', marginBottom: '12px', margin: '0 0 12px 0' }}>
          Total cases allocated to {selectedTaxCenter}: <strong style={{ color: totalAllocated === 0 ? '#ff7b7b' : '#5ee89c' }}>{totalAllocated}</strong>
        </p>
        
        {totalAllocated === 0 ? (
          <div style={{ background: '#1c2128', padding: '24px', borderRadius: '8px', border: '1px solid #30363d', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#8b949e', margin: 0 }}>No allocation data available for this tax center.</p>
            <p style={{ fontSize: '12px', color: '#ff7b7b', margin: '8px 0 0 0', fontWeight: 'bold' }}>
              ⚠️ Cascade cannot proceed without allocation
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {Object.entries(allocationSummary).map(([type, data]) => (
              <div key={type} style={{ 
                background: '#1c2128', 
                padding: '12px', 
                borderRadius: '8px', 
                border: data.remaining === 0 ? '2px solid #ff7b7b' : '1px solid #30363d',
                boxShadow: data.remaining === 0 ? '0 0 8px rgba(255, 123, 123, 0.2)' : 'none'
              }}>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#f0f6fc', margin: 0, marginBottom: '4px' }}>{type}</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#5ee89c', margin: 0, marginBottom: '2px' }}>
                  {data.cascaded} / {data.total}
                </p>
                <p style={{ fontSize: '10px', color: data.remaining === 0 ? '#ff7b7b' : '#8b949e', margin: 0 }}>
                  {data.remaining === 0 ? '🔴 FULL' : `Remaining: ${data.remaining}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: '#f0f6fc' }}>🔍 SELECT TAXPAYERS TO CASCADE</h3>
        <p style={{ fontSize: '12px', color: '#8b949e', marginBottom: '12px', margin: '0 0 12px 0' }}>
          Filter taxpayers by risk, audit type, or name. Allocation limits are enforced automatically.
        </p>
      </div>

      {totalAllocated === 0 ? (
        <div style={{ background: '#2a1a1a', border: '2px solid #ff7b7b', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#ff7b7b', margin: 0, fontWeight: 'bold' }}>❌ CANNOT PROCEED</p>
          <p style={{ fontSize: '12px', color: '#c9d1d9', margin: '8px 0 0 0' }}>
            This plan has no allocation for {selectedTaxCenter} in {selectedRegion}.
          </p>
          <p style={{ fontSize: '11px', color: '#8b949e', margin: '8px 0 0 0' }}>
            The Director/Regional Director must send allocations to this tax center first.
          </p>
          <button onClick={() => { setSelectedPlan(null); setSelectedRegion(null); setSelectedTaxCenter(null); }}
            style={{ marginTop: '16px', padding: '8px 16px', border: '1px solid #ff7b7b', borderRadius: '6px', background: 'transparent', color: '#ff7b7b', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
            ← Back to Selection
          </button>
        </div>
      ) : (
        <>
          <div style={{ background: '#1c2128', padding: '12px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search TIN or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '150px', padding: '6px 10px', border: '1px solid #30363d', borderRadius: '6px', background: '#0f1419', color: '#f0f6fc', fontSize: '12px' }} />
        
        <select value={filterRiskLevel} onChange={(e) => setFilterRiskLevel(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #30363d', borderRadius: '6px', background: '#0f1419', color: '#f0f6fc', fontSize: '12px' }}>
          <option value="All">All Risk</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select value={filterAuditType} onChange={(e) => setFilterAuditType(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #30363d', borderRadius: '6px', background: '#0f1419', color: '#f0f6fc', fontSize: '12px' }}>
          <option value="All">All Types</option>
          <option value="Comprehensive">Comprehensive</option>
          <option value="Field Audit">Field Audit</option>
          <option value="Desk Audit">Desk Audit</option>
          <option value="Joint Audit">Joint Audit</option>
          <option value="Transfer Pricing">TP</option>
        </select>

        <button onClick={() => { setSearchTerm(''); setFilterRiskLevel('All'); setFilterAuditType('All'); }}
          style={{ padding: '6px 10px', border: '1px solid #30363d', borderRadius: '6px', background: '#0f1419', color: '#8b949e', fontSize: '12px', cursor: 'pointer' }}>Clear</button>
      </div>

      {/* Table */}
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>☑</th>
              <th>TIN</th>
              <th>TAXPAYER</th>
              <th>RISK</th>
              <th>AUDIT TYPE</th>
              <th>REVENUE</th>
              <th>HOURS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTaxpayers.map(taxpayer => {
              const isSelected = selectedTaxpayers.has(`${taxpayer.id}-${taxpayer.recommendedAuditType}`);
              const auditTypeKey = getAuditTypeKey(taxpayer.recommendedAuditType);
              const slotsAvailable = remainingAllocations[auditTypeKey] || 0;
              const canSelect = slotsAvailable > 0 || isSelected;
              
              return (
                <tr key={taxpayer.id} style={{ opacity: !canSelect ? 0.4 : 1 }}>
                  <td><input type="checkbox" checked={isSelected} onChange={() => canSelect && toggleTaxpayerSelection(taxpayer.id)} disabled={!canSelect} /></td>
                  <td>{taxpayer.tin}</td>
                  <td>{taxpayer.name}</td>
                  <td><Badge status={taxpayer.riskLevel} className="feedback" /></td>
                  <td style={{ color: slotsAvailable > 0 ? '#4caf50' : '#ff7b7b' }}>
                    {taxpayer.recommendedAuditType} {slotsAvailable <= 0 && !isSelected ? '❌' : ''}
                  </td>
                  <td>{(taxpayer.revenueAtRisk / 1000000).toFixed(1)}M</td>
                  <td>{taxpayer.estimatedHours}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#1c2128', padding: '12px', borderRadius: '8px', border: '1px solid #30363d' }}>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#f0f6fc', margin: 0, marginBottom: '4px' }}>YOUR SELECTION</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: selectionSummary.count > totalAllocated ? '#ff7b7b' : '#5ee89c', margin: 0 }}>
            {selectionSummary.count} / {totalAllocated}
          </p>
          <p style={{ fontSize: '11px', color: '#8b949e', margin: '4px 0 0 0' }}>
            {selectionSummary.count === 0 ? 'No cases selected' : 
             selectionSummary.count === totalAllocated ? '✅ FULL ALLOCATION' :
             selectionSummary.count > totalAllocated ? '❌ EXCEEDS LIMIT' :
             `${totalAllocated - selectionSummary.count} slots remaining`}
          </p>
        </div>
        <div style={{ background: '#1c2128', padding: '12px', borderRadius: '8px', border: '1px solid #30363d' }}>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#f0f6fc', margin: 0, marginBottom: '4px' }}>IMPACT</p>
          <p style={{ fontSize: '12px', color: '#8b949e', margin: '4px 0' }}>Revenue: <strong>{(selectionSummary.totalRevenue / 1000000).toFixed(1)}M</strong></p>
          <p style={{ fontSize: '12px', color: '#8b949e', margin: '4px 0 0 0' }}>Audit Hours: <strong>{selectionSummary.totalHours.toLocaleString()}</strong></p>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setSelectedPlan(null); setSelectedRegion(null); setSelectedTaxCenter(null); }}
            style={{ padding: '8px 12px', border: '1px solid #30363d', borderRadius: '6px', background: '#0f1419', color: '#8b949e', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Back</button>
          
          <button onClick={handleAutoCascade}
            style={{ padding: '8px 12px', border: '1px solid #3b82f6', borderRadius: '6px', background: '#0f1419', color: '#3b82f6', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Auto Cascade</button>

          <button onClick={handleClearSelection} disabled={selectedTaxpayers.size === 0}
            style={{ padding: '8px 12px', border: '1px solid #30363d', borderRadius: '6px', background: '#0f1419', color: '#8b949e', fontSize: '12px', fontWeight: '600', cursor: 'pointer', opacity: selectedTaxpayers.size === 0 ? 0.5 : 1 }}>Clear</button>
        </div>

        <button onClick={handleCreateCases} disabled={selectedTaxpayers.size === 0 || selectionSummary.count > totalAllocated}
          style={{ padding: '8px 12px', border: 'none', borderRadius: '6px', background: (selectedTaxpayers.size === 0 || selectionSummary.count > totalAllocated) ? '#4f5763' : '#3b82f6', color: '#ffffff', fontSize: '12px', fontWeight: '600', cursor: (selectedTaxpayers.size === 0 || selectionSummary.count > totalAllocated) ? 'not-allowed' : 'pointer' }}>
          Create {selectionSummary.count} / {totalAllocated} Cases
        </button>
      </div>
        </>
      )}
    </div>
  );
}
export default CascadePlanToCasesView;
