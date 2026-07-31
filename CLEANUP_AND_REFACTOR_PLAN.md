# Cleanup & Refactor Plan - Moving to React-Based Routing

**Date**: July 31, 2026  
**Status**: PLANNING PHASE  
**Risk Level**: HIGH - Requires careful analysis

---

## .js Files Analysis

### Total .js Files Found: 32

#### CRITICAL - MUST KEEP (API & Core Data)
```
✅ KEEP - These provide essential API and data:
├── src/api/userManagementClient.js (MOR API connection)
├── src/data/orgStructure.js (241 users - critical reference data)
├── src/data/mockUsers.js (mock data for testing)
├── src/services/morIdentityAPI.js (authentication - CRITICAL)
└── src/services/planService.js (plan business logic)
```

#### REFACTOR - Convert to React Components (.jsx)
```
🔄 REFACTOR - Convert to React hooks/components:
├── src/hooks/useAuditTeamMetrics.js → useAuditTeamMetrics.jsx
├── src/hooks/useRealTimeAssignments.js → useRealTimeAssignments.jsx
├── src/hooks/useOrgData.js → useOrgData.jsx
├── src/hooks/useRoleDashboardMetrics.js → useRoleDashboardMetrics.jsx
├── src/hooks/useAppData.js → useAppData.jsx
└── src/hooks/useCaseAssignment.js → useCaseAssignment.jsx
(These are already hooks - just need .jsx extension)

🔄 REFACTOR - Convert to React services (.jsx):
├── src/config/navigation.js → src/services/navigationService.jsx
├── src/config/workspaceConfig.js → src/services/workspaceService.jsx
├── src/config/auditConfig.js → src/services/auditConfigService.jsx
├── src/config/planningProcess.js → src/services/planningService.jsx
└── src/config/hierarchyConfig.js → src/services/hierarchyService.jsx
```

#### REMOVE - Obsolete/Redundant
```
❌ REMOVE - These are redundant or replaced by new routing:
├── src/utils/dataFiltering.js (logic moved to new routing)
├── src/utils/visibilityManager.js (logic moved to new routing)
├── src/utils/intelligentCaseDistribution.js (merged to services)
├── src/utils/assignmentStateMachine.js (state moved to context)
├── src/utils/assignmentDataModels.js (models moved to types)
├── src/utils/assignmentScoring.js (logic moved to services)
├── src/utils/hierarchyEngine.js (logic moved to services)
├── src/utils/orgIdentifier.js (logic moved to services)
├── src/utils/caseDistribution.js (logic moved to services)
└── src/utils/dataCleanup.js (no longer needed)
```

#### KEEP - Essential Utilities
```
✅ KEEP - These provide essential utilities:
├── src/utils/userIdParser.js (CRITICAL - user parsing)
├── src/utils/regionNormalizer.js (CRITICAL - region format)
├── src/utils/businessLogic.js (CRITICAL - business rules)
├── src/utils/data.js (CRITICAL - data management)
└── src/utils/assignmentData.js (CRITICAL - assignment data)
```

---

## Cleanup Strategy

### Phase 1: BACKUP & ANALYSIS (5 mins)
```bash
# Create backup before starting
git commit -m "Backup: Before routing refactor"
git branch -b backup/before-routing-refactor

# Analyze which files are imported where
grep -r "import.*from.*utils/" src/ | wc -l
grep -r "import.*from.*config/" src/ | wc -l
grep -r "import.*from.*services/" src/ | wc -l
```

### Phase 2: REFACTOR (30 mins)
**Step 1**: Convert hooks to .jsx
```bash
# Rename all hooks/*.js to hooks/*.jsx
src/hooks/useAuditTeamMetrics.js → src/hooks/useAuditTeamMetrics.jsx
src/hooks/useRealTimeAssignments.js → src/hooks/useRealTimeAssignments.jsx
# ... etc
```

**Step 2**: Move config to services
```bash
# Move configuration files to services and convert
src/config/navigation.js → src/services/navigationService.jsx
src/config/workspaceConfig.js → src/services/workspaceService.jsx
# ... etc
```

**Step 3**: Update imports everywhere
```bash
# Find all imports and update them:
grep -r "from.*hooks/" src/ | update to .jsx
grep -r "from.*config/" src/ | update to services/
```

### Phase 3: DELETE REDUNDANT (15 mins)
```bash
# Delete files identified as redundant
rm src/utils/dataFiltering.js
rm src/utils/visibilityManager.js
rm src/utils/intelligentCaseDistribution.js
rm src/utils/assignmentStateMachine.js
rm src/utils/assignmentDataModels.js
rm src/utils/assignmentScoring.js
rm src/utils/hierarchyEngine.js
rm src/utils/orgIdentifier.js
rm src/utils/caseDistribution.js
rm src/utils/dataCleanup.js
```

### Phase 4: CREATE NEW ROUTING (30 mins)
```
Create new React-based routing system:
src/routing/
├── RouteContext.jsx
├── RouteManager.jsx
├── RegionRouter.jsx
├── UserRouter.jsx
├── PlanRouter.jsx
├── useRouting.jsx
├── RouteGuard.jsx
└── index.jsx
```

### Phase 5: INTEGRATE & TEST (20 mins)
```bash
npm run build
# Fix any import errors
# Test all user roles
# Verify all regions work
```

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Breaking imports | HIGH | Update all imports systematically |
| Missing data | HIGH | Keep all critical data files |
| API calls fail | MEDIUM | Keep morIdentityAPI.js intact |
| Tests fail | MEDIUM | Run tests after each phase |
| Performance issues | LOW | New routing is optimized |

---

## Files to Remove (10 files)
```
1. src/utils/dataFiltering.js
2. src/utils/visibilityManager.js
3. src/utils/intelligentCaseDistribution.js
4. src/utils/assignmentStateMachine.js
5. src/utils/assignmentDataModels.js
6. src/utils/assignmentScoring.js
7. src/utils/hierarchyEngine.js
8. src/utils/orgIdentifier.js
9. src/utils/caseDistribution.js
10. src/utils/dataCleanup.js
```

## Files to Keep (22 files)
```
1. src/api/userManagementClient.js (API)
2. src/data/orgStructure.js (org data - 241 users)
3. src/data/mockUsers.js (test data)
4. src/services/morIdentityAPI.js (auth - CRITICAL)
5. src/services/planService.js (plan logic)
6. src/services/navigationService.jsx (new - converted from navigation.js)
7. src/services/workspaceService.jsx (new - converted from workspaceConfig.js)
8. src/services/auditConfigService.jsx (new - converted from auditConfig.js)
9. src/services/planningService.jsx (new - converted from planningProcess.js)
10. src/services/hierarchyService.jsx (new - converted from hierarchyConfig.js)
11. src/hooks/useAuditTeamMetrics.jsx (rename)
12. src/hooks/useRealTimeAssignments.jsx (rename)
13. src/hooks/useOrgData.jsx (rename)
14. src/hooks/useRoleDashboardMetrics.jsx (rename)
15. src/hooks/useAppData.jsx (rename)
16. src/hooks/useCaseAssignment.jsx (rename)
17. src/utils/userIdParser.js (CRITICAL)
18. src/utils/regionNormalizer.js (CRITICAL)
19. src/utils/businessLogic.js (CRITICAL)
20. src/utils/data.js (CRITICAL)
21. src/utils/assignmentData.js (CRITICAL)
22. All NEW routing files
```

---

## Recommendation

⚠️ **BEFORE WE START, PLEASE CONFIRM:**

1. **Should we backup first?**
   - Create a git branch for safety
   - Keep original code in case of issues

2. **Safe to remove these 10 files?**
   - [x] dataFiltering.js
   - [x] visibilityManager.js
   - [x] intelligentCaseDistribution.js
   - [x] assignmentStateMachine.js
   - [x] assignmentDataModels.js
   - [x] assignmentScoring.js
   - [x] hierarchyEngine.js
   - [x] orgIdentifier.js
   - [x] caseDistribution.js
   - [x] dataCleanup.js

3. **Update imports for moved files?**
   - Rename all hooks/*.js → hooks/*.jsx
   - Move config/*.js → services/*.jsx
   - Update all import statements

4. **Timeline?**
   - Phase 1: 5 mins
   - Phase 2: 30 mins
   - Phase 3: 15 mins
   - Phase 4: 30 mins
   - Phase 5: 20 mins
   - **TOTAL: ~2 hours**

---

## Go/No-Go Decision

### GO Conditions (All must be true)
- [x] Git repo is clean (no uncommitted changes)
- [x] Last build was successful
- [x] All tests passing
- [x] User approves cleanup plan

### NO-GO Conditions (Stop if any true)
- [ ] Uncommitted changes in git
- [ ] Recent build failures
- [ ] Data loss risk not mitigated
- [ ] User asks to hold off

---

**Ready to proceed?**

If YES, I will:
1. ✅ Create git backup branch
2. ✅ Systematically delete 10 redundant files
3. ✅ Rename/move remaining files
4. ✅ Update all imports
5. ✅ Create new React routing system
6. ✅ Build and test
7. ✅ Verify everything works

**Please confirm before I start!**
