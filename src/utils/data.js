export const STORAGE_KEY = 'audit_planning_system_v2';
export const DATA_VERSION = '2.2'; // IMPORTANT: Only increment when sample data changes, NOT for code updates

export function getDefaultData() {
  // Sample plan for demonstration with enhanced status tracking
  const samplePlan = {
    id: 'AP-0001',
    name: 'Annual Audit Plan 2027',
    status: 'FINALIZED',
    version: 1,
    fiscalYear: 2027,
    createdDate: new Date().toISOString(),
    regionalAllocation: {
      'Addis Ababa': {
        'desk_audit': 50,
        'field_audit': 30,
        'joint_audit': 20,
        'transfer_pricing': 10,
        'comprehensive': 15,
        'issue_audit': 5
      },
      'Amhara': {
        'desk_audit': 40,
        'field_audit': 25,
        'joint_audit': 15,
        'transfer_pricing': 8,
        'comprehensive': 12,
        'issue_audit': 4
      },
      'Oromia': {
        'desk_audit': 60,
        'field_audit': 40,
        'joint_audit': 25,
        'transfer_pricing': 12,
        'comprehensive': 18,
        'issue_audit': 6
      },
      'SNNPR': {
        'desk_audit': 35,
        'field_audit': 20,
        'joint_audit': 15,
        'transfer_pricing': 7,
        'comprehensive': 10,
        'issue_audit': 3
      },
      'Somali': {
        'desk_audit': 25,
        'field_audit': 15,
        'joint_audit': 10,
        'transfer_pricing': 5,
        'comprehensive': 8,
        'issue_audit': 2
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
        'Addis Ababa-tc1': {
          'desk_audit': 20,
          'field_audit': 12,
          'joint_audit': 8,
          'transfer_pricing': 4,
          'comprehensive': 6,
          'issue_audit': 2
        },
        'Addis Ababa-tc2': {
          'desk_audit': 18,
          'field_audit': 10,
          'joint_audit': 7,
          'transfer_pricing': 3,
          'comprehensive': 5,
          'issue_audit': 2
        },
        'Addis Ababa-tc3': {
          'desk_audit': 12,
          'field_audit': 8,
          'joint_audit': 5,
          'transfer_pricing': 3,
          'comprehensive': 4,
          'issue_audit': 1
        }
      },
      'Amhara': {
        'Amhara-tc1': {
          'desk_audit': 15,
          'field_audit': 10,
          'joint_audit': 6,
          'transfer_pricing': 3,
          'comprehensive': 4,
          'issue_audit': 1
        },
        'Amhara-tc2': {
          'desk_audit': 14,
          'field_audit': 9,
          'joint_audit': 5,
          'transfer_pricing': 2,
          'comprehensive': 4,
          'issue_audit': 1
        },
        'Amhara-tc3': {
          'desk_audit': 11,
          'field_audit': 6,
          'joint_audit': 4,
          'transfer_pricing': 3,
          'comprehensive': 4,
          'issue_audit': 2
        }
      },
      'Oromia': {
        'Oromia-tc1': {
          'desk_audit': 25,
          'field_audit': 16,
          'joint_audit': 10,
          'transfer_pricing': 4,
          'comprehensive': 6,
          'issue_audit': 2
        },
        'Oromia-tc2': {
          'desk_audit': 22,
          'field_audit': 14,
          'joint_audit': 9,
          'transfer_pricing': 4,
          'comprehensive': 6,
          'issue_audit': 2
        },
        'Oromia-tc3': {
          'desk_audit': 13,
          'field_audit': 10,
          'joint_audit': 6,
          'transfer_pricing': 4,
          'comprehensive': 6,
          'issue_audit': 2
        }
      },
      'SNNPR': {
        'SNNPR-tc1': {
          'desk_audit': 14,
          'field_audit': 8,
          'joint_audit': 6,
          'transfer_pricing': 2,
          'comprehensive': 3,
          'issue_audit': 1
        },
        'SNNPR-tc2': {
          'desk_audit': 12,
          'field_audit': 7,
          'joint_audit': 5,
          'transfer_pricing': 2,
          'comprehensive': 3,
          'issue_audit': 1
        },
        'SNNPR-tc3': {
          'desk_audit': 9,
          'field_audit': 5,
          'joint_audit': 4,
          'transfer_pricing': 3,
          'comprehensive': 4,
          'issue_audit': 1
        }
      },
      'Somali': {
        'Somali-tc1': {
          'desk_audit': 10,
          'field_audit': 6,
          'joint_audit': 4,
          'transfer_pricing': 2,
          'comprehensive': 3,
          'issue_audit': 1
        },
        'Somali-tc2': {
          'desk_audit': 9,
          'field_audit': 5,
          'joint_audit': 4,
          'transfer_pricing': 2,
          'comprehensive': 3,
          'issue_audit': 1
        },
        'Somali-tc3': {
          'desk_audit': 6,
          'field_audit': 4,
          'joint_audit': 2,
          'transfer_pricing': 1,
          'comprehensive': 2,
          'issue_audit': 0
        }
      }
    },
    // CRITICAL: Submission records for tax centers
    submittedToTaxCenters: {
      'Addis Ababa': {
        status: 'SUBMITTED',
        submittedBy: 'Regional Director',
        submittedDate: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
        submittedTo: ['Addis Ababa-tc1', 'Addis Ababa-tc2', 'Addis Ababa-tc3'],
        taxCentersInRegion: ['Addis Ababa-tc1', 'Addis Ababa-tc2', 'Addis Ababa-tc3'],
        readyForAcceptance: true,
        allocationsSet: true
      },
      'Oromia': {
        status: 'SUBMITTED',
        submittedBy: 'Regional Director',
        submittedDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
        submittedTo: ['Oromia-tc1', 'Oromia-tc2', 'Oromia-tc3'],
        taxCentersInRegion: ['Oromia-tc1', 'Oromia-tc2', 'Oromia-tc3'],
        readyForAcceptance: true,
        allocationsSet: true
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
    // Sample submission - Regional Director submitted this plan to tax centers
    submittedToTaxCenters: {
      'Addis Ababa': {
        status: 'SUBMITTED',
        submittedBy: 'Regional Director',
        submittedDate: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
        submittedTo: ['Addis Ababa-tc1', 'Addis Ababa-tc2', 'Addis Ababa-tc3'],
        taxCentersInRegion: ['Addis Ababa-tc1', 'Addis Ababa-tc2', 'Addis Ababa-tc3'],
        readyForAcceptance: true,
        allocationsSet: true
      },
      'Oromia': {
        status: 'SUBMITTED',
        submittedBy: 'Regional Director',
        submittedDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
        submittedTo: ['Oromia-tc1', 'Oromia-tc2', 'Oromia-tc3'],
        taxCentersInRegion: ['Oromia-tc1', 'Oromia-tc2', 'Oromia-tc3'],
        readyForAcceptance: true,
        allocationsSet: true
      }
    },
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
    status: 'FINALIZED',
    version: 1,
    fiscalYear: 2027,
    createdDate: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
    regionalAllocation: {
      'Addis Ababa': {
        'desk_audit': 45,
        'field_audit': 28,
        'joint_audit': 18,
        'transfer_pricing': 9,
        'comprehensive': 14,
        'issue_audit': 4
      },
      'Amhara': {
        'desk_audit': 38,
        'field_audit': 23,
        'joint_audit': 14,
        'transfer_pricing': 7,
        'comprehensive': 11,
        'issue_audit': 3
      },
      'Oromia': {
        'desk_audit': 55,
        'field_audit': 38,
        'joint_audit': 22,
        'transfer_pricing': 11,
        'comprehensive': 17,
        'issue_audit': 5
      },
      'SNNPR': {
        'desk_audit': 32,
        'field_audit': 18,
        'joint_audit': 12,
        'transfer_pricing': 6,
        'comprehensive': 9,
        'issue_audit': 3
      },
      'Somali': {
        'desk_audit': 22,
        'field_audit': 13,
        'joint_audit': 8,
        'transfer_pricing': 4,
        'comprehensive': 6,
        'issue_audit': 2
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
        'Addis Ababa-tc1': {
          'desk_audit': 18,
          'field_audit': 11,
          'joint_audit': 7,
          'transfer_pricing': 3,
          'comprehensive': 5,
          'issue_audit': 1
        },
        'Addis Ababa-tc2': {
          'desk_audit': 16,
          'field_audit': 9,
          'joint_audit': 6,
          'transfer_pricing': 3,
          'comprehensive': 5,
          'issue_audit': 1
        },
        'Addis Ababa-tc3': {
          'desk_audit': 11,
          'field_audit': 8,
          'joint_audit': 5,
          'transfer_pricing': 3,
          'comprehensive': 4,
          'issue_audit': 2
        }
      },
      'Amhara': {
        'Amhara-tc1': {
          'desk_audit': 14,
          'field_audit': 9,
          'joint_audit': 5,
          'transfer_pricing': 2,
          'comprehensive': 4,
          'issue_audit': 1
        },
        'Amhara-tc2': {
          'desk_audit': 13,
          'field_audit': 8,
          'joint_audit': 5,
          'transfer_pricing': 2,
          'comprehensive': 4,
          'issue_audit': 1
        },
        'Amhara-tc3': {
          'desk_audit': 11,
          'field_audit': 6,
          'joint_audit': 4,
          'transfer_pricing': 3,
          'comprehensive': 3,
          'issue_audit': 1
        }
      },
      'Oromia': {
        'Oromia-tc1': {
          'desk_audit': 22,
          'field_audit': 15,
          'joint_audit': 9,
          'transfer_pricing': 4,
          'comprehensive': 6,
          'issue_audit': 2
        },
        'Oromia-tc2': {
          'desk_audit': 18,
          'field_audit': 12,
          'joint_audit': 7,
          'transfer_pricing': 3,
          'comprehensive': 5,
          'issue_audit': 1
        },
        'Oromia-tc3': {
          'desk_audit': 15,
          'field_audit': 11,
          'joint_audit': 6,
          'transfer_pricing': 4,
          'comprehensive': 6,
          'issue_audit': 2
        }
      },
      'SNNPR': {
        'SNNPR-tc1': {
          'desk_audit': 11,
          'field_audit': 6,
          'joint_audit': 4,
          'transfer_pricing': 2,
          'comprehensive': 3,
          'issue_audit': 1
        },
        'SNNPR-tc2': {
          'desk_audit': 11,
          'field_audit': 6,
          'joint_audit': 4,
          'transfer_pricing': 2,
          'comprehensive': 3,
          'issue_audit': 1
        },
        'SNNPR-tc3': {
          'desk_audit': 10,
          'field_audit': 6,
          'joint_audit': 4,
          'transfer_pricing': 2,
          'comprehensive': 3,
          'issue_audit': 1
        }
      },
      'Somali': {
        'Somali-tc1': {
          'desk_audit': 8,
          'field_audit': 5,
          'joint_audit': 3,
          'transfer_pricing': 1,
          'comprehensive': 2,
          'issue_audit': 1
        },
        'Somali-tc2': {
          'desk_audit': 8,
          'field_audit': 4,
          'joint_audit': 2,
          'transfer_pricing': 1,
          'comprehensive': 2,
          'issue_audit': 1
        },
        'Somali-tc3': {
          'desk_audit': 6,
          'field_audit': 4,
          'joint_audit': 3,
          'transfer_pricing': 2,
          'comprehensive': 2,
          'issue_audit': 0
        }
      }
    },
    taxCenterFeedback: {},
    submittedToTaxCenters: {
      'Oromia': {
        status: 'SUBMITTED',
        submittedBy: 'Regional Director',
        submittedDate: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
        submittedTo: ['Oromia-tc1', 'Oromia-tc2'],
        taxCentersInRegion: ['Oromia-tc1', 'Oromia-tc2'],
        readyForAcceptance: true,
        allocationsSet: true
      }
    },
    taxCenterAcceptance: {},
    cascadedToCases: false
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
  
  // CRITICAL FIX: Only clear data if specifically needed, NOT on every code update
  // This prevents data loss when you update code
  const storedVersion = localStorage.getItem('data_version');
  
  // If no stored version, first time setup
  if (!storedVersion) {
    console.log('📝 First time setup - initializing data');
    localStorage.setItem('data_version', DATA_VERSION);
    const defaultData = getDefaultData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
  
  // If data exists, KEEP IT (don't clear on version changes)
  if (raw) {
    try {
      const data = JSON.parse(raw);
      
      // Validate data structure, add missing fields if needed (migration, not reset)
      if (!data.plans) data.plans = [];
      if (!data.auditCases) data.auditCases = [];
      if (!data.cases) data.cases = [];
      if (!data.feedback) data.feedback = [];
      if (!data.activity) data.activity = [];
      
      console.log(`✅ Loaded existing data (version: ${storedVersion}). Plans: ${data.plans.length}`);
      return data;
    } catch (e) {
      console.error('❌ Data corruption detected:', e);
      console.log('🔄 Clearing corrupted data and reinitializing...');
      localStorage.clear();
      localStorage.setItem('data_version', DATA_VERSION);
      const defaultData = getDefaultData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
  }
  
  // No data at all - initialize
  console.log('📝 No data found - initializing default data');
  localStorage.setItem('data_version', DATA_VERSION);
  const defaultData = getDefaultData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
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

/**
 * RECOVERY FUNCTION: Fix already-submitted plans that aren't showing in tax centers
 * This adds/updates submittedToTaxCenters for all FINALIZED plans
 * @param {string} region - Region to add submission for (e.g., 'Oromia')
 * @param {array} taxCenters - List of tax centers (e.g., ['Oromia-tc1', 'Oromia-tc2', 'Oromia-tc3'])
 */
export function recoverSubmittedPlans(region, taxCenters) {
  console.log('🔧 RECOVERY MODE: Fixing already-submitted plans...');
  
  const data = loadData();
  let fixed = 0;
  let skipped = 0;
  
  data.plans.forEach(plan => {
    // Only process FINALIZED plans
    if (plan.status !== 'FINALIZED') {
      console.log(`  ⏭️  ${plan.id}: Status is ${plan.status}, skipping`);
      skipped++;
      return;
    }
    
    // Check if plan has regional allocation for this region
    if (!plan.regionalAllocation || !plan.regionalAllocation[region]) {
      console.log(`  ⏭️  ${plan.id}: No allocation for ${region}, skipping`);
      skipped++;
      return;
    }
    
    // Check if already submitted
    if (plan.submittedToTaxCenters?.[region]?.status === 'SUBMITTED') {
      console.log(`  ✓ ${plan.id}: Already submitted to ${region}, skipping`);
      skipped++;
      return;
    }
    
    // RECOVER: Add submission record
    if (!plan.submittedToTaxCenters) {
      plan.submittedToTaxCenters = {};
    }
    
    // Get regional allocation for distribution
    let regionalTotal = 0;
    if (typeof plan.regionalAllocation[region] === 'object') {
      regionalTotal = Object.values(plan.regionalAllocation[region]).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    } else {
      regionalTotal = parseInt(plan.regionalAllocation[region]) || 0;
    }
    
    // Initialize tax center allocations
    if (!plan.taxCenterAllocations) {
      plan.taxCenterAllocations = {};
    }
    if (!plan.taxCenterAllocations[region]) {
      plan.taxCenterAllocations[region] = {};
    }
    
    // Distribute allocation to tax centers
    const numTaxCenters = taxCenters.length;
    const allocationPerTC = Math.floor(regionalTotal / numTaxCenters);
    
    taxCenters.forEach((tc, index) => {
      const allocation = index === numTaxCenters - 1
        ? regionalTotal - (allocationPerTC * (numTaxCenters - 1))
        : allocationPerTC;
      
      // Allocate by audit type
      if (typeof plan.regionalAllocation[region] === 'object') {
        const auditTypeAlloc = {};
        Object.keys(plan.regionalAllocation[region]).forEach(auditType => {
          const typeTotal = parseInt(plan.regionalAllocation[region][auditType]) || 0;
          const typePerTC = Math.floor(typeTotal / numTaxCenters);
          auditTypeAlloc[auditType] = index === numTaxCenters - 1
            ? typeTotal - (typePerTC * (numTaxCenters - 1))
            : typePerTC;
        });
        plan.taxCenterAllocations[region][tc] = auditTypeAlloc;
      } else {
        plan.taxCenterAllocations[region][tc] = allocation;
      }
    });
    
    // Add submission record
    plan.submittedToTaxCenters[region] = {
      status: 'SUBMITTED',
      submittedBy: 'System Recovery',
      submittedDate: new Date().toISOString(),
      submittedTo: taxCenters,
      taxCentersInRegion: taxCenters,
      readyForAcceptance: true,
      allocationsSet: true
    };
    
    console.log(`  ✅ FIXED ${plan.id}: Added submission for ${region} to ${taxCenters.length} tax centers`);
    fixed++;
  });
  
  // Save recovered data
  saveData(data);
  
  console.log(`\n✨ RECOVERY COMPLETE:`);
  console.log(`  Fixed: ${fixed} plans`);
  console.log(`  Skipped: ${skipped} plans`);
  console.log(`  Total: ${data.plans.length} plans`);
  
  return { fixed, skipped, total: data.plans.length };
}

/**
 * COMPLETE RECOVERY: Fix ALL submitted plans across ALL regions and ALL tax centers at once
 * Completely dynamic - automatically discovers all regions and tax centers from auditConfig
 */
export function recoverAllSubmissions() {
  console.log('%c🔧 COMPLETE SYSTEM RECOVERY STARTED', 'color: #ff9800; font-size: 14px; font-weight: bold;');
  
  const data = loadData();
  const { auditConfig } = require('../config/auditConfig');
  
  let totalFixed = 0;
  let totalSkipped = 0;
  let regionsProcessed = 0;
  
  // Process ALL regions dynamically from auditConfig
  auditConfig.regions.forEach(regionConfig => {
    const region = regionConfig.name;
    const taxCenters = regionConfig.taxCenters || [];
    
    if (taxCenters.length === 0) {
      console.log(`⏭️  Skipping ${region} - no tax centers configured`);
      return;
    }
    
    console.log(`\n🏢 Processing Region: ${region}`);
    console.log(`   Tax Centers: ${taxCenters.join(', ')}`);
    
    let regionFixed = 0;
    let regionSkipped = 0;
    
    data.plans.forEach(plan => {
      // Only process FINALIZED plans
      if (plan.status !== 'FINALIZED') {
        regionSkipped++;
        return;
      }
      
      // Check if plan has regional allocation for this region
      if (!plan.regionalAllocation || !plan.regionalAllocation[region]) {
        regionSkipped++;
        return;
      }
      
      // Check if already submitted
      if (plan.submittedToTaxCenters?.[region]?.status === 'SUBMITTED') {
        regionSkipped++;
        return;
      }
      
      // RECOVER: Add submission record
      if (!plan.submittedToTaxCenters) {
        plan.submittedToTaxCenters = {};
      }
      
      // Get regional allocation for distribution
      let regionalTotal = 0;
      if (typeof plan.regionalAllocation[region] === 'object') {
        regionalTotal = Object.values(plan.regionalAllocation[region]).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      } else {
        regionalTotal = parseInt(plan.regionalAllocation[region]) || 0;
      }
      
      // Initialize tax center allocations
      if (!plan.taxCenterAllocations) {
        plan.taxCenterAllocations = {};
      }
      if (!plan.taxCenterAllocations[region]) {
        plan.taxCenterAllocations[region] = {};
      }
      
      // Distribute allocation to tax centers
      const numTaxCenters = taxCenters.length;
      const allocationPerTC = Math.floor(regionalTotal / numTaxCenters);
      
      taxCenters.forEach((tc, index) => {
        const allocation = index === numTaxCenters - 1
          ? regionalTotal - (allocationPerTC * (numTaxCenters - 1))
          : allocationPerTC;
        
        // Allocate by audit type
        if (typeof plan.regionalAllocation[region] === 'object') {
          const auditTypeAlloc = {};
          Object.keys(plan.regionalAllocation[region]).forEach(auditType => {
            const typeTotal = parseInt(plan.regionalAllocation[region][auditType]) || 0;
            const typePerTC = Math.floor(typeTotal / numTaxCenters);
            auditTypeAlloc[auditType] = index === numTaxCenters - 1
              ? typeTotal - (typePerTC * (numTaxCenters - 1))
              : typePerTC;
          });
          plan.taxCenterAllocations[region][tc] = auditTypeAlloc;
        } else {
          plan.taxCenterAllocations[region][tc] = allocation;
        }
      });
      
      // Add submission record
      plan.submittedToTaxCenters[region] = {
        status: 'SUBMITTED',
        submittedBy: 'System Recovery',
        submittedDate: new Date().toISOString(),
        submittedTo: taxCenters,
        taxCentersInRegion: taxCenters,
        readyForAcceptance: true,
        allocationsSet: true
      };
      
      regionFixed++;
    });
    
    console.log(`   ✅ Fixed: ${regionFixed} plans`);
    console.log(`   ⏭️  Skipped: ${regionSkipped} plans`);
    
    totalFixed += regionFixed;
    totalSkipped += regionSkipped;
    if (regionFixed > 0) regionsProcessed++;
  });
  
  // Save all recovered data
  saveData(data);
  
  console.log('%c✨ COMPLETE RECOVERY FINISHED', 'color: #4caf50; font-size: 14px; font-weight: bold;');
  console.log(`  🏢 Regions: ${regionsProcessed}/${auditConfig.regions.length}`);
  console.log(`  ✅ Plans Fixed: ${totalFixed}`);
  console.log(`  ⏭️  Plans Skipped: ${totalSkipped}`);
  console.log(`  📦 Total Plans: ${data.plans.length}`);
  
  return {
    regions: regionsProcessed,
    fixed: totalFixed,
    skipped: totalSkipped,
    total: data.plans.length
  };
}
