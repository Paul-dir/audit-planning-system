# Configuration Dashboard - Modern Icon Guide

**Date:** July 27, 2026  
**Icon Library:** Heroicons / Lucide Icons (Modern, Professional)  
**Icon Size:** 32px × 32px  
**Stroke Width:** 1.75px  

---

## 🎨 Module Icons (Modern & Beautiful)

### 1. Audit Types
**Icon:** BarChart3 (or BarChartAlt)
- **Meaning:** Represents different audit type classifications
- **Visual:** Three vertical bars of varying heights
- **Lucide Name:** `bar-chart-3`
- **Color:** Inherits from status (🟢 #238636, 🟡 #d29922, 🔴 #da3633)

```jsx
<BarChart3 size={32} strokeWidth={1.75} />
```

---

### 2. Tax Types
**Icon:** Briefcase (or ShoppingBag)
- **Meaning:** Business/tax-related classifications
- **Visual:** Professional briefcase or business bag
- **Lucide Name:** `briefcase` or `shopping-bag`
- **Color:** Status color

```jsx
<Briefcase size={32} strokeWidth={1.75} />
```

---

### 3. Industries
**Icon:** Building2 (or Factory)
- **Meaning:** Industrial sectors and classifications
- **Visual:** Modern building or factory
- **Lucide Name:** `building-2` or `factory`
- **Color:** Status color

```jsx
<Building2 size={32} strokeWidth={1.75} />
```

---

### 4. Taxpayer Categories
**Icon:** Users (or Network)
- **Meaning:** Groups of people/taxpayers
- **Visual:** Multiple connected users
- **Lucide Name:** `users` or `network`
- **Color:** Status color

```jsx
<Users size={32} strokeWidth={1.75} />
```

---

### 5. Skills
**Icon:** Award (or Badge, Zap)
- **Meaning:** Competencies, achievements, capabilities
- **Visual:** Award ribbon or badge
- **Lucide Name:** `award` or `badge`
- **Color:** Status color

```jsx
<Award size={32} strokeWidth={1.75} />
```

---

### 6. Regions & Tax Centers
**Icon:** Globe2 (or Map, MapPin)
- **Meaning:** Geographic distribution and locations
- **Visual:** World globe or map
- **Lucide Name:** `globe-2` or `map`
- **Color:** Status color

```jsx
<Globe2 size={32} strokeWidth={1.75} />
```

---

### 7. Risk Indicators
**Icon:** AlertTriangle (or AlertOctagon, Shield)
- **Meaning:** Risk warnings and alerts
- **Visual:** Triangle or octagon alert
- **Lucide Name:** `alert-triangle` or `shield`
- **Color:** Status color

```jsx
<AlertTriangle size={32} strokeWidth={1.75} />
```

---

### 8. Audit Standards
**Icon:** CheckCircle2 (or CheckSquare, Flag)
- **Meaning:** Quality standards and compliance
- **Visual:** Checkmark in circle
- **Lucide Name:** `check-circle-2` or `flag`
- **Color:** Status color

```jsx
<CheckCircle2 size={32} strokeWidth={1.75} />
```

---

### 9. Workflow & Approval
**Icon:** GitBranch (or GitFlow, ArrowRightLeft)
- **Meaning:** Process flows and approval chains
- **Visual:** Git branch diagram
- **Lucide Name:** `git-branch` or `arrow-right-left`
- **Color:** Status color

```jsx
<GitBranch size={32} strokeWidth={1.75} />
```

---

### 10. Feature Flags
**Icon:** ToggleLeft (or Switch, Power)
- **Meaning:** System toggles and controls
- **Visual:** Modern toggle/switch control
- **Lucide Name:** `toggle-left` or `power`
- **Color:** Status color

```jsx
<ToggleLeft size={32} strokeWidth={1.75} />
```

---

### 11. National KPI
**Icon:** Gauge (or TrendingUp, BarChart4)
- **Meaning:** Metrics, performance measurement
- **Visual:** Speedometer or trending chart
- **Lucide Name:** `gauge` or `trending-up`
- **Color:** Status color

```jsx
<Gauge size={32} strokeWidth={1.75} />
```

---

### 12. Data Management
**Icon:** Database (or Server, HardDrive)
- **Meaning:** Data storage and management
- **Visual:** Database cylinder or server
- **Lucide Name:** `database` or `server`
- **Color:** Status color

```jsx
<Database size={32} strokeWidth={1.75} />
```

---

## 📦 Icon Library Installation

### Option 1: Lucide React (Recommended)
```bash
npm install lucide-react
```

**Usage:**
```jsx
import { BarChart3, Briefcase, Building2, Users, Award, Globe2, AlertTriangle, CheckCircle2, GitBranch, ToggleLeft, Gauge, Database } from 'lucide-react';
```

### Option 2: Heroicons React
```bash
npm install @heroicons/react
```

**Usage:**
```jsx
import { BarChart3Icon, BriefcaseIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
```

### Option 3: React Icons (Comprehensive)
```bash
npm install react-icons
```

**Usage:**
```jsx
import { BiBarChart, BiBriefcase, BiBuilding, BiGroup } from 'react-icons/bi';
```

---

## 🎯 Icon Usage in Component

### ModuleCard Component Pattern
```jsx
import { BarChart3 } from 'lucide-react';

function ModuleCard({ module, status }) {
  const getIcon = () => {
    const icons = {
      'audit_types': BarChart3,
      'tax_types': Briefcase,
      'industries': Building2,
      'taxpayer_categories': Users,
      'skills': Award,
      'regions': Globe2,
      'risk_indicators': AlertTriangle,
      'audit_standards': CheckCircle2,
      'workflow': GitBranch,
      'feature_flags': ToggleLeft,
      'national_kpi': Gauge,
      'data_management': Database
    };
    
    const IconComponent = icons[module.id];
    const statusColor = {
      'active': '#238636',
      'partial': '#d29922',
      'attention': '#da3633'
    }[status];
    
    return <IconComponent size={32} color={statusColor} strokeWidth={1.75} />;
  };
  
  return (
    <div className="module-card">
      <div className="icon-wrapper">
        {getIcon()}
      </div>
      <h3 className="module-title">{module.name}</h3>
      <p className="module-count">Configure {module.count} Items</p>
      <div className="status-badge">
        {status === 'active' && '🟢 ACTIVE'}
        {status === 'partial' && '🟡 IN PROGRESS'}
        {status === 'attention' && '🔴 NEEDS ATTENTION'}
      </div>
      <button className="action-button">→ Configure</button>
    </div>
  );
}
```

---

## 🎨 Icon Styling Rules

### Base Icon Style
```css
.module-icon {
  width: 32px;
  height: 32px;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
  color: inherit;
}
```

### Status Color Mapping
```css
/* Active - Green */
.icon-active {
  color: #238636;
}

/* Partial - Yellow */
.icon-partial {
  color: #d29922;
}

/* Needs Attention - Red */
.icon-attention {
  color: #da3633;
}
```

### Hover Effect
```css
.module-card:hover .module-icon {
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.4));
  transform: scale(1.1);
  transition: all 250ms ease;
}
```

---

## 📋 Icon Mapping Table

| Module | Icon | Lucide Name | Meaning |
|--------|------|-------------|---------|
| Audit Types | 📊 | bar-chart-3 | Categorization |
| Tax Types | 💼 | briefcase | Business |
| Industries | 🏢 | building-2 | Sectors |
| Taxpayer Categories | 👥 | users | Groups |
| Skills | 🏆 | award | Achievement |
| Regions & Tax Centers | 🌍 | globe-2 | Geography |
| Risk Indicators | ⚠️ | alert-triangle | Warning |
| Audit Standards | ✓ | check-circle-2 | Quality |
| Workflow & Approval | 🔀 | git-branch | Process |
| Feature Flags | ⚙️ | toggle-left | Control |
| National KPI | 📈 | gauge | Metrics |
| Data Management | 💾 | database | Storage |

---

## 🌟 Visual Examples

### Icon in Active Card
```
┌─────────────────────────────────┐
│                                 │
│    [📊] (Green #238636)         │
│                                 │
│  Audit Types                    │
│  Configure 6 Types              │
│                                 │
│  🟢 ACTIVE                      │
│                                 │
│  [→ Configure]                  │
└─────────────────────────────────┘
```

### Icon in Partial Card
```
┌─────────────────────────────────┐
│                                 │
│    [💼] (Yellow #d29922)        │
│                                 │
│  Tax Types                      │
│  Configure 7 Types              │
│                                 │
│  🟡 PARTIAL                     │
│                                 │
│  [→ Configure]                  │
└─────────────────────────────────┘
```

### Icon in Alert Card
```
┌─────────────────────────────────┐
│                                 │
│    [⚠️] (Red #da3633)           │
│                                 │
│  Risk Indicators                │
│  Configure 10 Items             │
│                                 │
│  🔴 NEEDS ATTENTION             │
│                                 │
│  [→ Configure]                  │
└─────────────────────────────────┘
```

---

## ✨ Icon Animation Examples

### Hover Scale & Glow
```jsx
const iconVariants = {
  hover: {
    scale: 1.1,
    filter: "drop-shadow(0 0 12px rgba(249, 115, 22, 0.4))"
  }
};
```

### Subtle Pulse (On Load)
```jsx
const pulseVariants = {
  animate: {
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity
    }
  }
};
```

### Rotation on Hover
```jsx
const rotateVariants = {
  hover: {
    rotate: 10,
    transition: { duration: 300 }
  }
};
```

---

## 🎓 Implementation Checklist

- [ ] Install Lucide React or Heroicons
- [ ] Import icons in ModuleCard component
- [ ] Map module IDs to icon components
- [ ] Apply status color to icons
- [ ] Add hover glow effect
- [ ] Add icon animation on mount
- [ ] Test on all device sizes
- [ ] Verify accessibility (aria-label)
- [ ] Confirm 32px size at 1.75px stroke
- [ ] Document icon usage in code comments

---

**Ready to implement beautiful modern icons in your Configuration Dashboard!** 🚀
