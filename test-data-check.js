// Load the data to verify
const fs = require('fs');

// Simulate the dataService function to verify data
function getDefaultData() {
  const samplePlan = {
    id: 'AP-0001',
    name: 'Annual Audit Plan 2027',
    status: 'FINALIZED',
    regionalAllocation: {
      'addis_ababa': {
        'desk_audit': 50,
        'field_audit': 30,
        'joint_audit': 20,
        'transfer_pricing': 10,
        'comprehensive': 15,
        'issue_audit': 5
      }
    }
  };
  return { plans: [samplePlan] };
}

const data = getDefaultData();
console.log('Sample plan ID:', data.plans[0].id);
console.log('Has regionalAllocation:', !!data.plans[0].regionalAllocation);
console.log('Has addis_ababa:', !!data.plans[0].regionalAllocation['addis_ababa']);
console.log('addis_ababa data:', data.plans[0].regionalAllocation['addis_ababa']);
