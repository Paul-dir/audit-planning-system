export const STORAGE_KEY = 'audit_planning_system_v2';
export const DATA_VERSION = '2.1'; // Updated when sample data changes

export function getDefaultData() {
  // Sample plan for demonstration with enhanced status tracking
  const samplePlan = {
    id: 'AP-0001',
    name: 'Annual Audit Plan 2027',
    status: 'APPROVED',
    version: 1,
    fiscalYear: 2027,
    createdDate: new Date().toISOString(),
    regionalAllocation: {
      'Addis Ababa': {
        'desk_audit': 50,
        'field_audit': 30,
        'joint_audit': 20
      },
      'Amhara': {
        'desk_audit': 40,
        'field_audit': 25,
        'joint_audit': 15
      },
      'Oromia': {
        'desk_audit': 60,
        'field_audit': 40,
        'joint_audit': 25
      },
      'SNNPR': {
        'desk_audit': 35,
        'field_audit': 20,
        'joint_audit': 15
      },
      'Somali': {
        'desk_audit': 25,
        'field_audit': 15,
        'joint_audit': 10
      }
    },
    // NEW: Unified allocation status tracking
    allocationStatus: {
      'Addis Ababa': {
        status: 'SENT',
        sentDate: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
        sentBy: 'Regional Director',
        taxCenterReceipts: {
          'Addis Ababa TC1': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
          'Addis Ababa TC2': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
          'Addis Ababa TC3': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 5*24*60*60*1000).toISOString() }
        }
      },
      'Amhara': {
        status: 'SENT',
        sentDate: new Date(Date.now() - 10*24*60*60*1000).toISOString(),
        sentBy: 'Regional Director',
        taxCenterReceipts: {
          'Amhara TC1': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 8*24*60*60*1000).toISOString() },
          'Amhara TC2': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 8*24*60*60*1000).toISOString() },
          'Amhara TC3': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 8*24*60*60*1000).toISOString() }
        }
      },
      'Oromia': {
        status: 'SENT',
        sentDate: new Date(Date.now() - 14*24*60*60*1000).toISOString(),
        sentBy: 'Regional Director',
        taxCenterReceipts: {
          'Oromia TC1': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 12*24*60*60*1000).toISOString() },
          'Oromia TC2': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 12*24*60*60*1000).toISOString() },
          'Oromia TC3': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 12*24*60*60*1000).toISOString() }
        }
      },
      'SNNPR': {
        status: 'PENDING',
        sentDate: null,
        sentBy: null,
        taxCenterReceipts: {}
      },
      'Somali': {
        status: 'PENDING',
        sentDate: null,
        sentBy: null,
        taxCenterReceipts: {}
      }
    },
    // Enhanced: Support for pending/accepted allocations at REGIONAL level
    regionalAllocations: [
      // Regional Director accepts/rejects allocations from Director
      // ADDIS ABABA
      {
        id: 'alloc-add-001',
        region: 'Addis Ababa',
        status: 'PENDING_ACCEPTANCE',
        sentDate: new Date(Date.now() - 7*24*60*60*1000).toISOString(), // 7 days ago
        dueDate: new Date(Date.now() + 3*24*60*60*1000).toISOString(), // Due in 3 days
        acceptedDate: null,
        rejectionReason: null,
        allocationDetails: { desk: 50, field: 30, joint: 20 }
      },
      // AMHARA
      {
        id: 'alloc-amh-001',
        region: 'Amhara',
        status: 'ACCEPTED',
        sentDate: new Date(Date.now() - 14*24*60*60*1000).toISOString(),
        acceptedDate: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
        allocationDetails: { desk: 40, field: 25, joint: 15 }
      },
      // OROMIA
      {
        id: 'alloc-oro-001',
        region: 'Oromia',
        status: 'ACCEPTED',
        sentDate: new Date(Date.now() - 21*24*60*60*1000).toISOString(),
        acceptedDate: new Date(Date.now() - 14*24*60*60*1000).toISOString(),
        allocationDetails: { desk: 60, field: 40, joint: 25 }
      },
      // SNNPR
      {
        id: 'alloc-snnpr-001',
        region: 'SNNPR',
        status: 'PENDING_ACCEPTANCE',
        sentDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
        dueDate: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
        acceptedDate: null,
        allocationDetails: { desk: 35, field: 20, joint: 15 }
      },
      // SOMALI
      {
        id: 'alloc-som-001',
        region: 'Somali',
        status: 'ACCEPTED',
        sentDate: new Date(Date.now() - 28*24*60*60*1000).toISOString(),
        acceptedDate: new Date(Date.now() - 21*24*60*60*1000).toISOString(),
        allocationDetails: { desk: 25, field: 15, joint: 10 }
      }
    ],
    taxCenterAllocations: {
      'Addis Ababa': {
        'Addis Ababa TC1': {
          'desk_audit': 20,
          'field_audit': 12,
          'joint_audit': 8
        },
        'Addis Ababa TC2': {
          'desk_audit': 18,
          'field_audit': 10,
          'joint_audit': 7
        },
        'Addis Ababa TC3': {
          'desk_audit': 12,
          'field_audit': 8,
          'joint_audit': 5
        }
      },
      'Amhara': {
        'Amhara TC1': {
          'desk_audit': 15,
          'field_audit': 10,
          'joint_audit': 6
        },
        'Amhara TC2': {
          'desk_audit': 14,
          'field_audit': 9,
          'joint_audit': 5
        },
        'Amhara TC3': {
          'desk_audit': 11,
          'field_audit': 6,
          'joint_audit': 4
        }
      },
      'Oromia': {
        'Oromia TC1': {
          'desk_audit': 25,
          'field_audit': 16,
          'joint_audit': 10
        },
        'Oromia TC2': {
          'desk_audit': 22,
          'field_audit': 14,
          'joint_audit': 9
        },
        'Oromia TC3': {
          'desk_audit': 13,
          'field_audit': 10,
          'joint_audit': 6
        }
      },
      'SNNPR': {
        'SNNPR TC1': {
          'desk_audit': 14,
          'field_audit': 8,
          'joint_audit': 6
        },
        'SNNPR TC2': {
          'desk_audit': 12,
          'field_audit': 7,
          'joint_audit': 5
        },
        'SNNPR TC3': {
          'desk_audit': 9,
          'field_audit': 5,
          'joint_audit': 4
        }
      },
      'Somali': {
        'Somali TC1': {
          'desk_audit': 10,
          'field_audit': 6,
          'joint_audit': 4
        },
        'Somali TC2': {
          'desk_audit': 9,
          'field_audit': 5,
          'joint_audit': 4
        },
        'Somali TC3': {
          'desk_audit': 6,
          'field_audit': 4,
          'joint_audit': 2
        }
      }
    },
    // Enhanced: Support for pending/submitted feedback at TAX CENTER level
    taxCenterFeedback: {
      'Addis Ababa': {
        'Addis Ababa TC1': {
          id: 'feedback-add-tc1-001',
          status: 'PENDING_SUBMISSION',
          dueDate: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
          submittedDate: null,
          capacity: null,
          notes: null
        },
        'Addis Ababa TC2': {
          id: 'feedback-add-tc2-001',
          status: 'SUBMITTED',
          dueDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
          submittedDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
          capacity: 100,
          notes: 'Can deliver all allocated work'
        }
      },
      'Amhara': {
        'Amhara TC1': {
          id: 'feedback-amh-tc1-001',
          status: 'SUBMITTED',
          dueDate: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
          submittedDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
          capacity: 95,
          notes: 'Team has adequate capacity'
        }
      },
      'Oromia': {
        'Oromia TC1': {
          id: 'feedback-oro-tc1-001',
          status: 'SUBMITTED',
          submittedDate: new Date(Date.now() - 10*24*60*60*1000).toISOString(),
          capacity: 85
        }
      }
    },
    submittedToTaxCenters: {},
    taxCenterAcceptance: {},
    cascadedToCases: false
  };

  // Sample feedback data with pending/submitted statuses
  const sampleFeedback = [
    {
      id: 'feedback-reg-add-001',
      region: 'Addis Ababa',
      status: 'PENDING_SUBMISSION',
      dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      sentDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
      submittedDate: null,
      feedback: null
    },
    {
      id: 'feedback-reg-amh-001',
      region: 'Amhara',
      status: 'SUBMITTED',
      sentDate: new Date(Date.now() - 10*24*60*60*1000).toISOString(),
      submittedDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
      feedback: 'Ready to execute audit plan'
    }
  ];

  // Sample cases with status tracking
  const sampleCases = [
    {
      id: 'case-add-001',
      taxCenter: 'Addis Ababa TC1',
      region: 'Addis Ababa',
      status: 'ASSIGNED',
      assignedDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(), // 5 days ago
      dueDate: new Date(Date.now() + 25*24*60*60*1000).toISOString(), // Due in 25 days
      auditType: 'Standard Audit',
      assignedTo: null,
      completionDate: null
    },
    {
      id: 'case-add-002',
      taxCenter: 'Addis Ababa TC1',
      region: 'Addis Ababa',
      status: 'IN_PROGRESS',
      assignedDate: new Date(Date.now() - 10*24*60*60*1000).toISOString(), // 10 days ago
      dueDate: new Date(Date.now() + 10*24*60*60*1000).toISOString(), // Due in 10 days
      auditType: 'Compliance Audit',
      assignedTo: 'AUDIT-045-AUD',
      completionDate: null
    },
    {
      id: 'case-add-003',
      taxCenter: 'Addis Ababa TC1',
      region: 'Addis Ababa',
      status: 'CLOSED',
      assignedDate: new Date(Date.now() - 30*24*60*60*1000).toISOString(), // 30 days ago
      dueDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(), // Was due 5 days ago
      auditType: 'Risk-Based Audit',
      assignedTo: 'AUDIT-043-AUD',
      completionDate: new Date(Date.now() - 2*24*60*60*1000).toISOString() // Closed 2 days ago
    }
  ];

  // Second plan for testing multiple plans per tax center
  const secondPlan = {
    id: 'AP-0002',
    name: 'Annual Audit Plan 2027 - Phase 2',
    status: 'APPROVED',
    version: 1,
    fiscalYear: 2027,
    createdDate: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
    regionalAllocation: {
      'Addis Ababa': {
        'desk_audit': 45,
        'field_audit': 28,
        'joint_audit': 18
      },
      'Amhara': {
        'desk_audit': 38,
        'field_audit': 23,
        'joint_audit': 14
      },
      'Oromia': {
        'desk_audit': 55,
        'field_audit': 38,
        'joint_audit': 22
      },
      'SNNPR': {
        'desk_audit': 32,
        'field_audit': 18,
        'joint_audit': 12
      },
      'Somali': {
        'desk_audit': 22,
        'field_audit': 13,
        'joint_audit': 8
      }
    },
    allocationStatus: {
      'Addis Ababa': {
        status: 'SENT',
        sentDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
        sentBy: 'Regional Director',
        taxCenterReceipts: {
          'Addis Ababa TC1': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
          'Addis Ababa TC2': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
          'Addis Ababa TC3': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 3*24*60*60*1000).toISOString() }
        }
      },
      'Amhara': {
        status: 'SENT',
        sentDate: new Date(Date.now() - 8*24*60*60*1000).toISOString(),
        sentBy: 'Regional Director',
        taxCenterReceipts: {
          'Amhara TC1': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 6*24*60*60*1000).toISOString() },
          'Amhara TC2': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 6*24*60*60*1000).toISOString() },
          'Amhara TC3': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 6*24*60*60*1000).toISOString() }
        }
      },
      'Oromia': {
        status: 'SENT',
        sentDate: new Date(Date.now() - 12*24*60*60*1000).toISOString(),
        sentBy: 'Regional Director',
        taxCenterReceipts: {
          'Oromia TC1': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 10*24*60*60*1000).toISOString() },
          'Oromia TC2': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 10*24*60*60*1000).toISOString() },
          'Oromia TC3': { status: 'RECEIVED', receivedDate: new Date(Date.now() - 10*24*60*60*1000).toISOString() }
        }
      },
      'SNNPR': {
        status: 'PENDING',
        sentDate: null,
        sentBy: null,
        taxCenterReceipts: {}
      },
      'Somali': {
        status: 'PENDING',
        sentDate: null,
        sentBy: null,
        taxCenterReceipts: {}
      }
    },
    regionalAllocations: [
      {
        id: 'alloc-add-002',
        region: 'Addis Ababa',
        status: 'ACCEPTED',
        sentDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
        acceptedDate: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
        allocationDetails: { desk: 45, field: 28, joint: 18 }
      },
      {
        id: 'alloc-amh-002',
        region: 'Amhara',
        status: 'ACCEPTED',
        sentDate: new Date(Date.now() - 8*24*60*60*1000).toISOString(),
        acceptedDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
        allocationDetails: { desk: 38, field: 23, joint: 14 }
      },
      {
        id: 'alloc-oro-002',
        region: 'Oromia',
        status: 'ACCEPTED',
        sentDate: new Date(Date.now() - 12*24*60*60*1000).toISOString(),
        acceptedDate: new Date(Date.now() - 9*24*60*60*1000).toISOString(),
        allocationDetails: { desk: 55, field: 38, joint: 22 }
      },
      {
        id: 'alloc-snnpr-002',
        region: 'SNNPR',
        status: 'PENDING_ACCEPTANCE',
        sentDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
        dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        acceptedDate: null,
        allocationDetails: { desk: 32, field: 18, joint: 12 }
      },
      {
        id: 'alloc-som-002',
        region: 'Somali',
        status: 'ACCEPTED',
        sentDate: new Date(Date.now() - 19*24*60*60*1000).toISOString(),
        acceptedDate: new Date(Date.now() - 16*24*60*60*1000).toISOString(),
        allocationDetails: { desk: 22, field: 13, joint: 8 }
      }
    ],
    taxCenterAllocations: {
      'Addis Ababa': {
        'Addis Ababa TC1': {
          'desk_audit': 18,
          'field_audit': 11,
          'joint_audit': 7
        },
        'Addis Ababa TC2': {
          'desk_audit': 16,
          'field_audit': 9,
          'joint_audit': 6
        },
        'Addis Ababa TC3': {
          'desk_audit': 11,
          'field_audit': 8,
          'joint_audit': 5
        },
        'Addis Ababa TC1': {
          'desk_audit': 18,
          'field_audit': 11,
          'joint_audit': 7
        },
        'Addis Ababa TC2': {
          'desk_audit': 16,
          'field_audit': 9,
          'joint_audit': 6
        },
        'Addis Ababa TC3': {
          'desk_audit': 11,
          'field_audit': 8,
          'joint_audit': 5
        }
      },
      'Amhara': {
        'Amhara TC1': {
          'desk_audit': 14,
          'field_audit': 9,
          'joint_audit': 5
        },
        'Amhara TC2': {
          'desk_audit': 13,
          'field_audit': 8,
          'joint_audit': 5
        },
        'Amhara TC3': {
          'desk_audit': 11,
          'field_audit': 6,
          'joint_audit': 4
        }
      },
      'Oromia': {
        'Oromia TC1': {
          'desk_audit': 22,
          'field_audit': 15,
          'joint_audit': 9
        },
        'Oromia TC2': {
          'desk_audit': 18,
          'field_audit': 12,
          'joint_audit': 7
        },
        'Oromia TC3': {
          'desk_audit': 15,
          'field_audit': 11,
          'joint_audit': 6
        }
      },
      'SNNPR': {
        'SNNPR TC1': {
          'desk_audit': 11,
          'field_audit': 6,
          'joint_audit': 4
        },
        'SNNPR TC2': {
          'desk_audit': 11,
          'field_audit': 6,
          'joint_audit': 4
        },
        'SNNPR TC3': {
          'desk_audit': 10,
          'field_audit': 6,
          'joint_audit': 4
        }
      },
      'Somali': {
        'Somali TC1': {
          'desk_audit': 8,
          'field_audit': 5,
          'joint_audit': 3
        },
        'Somali TC2': {
          'desk_audit': 8,
          'field_audit': 4,
          'joint_audit': 2
        },
        'Somali TC3': {
          'desk_audit': 6,
          'field_audit': 4,
          'joint_audit': 3
        }
      }
    },
    taxCenterFeedback: {}
  };

  return {
    plans: [samplePlan, secondPlan],
    cases: sampleCases,
    feedback: sampleFeedback,
    auditCases: [],
    activity: [],
    auditors: ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    planCounter: 3,
    caseCounter: 4,
    taxCenterFeedback: [],
    riskEngine: {},
    taxpayerPool: {
      total: 125000,
      byType: {
        'Large Taxpayer': 2500,
        'Medium Taxpayer': 15000,
        'Small Taxpayer': 45000,
        'Micro Taxpayer': 62500
      },
      byRegion: {
        'Addis Ababa': 35000,
        'Oromia': 30000,
        'Amhara': 22000,
        'SNNPR': 15000,
        'Somali': 11000
      }
    }
  };
}

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  
  // Check if data version is outdated
  const storedVersion = localStorage.getItem('data_version');
  if (storedVersion !== DATA_VERSION) {
    console.log(`🔄 Data version mismatch (stored: ${storedVersion}, current: ${DATA_VERSION}). Clearing old data.`);
    localStorage.clear();
    localStorage.setItem('data_version', DATA_VERSION);
    return getDefaultData();
  }
  
  if (!raw) {
    localStorage.setItem('data_version', DATA_VERSION);
    return getDefaultData();
  }
  try {
    const data = JSON.parse(raw);
    const def = getDefaultData();
    
    // Check if we have 2 plans (AP-0001 and AP-0002)
    const hasSecondPlan = data.plans && data.plans.some(p => p.id === 'AP-0002');
    if (!hasSecondPlan) {
      console.log('⚠️ Second plan not found. Reloading from defaults.');
      localStorage.clear();
      localStorage.setItem('data_version', DATA_VERSION);
      return getDefaultData();
    }
    
    // Always ensure we have the sample plans with proper allocations
    if (!data.plans || data.plans.length === 0) {
      data.plans = def.plans;
    } else {
      // Check if existing plans have taxCenterAllocations
      const hasTaxCenterAllocations = data.plans.some(p => p.taxCenterAllocations && Object.keys(p.taxCenterAllocations).length > 0);
      if (!hasTaxCenterAllocations) {
        // No tax center allocations found, use sample plan
        data.plans = def.plans;
      }
    }
    
    // Merge other missing keys
    for (let key in def) {
      if (key !== 'plans' && !(key in data)) {
        data[key] = def[key];
      }
    }
    return data;
  } catch (e) {
    return getDefaultData();
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetAllData() {
  console.log('🔄 Resetting all data - clearing EVERYTHING...');
  // COMPLETELY CLEAR EVERYTHING
  localStorage.clear();
  // Also clear other possible keys
  for (let i = 0; i < 100; i++) {
    localStorage.removeItem(`tax_center_${i}`);
    localStorage.removeItem(`tax_center_${i}_region`);
    localStorage.removeItem(`tax_center_${i}_plan`);
  }
  console.log('✅ ALL localStorage cleared');
  // Return empty data structure (NO sample plans)
  return {
    plans: [],
    cases: [],
    feedback: [],
    auditCases: [],
    activity: [],
    auditors: [],
    planCounter: 1,
    caseCounter: 1,
    taxCenterFeedback: [],
    riskEngine: {},
    taxpayerPool: {
      total: 0,
      byType: {},
      byRegion: {}
    }
  };
}

export function clearAllPlans() {
  console.log('🗑️ Clearing all plans...');
  const data = loadData();
  data.plans = [];
  data.planCounter = 1;
  data.cases = [];
  data.caseCounter = 1;
  data.feedback = [];
  data.taxCenterFeedback = [];
  data.regionalFeedback = [];
  saveData(data);
  console.log('✅ All plans cleared - data saved');
  return data;
}
