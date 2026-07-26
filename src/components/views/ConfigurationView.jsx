import React, { useState } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { auditConfig } from '../../config/auditConfig';
import { clearAllPlans, resetAllData, loadData, saveData } from '../../utils/data';

/**
 * ConfigurationView
 * System-wide configuration interface with tabs for managing audit types, tax types,
 * industries, taxpayer categories, skills, regions, risk indicators, standards,
 * workflow settings, risk thresholds, feature flags, and data management.
 * Design: Dark theme with organized tabs for different configuration modules.
 * Styling: 100% Tailwind CSS with dark mode support.
 */

function ConfigurationView() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);

  const renderOverview = () => {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8 pl-4 border-l-4 border-gold dark:border-gold">
          <h2 className="text-3xl font-bold text-text-hi dark:text-text-hi">
            <i className="fas fa-cog mr-3"></i> Configuration & Standards Management
          </h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-hi dark:text-text-hi mb-4 flex items-center gap-2">
            <i className="fas fa-th-large text-gold dark:text-gold"></i> Configuration Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'audit-types', icon: 'fas fa-tasks', title: 'Audit Types', count: auditConfig.auditTypes.length },
              { id: 'tax-types', icon: 'fas fa-percent', title: 'Tax Types', count: auditConfig.taxTypes.length },
              { id: 'industries', icon: 'fas fa-industry', title: 'Industries', count: auditConfig.industries.length },
              { id: 'taxpayer-categories', icon: 'fas fa-users', title: 'Taxpayer Categories', count: auditConfig.taxpayerCategories.length },
              { id: 'skills', icon: 'fas fa-graduation-cap', title: 'Skills', count: auditConfig.skills.length },
              { id: 'regions', icon: 'fas fa-map', title: 'Regions & Tax Centers', desc: `${auditConfig.regions.length} regions, ${auditConfig.taxCenters.length} tax centers` },
              { id: 'risk-indicators', icon: 'fas fa-exclamation-circle', title: 'Risk Indicators', count: auditConfig.riskIndicators.length },
              { id: 'standards', icon: 'fas fa-certificate', title: 'Audit Standards', desc: 'Quality & compliance standards' },
              { id: 'workflow', icon: 'fas fa-sitemap', title: 'Workflow Configuration', desc: 'Approval process & deadlines' },
              { id: 'risk-thresholds', icon: 'fas fa-sliders-h', title: 'Risk Thresholds', desc: 'Critical, High, Medium risk levels' },
              { id: 'feature-flags', icon: 'fas fa-toggle-on', title: 'Feature Flags', desc: 'Enable/disable system capabilities' },
              { id: 'data-management', icon: 'fas fa-database', title: 'Data Management', desc: 'Clear plans, reset data' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-4 border rounded-sm text-left cursor-pointer transition-all ${
                  item.id === 'data-management'
                    ? 'bg-ink dark:bg-ink border-gold dark:border-gold hover:bg-panel dark:hover:bg-panel'
                    : 'bg-panel dark:bg-panel-dark border-border dark:border-border-dark hover:bg-border dark:hover:bg-border-dark'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-text-hi dark:text-text-hi font-semibold flex items-center gap-2">
                      <i className={item.icon}></i> {item.title}
                    </h3>
                    <p className="text-text-mid dark:text-text-mid text-sm mt-1">
                      {item.count !== undefined ? `${item.count} configured` : item.desc}
                    </p>
                  </div>
                  <i className={`fas fa-chevron-right text-text-mid dark:text-text-mid ${item.id === 'data-management' ? 'text-coral dark:text-coral' : ''}`}></i>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-500 dark:border-blue-600 rounded-sm p-4 text-blue-900 dark:text-blue-100">
          <strong className="text-blue-900 dark:text-blue-100">
            <i className="fas fa-info-circle mr-2"></i> Information
          </strong>
          <p className="text-sm leading-relaxed mt-2">
            Click on any module to view and manage its configuration. All changes apply system-wide immediately.
          </p>
        </div>
      </div>
    );
  };

  const renderAuditTypes = () => {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className="px-4 py-2 border border-border dark:border-border-dark rounded-sm bg-panel dark:bg-panel-dark text-text-hi dark:text-text-hi hover:bg-border dark:hover:bg-border-dark transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back
          </button>
          <button 
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-gold dark:bg-gold text-ink dark:text-ink rounded-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <i className="fas fa-edit mr-2"></i> {editMode ? 'Done Editing' : 'Edit Configuration'}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-8 pl-4 border-l-4 border-gold dark:border-gold">
          <h2 className="text-3xl font-bold text-text-hi dark:text-text-hi">
            <i className="fas fa-tasks mr-3"></i> Audit Types Configuration
          </h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="overflow-x-auto border border-border dark:border-border-dark rounded-sm mb-6">
          <table className="w-full text-sm">
            <thead className="bg-panel dark:bg-panel-dark border-b border-border dark:border-border-dark">
              <tr>
                <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">Audit Type</th>
                <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">Effort Hours</th>
                <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">Complexity</th>
                <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">Required Skills</th>
                <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">Description</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.auditTypes.map((type, i) => (
                <tr key={i} className="border-b border-border dark:border-border-dark hover:bg-panel dark:hover:bg-panel-dark">
                  <td className="px-4 py-3"><strong className="text-text-hi dark:text-text-hi">{type.name}</strong></td>
                  <td className="px-4 py-3 text-text-hi dark:text-text-hi">{type.effortPerCase}h</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-sm text-xs font-bold text-white ${
                      type.complexity === 'Low' ? 'bg-success dark:bg-success' :
                      type.complexity === 'Medium' ? 'bg-info dark:bg-info' : 'bg-danger dark:bg-danger'
                    }`}>
                      {type.complexity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-hi dark:text-text-hi text-sm">{type.skillsRequired.join(', ')}</td>
                  <td className="px-4 py-3 text-text-mid dark:text-text-mid text-sm">{type.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-ink dark:bg-ink border border-border dark:border-border-dark rounded-sm p-4">
          <strong className="text-warning dark:text-warning">⚠️ Edit Mode Disabled</strong>
          <p className="text-text-mid dark:text-text-mid text-sm mt-2">
            To edit audit types, modify src/config/auditConfig.js directly. Changes take effect immediately after reload.
          </p>
        </div>
      </div>
    );
  };

  const renderTaxTypes = () => {
    return (
      <div>
        <button 
          onClick={() => setActiveTab('overview')}
          className="mb-6 px-4 py-2 border border-border dark:border-border-dark rounded-sm bg-panel dark:bg-panel-dark text-text-hi dark:text-text-hi hover:bg-border dark:hover:bg-border-dark transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back
        </button>

        <div className="flex items-center gap-3 mb-8 pl-4 border-l-4 border-gold dark:border-gold">
          <h2 className="text-3xl font-bold text-text-hi dark:text-text-hi">
            <i className="fas fa-percent mr-3"></i> Tax Types Configuration
          </h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="overflow-x-auto border border-border dark:border-border-dark rounded-sm">
          <table className="w-full text-sm">
            <thead className="bg-panel dark:bg-panel-dark border-b border-border dark:border-border-dark">
              <tr>
                <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">Tax Type</th>
                <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">Risk Weight</th>
                <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">Compliance %</th>
                <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">Priority</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.taxTypes.map((tax, i) => (
                <tr key={i} className="border-b border-border dark:border-border-dark hover:bg-panel dark:hover:bg-panel-dark">
                  <td className="px-4 py-3"><strong className="text-text-hi dark:text-text-hi">{tax.name}</strong></td>
                  <td className="px-4 py-3 text-text-hi dark:text-text-hi">{tax.riskWeight}x</td>
                  <td className="px-4 py-3 text-text-hi dark:text-text-hi">{tax.compliance}%</td>
                  <td className="px-4 py-3">
                    <span className="text-text-hi dark:text-text-hi">
                      {tax.riskWeight > 1.2 ? '🔴 Critical' :
                        tax.riskWeight > 1.0 ? '🟠 High' :
                        tax.riskWeight > 0.9 ? '🟡 Medium' : '🟢 Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDataManagement = () => {
    const data = loadData();
    const planCount = data.plans?.length || 0;

    const handleClearPlans = () => {
      if (planCount === 0) {
        alert('No plans to delete.');
        return;
      }
      if (window.confirm(`⚠️ DELETE ${planCount} PLAN${planCount !== 1 ? 'S' : ''}? This cannot be undone!\n\nAll created audit plans will be permanently removed.`)) {
        try {
          console.log('Clearing all plans...');
          clearAllPlans();
          console.log('✅ Plans cleared successfully');
          alert(`✅ All ${planCount} plan${planCount !== 1 ? 's' : ''} deleted successfully!\n\nPage will refresh now...`);
          setTimeout(() => {
            console.log('Reloading page...');
            window.location.reload();
          }, 1000);
        } catch (e) {
          console.error('Error:', e);
          alert('❌ Error deleting plans: ' + e.message);
        }
      }
    };

    const handleResetAll = () => {
      if (window.confirm('⚠️ RESET ALL DATA to defaults? This cannot be undone!\n\nYou will lose:\n- All created audit plans\n- All feedback data\n- All allocations\n- All system configurations (will reset to defaults)')) {
        try {
          console.log('Resetting all data...');
          resetAllData();
          console.log('✅ Data reset successfully');
          alert('✅ All data reset to defaults!\n\nPage will refresh now...');
          setTimeout(() => {
            console.log('Reloading page...');
            window.location.reload();
          }, 1000);
        } catch (e) {
          console.error('Error:', e);
          alert('❌ Error resetting data: ' + e.message);
        }
      }
    };

    const handleExportData = () => {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-planning-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      alert('✅ Data exported successfully!');
    };

    return (
      <div>
        <button 
          onClick={() => setActiveTab('overview')}
          className="mb-6 px-4 py-2 border border-border dark:border-border-dark rounded-sm bg-panel dark:bg-panel-dark text-text-hi dark:text-text-hi hover:bg-border dark:hover:bg-border-dark transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back
        </button>

        <div className="flex items-center gap-3 mb-8 pl-4 border-l-4 border-gold dark:border-gold">
          <h2 className="text-3xl font-bold text-text-hi dark:text-text-hi">
            <i className="fas fa-database mr-3"></i> Data Management
          </h2>
          <Badge status="Advanced Options" className="director-approved" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card title="Total Plans" number={planCount} icon="fas fa-file-contract" />
          <Card title="Storage Size" number={`${(new Blob([JSON.stringify(data)]).size / 1024).toFixed(1)} KB`} icon="fas fa-hdd" />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-hi dark:text-text-hi mb-4 flex items-center gap-2">
            <i className="fas fa-tools text-gold dark:text-gold"></i> Data Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Delete Plans */}
            <div className="bg-ink dark:bg-ink border-2 border-danger dark:border-danger rounded-sm p-6 text-center">
              <i className="fas fa-trash-alt text-danger dark:text-danger text-4xl mb-4 block"></i>
              <h3 className="text-danger dark:text-danger font-semibold mb-2">Delete All Plans</h3>
              <p className="text-text-mid dark:text-text-mid text-sm mb-4">
                Remove all {planCount} created plans. Keep system data intact.
              </p>
              <button
                onClick={handleClearPlans}
                disabled={planCount === 0}
                className={`w-full px-4 py-2 rounded-sm font-semibold text-ink dark:text-ink border-none cursor-pointer transition-opacity ${
                  planCount === 0 
                    ? 'bg-text-mid dark:bg-text-mid opacity-50 cursor-not-allowed' 
                    : 'bg-danger dark:bg-danger hover:opacity-90'
                }`}
              >
                <i className="fas fa-trash mr-2"></i> {planCount > 0 ? `Delete ${planCount} Plan${planCount !== 1 ? 's' : ''}` : 'No Plans'}
              </button>
            </div>

            {/* Reset All */}
            <div className="bg-ink dark:bg-ink border-2 border-info dark:border-info rounded-sm p-6 text-center">
              <i className="fas fa-redo text-warning dark:text-warning text-4xl mb-4 block"></i>
              <h3 className="text-info dark:text-info font-semibold mb-2">Reset All Data</h3>
              <p className="text-text-mid dark:text-text-mid text-sm mb-4">
                Reset entire system to default state including all plans and data.
              </p>
              <button
                onClick={handleResetAll}
                className="w-full px-4 py-2 bg-info dark:bg-info text-ink dark:text-ink rounded-sm font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity"
              >
                <i className="fas fa-sync mr-2"></i> Reset All
              </button>
            </div>

            {/* Export Data */}
            <div className="bg-blue-50 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-600 rounded-sm p-6 text-center">
              <i className="fas fa-download text-info dark:text-info text-4xl mb-4 block"></i>
              <h3 className="text-info dark:text-info font-semibold mb-2">Export Data</h3>
              <p className="text-blue-900 dark:text-blue-100 text-sm mb-4">
                Download all system data as JSON file for backup.
              </p>
              <button
                onClick={handleExportData}
                className="w-full px-4 py-2 bg-info dark:bg-info text-ink dark:text-ink rounded-sm font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity"
              >
                <i className="fas fa-download mr-2"></i> Export
              </button>
            </div>
          </div>
        </div>

        <div className="bg-danger dark:bg-danger bg-opacity-10 border-2 border-danger dark:border-danger rounded-sm p-4">
          <strong className="text-danger dark:text-danger">
            <i className="fas fa-exclamation-triangle mr-2"></i> WARNING
          </strong>
          <p className="text-danger dark:text-danger text-sm leading-relaxed mt-2">
            ⚠️ These operations are DESTRUCTIVE and CANNOT BE UNDONE. Please be careful!<br/>
            • Deleting plans will remove all created audit plans<br/>
            • Resetting data will erase everything including plans, feedback, and allocations
          </p>
        </div>
      </div>
    );
  };

  // Render other config sections (simplified)
  const renderPlaceholder = (title, icon) => (
    <div>
      <button 
        onClick={() => setActiveTab('overview')}
        className="mb-6 px-4 py-2 border border-border dark:border-border-dark rounded-sm bg-panel dark:bg-panel-dark text-text-hi dark:text-text-hi hover:bg-border dark:hover:bg-border-dark transition-colors"
      >
        <i className="fas fa-arrow-left mr-2"></i> Back
      </button>
      <div className="flex items-center gap-3 mb-8 pl-4 border-l-4 border-gold dark:border-gold">
        <h2 className="text-3xl font-bold text-text-hi dark:text-text-hi">
          <i className={`${icon} mr-3`}></i> {title}
        </h2>
        <Badge status="System Configuration" className="director-approved" />
      </div>
      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-sm p-8 text-center text-text-mid dark:text-text-mid">
        <p>Configuration table for {title.toLowerCase()} will be displayed here</p>
      </div>
    </div>
  );

  // Render appropriate view based on active tab
  switch (activeTab) {
    case 'audit-types':
      return renderAuditTypes();
    case 'tax-types':
      return renderTaxTypes();
    case 'industries':
      return renderPlaceholder('Industries Configuration', 'fas fa-industry');
    case 'taxpayer-categories':
      return renderPlaceholder('Taxpayer Categories Configuration', 'fas fa-users');
    case 'skills':
      return renderPlaceholder('Skills Configuration', 'fas fa-graduation-cap');
    case 'regions':
      return renderPlaceholder('Regions & Tax Centers Configuration', 'fas fa-map');
    case 'risk-indicators':
      return renderPlaceholder('Risk Indicators Configuration', 'fas fa-exclamation-circle');
    case 'standards':
      return renderPlaceholder('Audit Quality Standards', 'fas fa-certificate');
    case 'workflow':
      return renderPlaceholder('Workflow Configuration', 'fas fa-sitemap');
    case 'risk-thresholds':
      return renderPlaceholder('Risk & Compliance Thresholds', 'fas fa-sliders-h');
    case 'feature-flags':
      return renderPlaceholder('Feature Flags', 'fas fa-toggle-on');
    case 'data-management':
      return renderDataManagement();
    default:
      return renderOverview();
  }
}

export default ConfigurationView;
