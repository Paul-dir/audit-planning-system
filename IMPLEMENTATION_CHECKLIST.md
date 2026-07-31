# Hierarchical Routing Implementation Checklist
**Status**: ✅ PHASE 1 COMPLETE - Code Implementation Done  
**Next**: Testing & UI Integration

---

## PHASE 1: CODE IMPLEMENTATION ✅ DONE

### New Files Created ✅
- [x] `src/utils/caseDistribution.js` - Hierarchical distribution engine
  - [x] `cascadePlanToTeamLeadersByAuditType()` - Main distribution function
  - [x] `getTeamLeadersForAuditType()` - Filter TLs by audit type
  - [x] `distributeToTeamLeadersIntelligently()` - Load-balanced distribution
  - [x] `getAuditorsForTeamLeader()` - Get auditors of same audit type
  - [x] `validateAuditTypeConsistency()` - Validate TL↔Auditor match
  - [x] `getDistributionStats()` - Get distribution statistics
  - [x] Build: ✅ Exit Code 0 (125 modules)

### Files Modified ✅
- [x] `src/components/views/assignments/AssignToTeamLeadersView.jsx`
  - [x] Added imports for caseDistribution functions
  - [x] Enhanced `loadCasesAndTeamLeaders()` with audit type validation tracing
  - [x] Updated `handleAssignCase()` with audit type consistency check
  - [x] Added `handleHierarchicalAutoAssign()` function
  - [x] Build: ✅ Exit Code 0

### Documentation ✅
- [x] `HIERARCHICAL_ROUTING_LOGIC.md` - Complete technical spec
- [x] `ROUTING_FIX_SUMMARY.md` - Quick reference guide
- [x] Console tracing added with 🔍 📊 ✅ ❌ emoji indicators

---

## PHASE 2: TESTING (IN PROGRESS)

### Test Data Requirements
- [ ] Verify Team Leaders have `org_context.auditType` set
  - [ ] desk_audit Team Leaders
  - [ ] field_audit Team Leaders
  - [ ] joint_audit Team Leaders
  - [ ] transfer_pricing Team Leaders

- [ ] Verify Auditors have matching `org_context.auditType`
  - [ ] Desk audit auditors under desk audit TLs
  - [ ] Field audit auditors under field audit TLs
  - [ ] Joint audit auditors under joint audit TLs

- [ ] Sample test cases (32 total)
  - [ ] 15 desk audit cases
  - [ ] 10 field audit cases
  - [ ] 7 joint audit cases

### Functional Testing
- [ ] **Test 1: Load Cases by Audit Type**
  - [ ] Open AssignToTeamLeadersView
  - [ ] Verify cases grouped by audit type in console
  - [ ] Check trace logs show breakdown by type
  - [ ] Expected: `desk_audit: 15, field_audit: 10, joint_audit: 7`

- [ ] **Test 2: Validate Team Leader Filtering**
  - [ ] Check getTeamLeadersForAuditType() returns only matching TLs
  - [ ] Expected console output:
    ```
    desk_audit Team Leaders: 2
    field_audit Team Leaders: 2
    joint_audit Team Leaders: 1
    ```

- [ ] **Test 3: Manual Assignment with Validation**
  - [ ] Try assigning desk audit case to field audit TL
  - [ ] Should see error: "AUDIT TYPE MISMATCH"
  - [ ] Try assigning desk audit case to desk audit TL
  - [ ] Should succeed with confirmation message

- [ ] **Test 4: Hierarchical Auto-Assignment**
  - [ ] Click "Auto-Assign by Audit Type" button (when added to UI)
  - [ ] Monitor console for distribution logs
  - [ ] Expected trace:
    ```
    📋 [CASCADE] Starting hierarchical distribution
    ✅ Step 1: Loaded 32 unassigned cases
    ✅ Step 2: Grouped into audit types: desk_audit(15), field_audit(10), joint_audit(7)
    
    🔄 Processing audit type: desk_audit (15 cases)
       Found 2 Team Leaders for desk_audit
       📊 Distributing 15 desk_audit cases across 2 Team Leaders
        📍 Case CAA-0001 → TL-Desk-1 (5/12)
        ... (13 more)
       ✅ Distributed 15/15 cases
    
    (Similar for field_audit and joint_audit)
    
    ✅ [CASCADE] Hierarchical distribution complete
    ```

- [ ] **Test 5: Team Leader receives only their audit type**
  - [ ] Login as Desk Audit Team Leader
  - [ ] Go to AssignToAuditorsView
  - [ ] Verify cases are ALL desk audit type
  - [ ] Check cannot see field or joint audit cases

- [ ] **Test 6: Auditor receives only their audit type**
  - [ ] Login as Auditor under desk audit team
  - [ ] Go to "My Cases"
  - [ ] Verify cases are ALL desk audit type
  - [ ] Check workload shows only desk audit cases

### Console Output Verification
Look for these traces in browser console:

```javascript
// When loading:
📊 [AssignToTeamLeaders] Stored cases: 32
   desk_audit: 15 cases
   field_audit: 10 cases
   joint_audit: 7 cases
   desk_audit Team Leaders: 2
   field_audit Team Leaders: 2
   joint_audit Team Leaders: 1
✅ [AssignToTeamLeaders] Data loaded successfully

// When validating assignment:
🔍 [AssignCase] Validating audit type:
   caseType: desk_audit
   tlType: desk_audit
   match: true
✅ [AssignCase] Case assigned to TL-Desk-1

// When auto-assigning:
🔄 [HierarchicalAutoAssign] Starting for Addis Ababa TC1
📋 [CASCADE] Starting hierarchical distribution
✅ Step 1: Loaded 32 unassigned cases
... (distribution process)
✅ [CASCADE] Hierarchical distribution complete
```

---

## PHASE 3: UI INTEGRATION (TODO)

### UI Updates Needed

#### 1. AssignToTeamLeadersView.jsx - Add UI Button
**Location**: After "Select All" button  
**Button**: "Auto-Assign by Audit Type"
```jsx
<button 
  onClick={handleHierarchicalAutoAssign}
  style={{ background: '#4caf50', color: '#fff', padding: '10px 20px' }}
>
  <i className="fas fa-magic"></i> Auto-Assign by Audit Type
</button>
```

#### 2. Case Card Display - Show Audit Type
**Current**: Shows case ID, risk level  
**Add**: Audit type badge
```jsx
<span style={{ background: '#2196f3', color: '#fff', padding: '4px 8px' }}>
  {auditCase.auditType.replace(/_/g, ' ').toUpperCase()}
</span>
```

#### 3. Team Leader Dropdown - Group by Audit Type
**Current**: All TLs in one list  
**New**: Optgroups by audit type
```jsx
<optgroup label="Desk Audit">
  <option>TL-Desk-1</option>
  <option>TL-Desk-2</option>
</optgroup>
<optgroup label="Field Audit">
  <option>TL-Field-1</option>
  <option>TL-Field-2</option>
</optgroup>
```

#### 4. Summary Modal
Show distribution results after auto-assign:
```
✅ Auto-Assignment Complete

Desk Audit: 15/15 assigned
├─ TL-Desk-1: 8 cases
└─ TL-Desk-2: 7 cases

Field Audit: 10/10 assigned
├─ TL-Field-1: 5 cases
└─ TL-Field-2: 5 cases

Joint Audit: 7/7 assigned
└─ TL-Joint-1: 7 cases

Total: 32/32 assigned
```

---

## PHASE 4: DATA VALIDATION (TODO)

### OrgStructure Verification
Check `src/data/orgStructure.js`:
- [ ] All Team Leaders have `org_context.auditType`
- [ ] All Auditors have `org_context.auditType`
- [ ] Auditors' audit type matches their Team Leader's type
- [ ] Correct `teamId` for grouping

**Command to check**:
```javascript
// In browser console:
const users = getAllUsers();
const tls = users.filter(u => u.role === 'team_leader');
const auditors = users.filter(u => u.role === 'auditor');

console.table(tls.map(t => ({
  name: t.full_name,
  auditType: t.org_context.auditType,
  teamId: t.org_context.teamId
})));

console.table(auditors.map(a => ({
  name: a.full_name,
  auditType: a.org_context.auditType,
  teamId: a.org_context.teamId
})));
```

---

## PHASE 5: INTEGRATION WITH OTHER VIEWS (TODO)

### Views to Update

#### 1. CasePrioritizationView.jsx
- [ ] Add button for hierarchical cascade
- [ ] Show audit type in case cards
- [ ] Group stored cases by audit type

#### 2. AuditCasesListView.jsx
- [ ] Show audit type filter
- [ ] Filter cases by audit type
- [ ] Display audit type in list

#### 3. ProcessOwnerCaseTrackingView.jsx
- [ ] Show distribution stats by audit type
- [ ] Show TLs grouped by audit type
- [ ] Display audit type in case list

#### 4. TeamLeaderCaseManagementView.jsx
- [ ] Show only cases matching TL's audit type
- [ ] Show only auditors matching TL's audit type
- [ ] Validate audit type before assignment

---

## PHASE 6: ERROR HANDLING (TODO)

### Error Scenarios to Handle

#### 1. No Team Leaders for Audit Type
**Current**: Logs warning, skips cases  
**Todo**: 
- [ ] Show user-friendly error message
- [ ] Don't skip cases silently
- [ ] Offer alternative (manual assignment)

#### 2. No Auditors for Team Leader
**Current**: Logs warning  
**Todo**:
- [ ] Prevent Team Leader from accepting cases
- [ ] Show capacity issue to user
- [ ] Suggest alternative TL

#### 3. Audit Type Mismatch
**Current**: Prevents assignment with error  
**Todo** ✅ DONE:
- [x] Shows clear error message
- [x] Explains what went wrong

#### 4. All TLs at Capacity
**Current**: Logs warning, may leave cases unassigned  
**Todo**:
- [ ] Provide queue/waiting list
- [ ] Notify when capacity opens
- [ ] Suggest overflow to other region

---

## PHASE 7: PERFORMANCE & MONITORING (TODO)

### Performance Checks
- [ ] Distribution of 1000 cases completes in < 5 seconds
- [ ] No memory leaks with large datasets
- [ ] Console logs don't impact performance
- [ ] Database queries are indexed

### Monitoring
- [ ] Track distribution success rate
- [ ] Monitor TL capacity utilization
- [ ] Alert if TLs consistently overloaded
- [ ] Track assignment errors/mismatches

---

## BUILD STATUS

✅ **Current Build**: Exit Code 0 (125 modules)
- All new code compiled successfully
- No import errors
- No type errors
- Ready for testing

---

## KNOWN ISSUES

1. **Large Chunk Warning** (NOT A PROBLEM)
   - Bundle is 991KB due to size of all audit types
   - Doesn't affect functionality
   - Can be optimized later with code-splitting

---

## NEXT STEPS (IN ORDER)

1. **Immediate** (Next session):
   - [ ] Verify Team Leader/Auditor audit types in orgStructure.js
   - [ ] Run Test 1-3 from Testing phase
   - [ ] Verify console output matches expected traces

2. **Short-term** (Next 2 sessions):
   - [ ] Add UI button for auto-assign
   - [ ] Run Test 4-6 complete flow
   - [ ] Fix any bugs found

3. **Medium-term** (Next 3-4 sessions):
   - [ ] Update all related views
   - [ ] Add comprehensive error handling
   - [ ] Performance testing with large datasets

4. **Long-term** (Next 5+ sessions):
   - [ ] Monitoring & alerts
   - [ ] Code splitting for bundle optimization
   - [ ] Documentation updates for deployment

---

## SUCCESS CRITERIA

✅ **All criteria must pass before going to production**:

1. [ ] Cases maintain audit type through entire path
2. [ ] Each TL sees only their audit type cases
3. [ ] Each Auditor sees only their audit type cases
4. [ ] Auto-assignment distributes by audit type correctly
5. [ ] Manual assignment validates audit type
6. [ ] Console shows correct trace logs
7. [ ] No errors in browser console
8. [ ] Performance within SLA (< 5 seconds for 1000 cases)
9. [ ] All UI buttons work correctly
10. [ ] User feedback is clear and helpful

---

**Created**: July 30, 2026  
**Version**: 1.0  
**Status**: Implementation Phase Complete - Ready for Testing

