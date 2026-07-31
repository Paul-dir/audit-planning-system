# Debug Guide: Team Leader Seeing 0 Cases

## Problem
Team Leaders see **0 cases** even though Tax Center Manager assigned cases to them.

## Diagnostic Steps

### Step 1: Check Browser Console (F12)

When Team Leader opens "Assign Cases to Auditors" view, you'll now see detailed debug logs:

```
🔍 [DEBUG] Case CASE-xxx:
     status: ASSIGNED_TO_TEAM_LEADER
     assignedTeamLeaderId: USR-0162-TEA
     assignedTeamLeaderUserId: undefined
     assignedTeamLeader: Tenako Valate
     assignedTeamLeaderEmail: undefined
     planYear: 2027
   Checking against:
     tlId: USR-0163-TEA
     userInfo.userId: USR-0163-TEA
     userInfo.id: undefined
     userInfo.fullName: Another Team Leader
     userInfo.full_name: undefined
     userInfo.email: another@example.com
```

### Step 2: Identify the Mismatch

Look for:
- ❌ **ID Mismatch**: `assignedTeamLeaderId: USR-0162-TEA` but `tlId: USR-0163-TEA` (different IDs)
- ❌ **Name Mismatch**: `assignedTeamLeader: Tenako Valate` but `userInfo.fullName: Another Team Leader`
- ❌ **Missing Fields**: `assignedTeamLeaderEmail: undefined` can't match anything

### Step 3: Common Issues & Solutions

#### Issue A: Wrong Team Leader Logged In
**Symptom**: All cases show "NO MATCH"
**Cause**: You're logged in as a different Team Leader than the one cases were assigned to
**Solution**: 
```javascript
// In console, check which TL you're logged in as:
const userInfo = JSON.parse(localStorage.getItem('currentUser'));
console.log('Logged in as:', userInfo.fullName, userInfo.id);

// Check which TL cases were assigned to:
const data = JSON.parse(localStorage.getItem('audit_planning_system_v2'));
const tlCases = data.auditCases.filter(c => c.status === 'ASSIGNED_TO_TEAM_LEADER');
console.log('Cases assigned to:', tlCases.map(c => ({
  caseId: c.id,
  assignedTo: c.assignedTeamLeader,
  assignedToId: c.assignedTeamLeaderId
})));
```

#### Issue B: ID Format Mismatch
**Symptom**: Case has `assignedTeamLeaderId: "USR-123"` but Team Leader has `id: undefined`
**Cause**: Team Leader user object doesn't have `id` field, only `userId`
**Solution**: The enhanced matching should handle this, but verify in console:
```javascript
const userInfo = JSON.parse(localStorage.getItem('currentUser'));
console.log('User fields:', {
  id: userInfo.id,
  userId: userInfo.userId,
  fullName: userInfo.fullName,
  full_name: userInfo.full_name,
  email: userInfo.email
});
```

#### Issue C: Incomplete Assignment Data
**Symptom**: Case only has `assignedTeamLeader: "Name"` but no `assignedTeamLeaderId`
**Cause**: Old assignment before the fix was applied
**Solution**: Reassign the case in Tax Center Manager view (the new assignment will store all ID variants)

#### Issue D: Plan Year Mismatch
**Symptom**: Cases matched but filtered out by year
**Cause**: Case has `planYear: 2026` but filter shows only `2027`
**Solution**: Select the correct plan year or remove year filter

### Step 4: Run Full Diagnostic

Copy and paste this into your browser console:

```javascript
// FULL DIAGNOSTIC SCRIPT
console.log('=== TEAM LEADER ASSIGNMENT DIAGNOSTIC ===\n');

// 1. Check current user
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
console.log('1. CURRENT USER (Team Leader):');
console.log('   id:', currentUser.id);
console.log('   userId:', currentUser.userId);
console.log('   fullName:', currentUser.fullName);
console.log('   full_name:', currentUser.full_name);
console.log('   email:', currentUser.email);
console.log('   role:', currentUser.role);
console.log('');

// 2. Check all cases with ASSIGNED_TO_TEAM_LEADER status
const data = JSON.parse(localStorage.getItem('audit_planning_system_v2'));
const tlCases = (data.auditCases || []).filter(c => c.status === 'ASSIGNED_TO_TEAM_LEADER');
console.log('2. ALL CASES ASSIGNED TO TEAM LEADERS:', tlCases.length);
console.log('');

// 3. Check each case in detail
tlCases.forEach((c, idx) => {
  console.log(`3.${idx + 1}. Case ${c.id}:`);
  console.log('   assignedTeamLeaderId:', c.assignedTeamLeaderId);
  console.log('   assignedTeamLeaderUserId:', c.assignedTeamLeaderUserId);
  console.log('   assignedTeamLeader:', c.assignedTeamLeader);
  console.log('   assignedTeamLeaderEmail:', c.assignedTeamLeaderEmail);
  console.log('   planYear:', c.planYear);
  
  // Check if this case matches current user
  const matches = [
    c.assignedTeamLeaderId === currentUser.id,
    c.assignedTeamLeaderId === currentUser.userId,
    c.assignedTeamLeaderUserId === currentUser.id,
    c.assignedTeamLeaderUserId === currentUser.userId,
    c.assignedTeamLeader === currentUser.fullName,
    c.assignedTeamLeader === currentUser.full_name,
    c.assignedTeamLeaderEmail === currentUser.email
  ];
  
  const matchCount = matches.filter(m => m).length;
  if (matchCount > 0) {
    console.log('   ✅ MATCHES current user (' + matchCount + ' fields)');
  } else {
    console.log('   ❌ DOES NOT MATCH current user');
  }
  console.log('');
});

// 4. Summary
const matchingCases = tlCases.filter(c => 
  c.assignedTeamLeaderId === currentUser.id ||
  c.assignedTeamLeaderId === currentUser.userId ||
  c.assignedTeamLeaderUserId === currentUser.id ||
  c.assignedTeamLeaderUserId === currentUser.userId ||
  c.assignedTeamLeader === currentUser.fullName ||
  c.assignedTeamLeader === currentUser.full_name ||
  c.assignedTeamLeaderEmail === currentUser.email
);

console.log('4. SUMMARY:');
console.log('   Total cases with ASSIGNED_TO_TEAM_LEADER status:', tlCases.length);
console.log('   Cases matching current Team Leader:', matchingCases.length);
console.log('   Cases NOT matching:', tlCases.length - matchingCases.length);
console.log('');

if (matchingCases.length === 0 && tlCases.length > 0) {
  console.log('⚠️  PROBLEM: Cases exist but none match your identity!');
  console.log('   Possible reasons:');
  console.log('   1. You are logged in as a different Team Leader');
  console.log('   2. Cases were assigned to a different Team Leader');
  console.log('   3. ID format mismatch (check assignedTeamLeaderId vs your userId)');
  console.log('');
  console.log('   Cases are assigned to:');
  const uniqueTLs = [...new Set(tlCases.map(c => c.assignedTeamLeader || c.assignedTeamLeaderId))];
  uniqueTLs.forEach(tl => console.log('     - ' + tl));
}

console.log('=== END DIAGNOSTIC ===');
```

### Step 5: Fix Based on Diagnostic Results

#### If "Cases exist but none match your identity":
1. **Check if you're the right Team Leader**: Cases might be assigned to someone else
2. **Login as the correct Team Leader**: Use the user who cases were assigned to
3. **Reassign in Tax Center Manager**: Select the correct Team Leader and reassign

#### If "Cases matching current Team Leader: 0" but you should have cases:
1. **Data not saved**: Tax Center Manager needs to assign cases again
2. **Check Tax Center Manager view**: Verify assignments were actually saved
3. **Clear cache and reassign**: 
   ```javascript
   localStorage.clear();
   location.reload();
   // Then reassign from Tax Center Manager
   ```

### Step 6: Verify the Fix

After reassignment, you should see in console:

```
✅ MATCHED case CASE-xxx for TL: USR-xxx (year: 2027)
✅ Total cases to show: 5
```

And in the UI:
- Debug panel shows your identity
- Case count badge shows "5 Cases" (not "0 Cases")
- Cases list shows the assigned cases

## Quick Fix Commands

### Force Reassign All Cases to Current Team Leader
```javascript
// DANGER: This reassigns ALL TL cases to you!
const data = JSON.parse(localStorage.getItem('audit_planning_system_v2'));
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

data.auditCases.forEach(c => {
  if (c.status === 'ASSIGNED_TO_TEAM_LEADER') {
    c.assignedTeamLeaderId = currentUser.userId || currentUser.id;
    c.assignedTeamLeaderUserId = currentUser.userId || currentUser.id;
    c.assignedTeamLeader = currentUser.fullName || currentUser.full_name;
    c.assignedTeamLeaderEmail = currentUser.email;
    c.planYear = c.planYear || 2027;
  }
});

localStorage.setItem('audit_planning_system_v2', JSON.stringify(data));
console.log('✅ Reassigned all TL cases to', currentUser.fullName);
location.reload();
```

### Check Specific Case Assignment
```javascript
const data = JSON.parse(localStorage.getItem('audit_planning_system_v2'));
const caseId = 'CASE-Addis Ababa-Addis Ababa TC3-1785412864625-289'; // Replace with your case ID

const caseData = data.auditCases.find(c => c.id === caseId);
console.log('Case assignment:', {
  id: caseData.id,
  status: caseData.status,
  assignedTeamLeaderId: caseData.assignedTeamLeaderId,
  assignedTeamLeader: caseData.assignedTeamLeader,
  assignedTeamLeaderUserId: caseData.assignedTeamLeaderUserId,
  assignedTeamLeaderEmail: caseData.assignedTeamLeaderEmail,
  planYear: caseData.planYear
});
```

## Common Patterns

### Pattern 1: Cases assigned to "Tenako Valate" but you are "Bereket Tesfa"
**Solution**: Login as Tenako Valate OR reassign cases to Bereket Tesfa

### Pattern 2: Case has `assignedTeamLeaderId: undefined`
**Solution**: Old assignment format - reassign from Tax Center Manager

### Pattern 3: All fields are correct but still 0 cases
**Solution**: Check plan year filter - might be filtering out your cases

### Pattern 4: Cases appear in console logs but not in UI
**Solution**: React state issue - click the "Refresh Cases" button

## Still Not Working?

If you've tried everything and still see 0 cases:

1. **Export your data**:
   ```javascript
   const data = localStorage.getItem('audit_planning_system_v2');
   console.log(data); // Copy this
   ```

2. **Check the console logs** when loading the page - look for errors

3. **Verify the fix was applied**: Check that `assignmentData.js` and `AssignToAuditorsView.jsx` have the enhanced matching code

4. **Test with a fresh assignment**: Have Tax Center Manager assign ONE test case and see if it appears

---

*This diagnostic guide will help identify the exact reason why Team Leaders see 0 cases.*
