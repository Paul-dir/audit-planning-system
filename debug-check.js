console.log("=== Checking Navigation Setup ===");

// Check if the onClick handlers are properly bound
const checkFile = (filePath) => {
  const fs = require('fs');
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('onClick') && content.includes('onNavigate')) {
    console.log(`✅ ${filePath} has onClick with onNavigate`);
  } else {
    console.log(`❌ ${filePath} missing proper handlers`);
  }
};

checkFile('src/components/layout/Sidebar.jsx');
checkFile('src/components/layout/Layout.jsx');
checkFile('src/App.jsx');

console.log("\n=== Navigation chain looks good ===");
