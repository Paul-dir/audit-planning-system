import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, getAllRegions, getTaxCentersForRegion } from '../data/orgStructure';

function LoginForm() {
  const { login, loading, error: authError } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTaxCenter, setSelectedTaxCenter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [error, setError] = useState(null);

  const allUsers = getAllUsers();
  const allRegions = getAllRegions();
  const taxCentersForRegion = selectedRegion ? getTaxCentersForRegion(selectedRegion) : [];

  // Filter users by region and tax center if selected
  const getFilteredUsers = () => {
    return allUsers.filter(user => {
      // Show national users regardless of region/tax center selection
      if (user.org_context.level === 'national') {
        return true;
      }

      // If region selected, filter by region
      if (selectedRegion && user.org_context.assignedRegion !== selectedRegion) {
        return false;
      }

      // If tax center selected, filter by tax center
      if (selectedTaxCenter && user.org_context.assignedTaxCenter !== selectedTaxCenter) {
        return false;
      }

      return true;
    });
  };

  const filteredUsers = getFilteredUsers();

  // Get unique roles from filtered users
  const roles = [...new Set(filteredUsers.map(u => u.role))].sort();

  // Apply search and role filter to FILTERED users (not all users)
  const displayedUsers = filteredUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Auto-select first user
  useEffect(() => {
    if (displayedUsers.length > 0 && !selectedUser) {
      setSelectedUser(displayedUsers[0].id);
    }
  }, [displayedUsers, selectedUser]);

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    try {
      const user = allUsers.find(u => u.id === selectedUser);
      if (!user) {
        setError('User not found');
        return;
      }

      await login(user.email);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const currentUser = allUsers.find(u => u.id === selectedUser);

  const getRoleLabel = (role) => {
    const labels = {
      'audit_team': '🏢 Audit Planning Team',
      'audit_director': '👔 Audit Director',
      'regional_director': '🗺️ Regional Director',
      'tax_center_manager': '🏛️ Tax Center Manager',
      'team_leader': '👥 Team Leader',
      'auditor': '🔍 Auditor',
      'cascade_audit_team': '⚙️ Cascade Audit Team',
      'process_owner': '⚡ Process Owner',
      'senior_management': '🎖️ Senior Management'
    };
    return labels[role] || role;
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1c2128 0%, #0f1419 100%)',
        padding: '20px'
      }}
    >
      <div
        style={{
          background: '#1c2128',
          padding: '48px',
          borderRadius: '12px',
          border: '1px solid #30363d',
          width: '100%',
          maxWidth: '600px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <i
            className="fas fa-chart-line"
            style={{ fontSize: '32px', color: '#4caf50', marginBottom: '16px' }}
          ></i>
          <h1 style={{ margin: '16px 0 8px 0', fontSize: '24px', color: '#f0f6fc' }}>
            Audit Planning System
          </h1>
          <p style={{ color: '#0c4a6e', margin: '0 0 8px 0', fontSize: '12px', color: '#8b949e' }}>
            Ministry of Revenue - Ethiopia
          </p>
          <p style={{ color: '#0c4a6e', margin: 0, fontSize: '11px', color: '#4caf50', fontWeight: '600' }}>
            121 Users Loaded
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Step 1: Select Region */}
          <div style={{ marginBottom: '20px', padding: '16px', background: '#0f1419', borderRadius: '6px', border: '1px solid #30363d' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#f0f6fc',
                marginBottom: '8px',
              }}
            >
              <i className="fas fa-map-marker-alt"></i> Step 1: Select Region (Optional)
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedTaxCenter('');
                setSelectedUser(null);
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#1c2128',
                color: '#f0f6fc',
                fontSize: '13px',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <option value="">-- All Regions --</option>
              {allRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Tax Center (if region selected) */}
          {selectedRegion && taxCentersForRegion.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '16px', background: '#0f1419', borderRadius: '6px', border: '1px solid #30363d' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#f0f6fc',
                  marginBottom: '8px',
                }}
              >
                <i className="fas fa-building"></i> Step 2: Select Tax Center (Optional)
              </label>
              <select
                value={selectedTaxCenter}
                onChange={(e) => {
                  setSelectedTaxCenter(e.target.value);
                  setSelectedUser(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  background: '#1c2128',
                  color: '#f0f6fc',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- All Tax Centers --</option>
                {taxCentersForRegion.map(tc => (
                  <option key={tc} value={tc}>{tc}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Search & Filter Users */}
          <div style={{ marginBottom: '20px', padding: '16px', background: '#0f1419', borderRadius: '6px', border: '1px solid #30363d' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#f0f6fc',
                marginBottom: '8px',
              }}
            >
              <i className="fas fa-search"></i> Step 3: Search & Filter Users
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search by name or email..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#1c2128',
                color: '#f0f6fc',
                fontSize: '13px',
                boxSizing: 'border-box',
                marginBottom: '12px'
              }}
            />

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#1c2128',
                color: '#f0f6fc',
                fontSize: '12px',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{getRoleLabel(role)}</option>
              ))}
            </select>
          </div>

          {/* Step 4: User List */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#f0f6fc',
                marginBottom: '8px',
              }}
            >
              <i className="fas fa-users"></i> Step 4: Select User ({displayedUsers.length})
            </label>

            <div
              style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#0f1419',
              }}
            >
              {displayedUsers.length === 0 ? (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#8b949e',
                    fontSize: '12px',
                  }}
                >
                  No users found
                </div>
              ) : (
                displayedUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    style={{
                      padding: '12px',
                      cursor: 'pointer',
                      background: selectedUser === user.id ? '#30363d' : '#0f1419',
                      borderBottom: '1px solid #30363d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedUser !== user.id) {
                        e.currentTarget.style.background = '#1c2128';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedUser !== user.id) {
                        e.currentTarget.style.background = '#0f1419';
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                      }}
                    >
                      {(user.full_name || 'U').charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f6fc' }}>
                        {user.full_name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '2px' }}>
                        {user.org_context.title || user.role.replace(/_/g, ' ')}
                      </div>
                      {user.org_context.assignedRegion && (
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                          📍 {user.org_context.assignedRegion}
                          {user.org_context.assignedTaxCenter && ` → ${user.org_context.assignedTaxCenter}`}
                        </div>
                      )}
                    </div>

                    {selectedUser === user.id && (
                      <i className="fas fa-check-circle" style={{ color: '#4caf50', fontSize: '16px' }}></i>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected User Details */}
          {currentUser && (
            <div
              style={{
                background: '#0f1419',
                border: '2px solid #4caf50',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '12px',
              }}
            >
              <p style={{ color: '#0c4a6e', margin: '0 0 8px 0', color: '#8b949e', fontSize: '11px' }}>
                <strong>READY TO SIGN IN:</strong>
              </p>
              <p style={{ color: '#0c4a6e', margin: '0 0 4px 0', color: '#f0f6fc', fontSize: '14px', fontWeight: '600' }}>
                {currentUser.full_name}
              </p>
              <p style={{ color: '#0c4a6e', margin: '0 0 4px 0', color: '#8b949e', fontSize: '11px' }}>
                {currentUser.org_context.title || currentUser.role.replace(/_/g, ' ')}
              </p>
              {currentUser.org_context.assignedRegion && (
                <p style={{ color: '#0c4a6e', margin: '0 0 2px 0', color: '#8b949e', fontSize: '10px' }}>
                  📍 {currentUser.org_context.assignedRegion}
                  {currentUser.org_context.assignedTaxCenter && ` → ${currentUser.org_context.assignedTaxCenter}`}
                </p>
              )}
              {currentUser.org_context.auditType && (
                <p style={{ color: '#0c4a6e', margin: 0, color: '#8b949e', fontSize: '10px' }}>
                  📋 {currentUser.org_context.auditType}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {(authError || error) && (
            <div
              style={{
                background: '#2a1a1a',
                border: '1px solid #ff7b7b',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '12px',
                color: '#ff7b7b',
              }}
            >
              <i className="fas fa-exclamation-triangle"></i> {authError || error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || !selectedUser}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#555' : '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = '#45a049';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = '#4caf50';
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Signing In...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Sign In
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            fontSize: '11px',
            color: '#8b949e',
            textAlign: 'center',
            background: '#0f1419',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #30363d',
            lineHeight: '1.6'
          }}
        >
          <p style={{ color: '#0c4a6e', margin: '0 0 6px 0', fontWeight: '600', color: '#f0f6fc' }}>
            <i className="fas fa-info-circle"></i> Auto-Loaded Organization Context
          </p>
          <p style={{ color: '#0c4a6e', margin: 0, fontSize: '10px' }}>
            Each user's region, tax center, and audit type are automatically loaded from their profile. No manual selection needed!
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
