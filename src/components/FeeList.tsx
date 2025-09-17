import React, { useState, useEffect } from 'react';
import { Fee } from '../types/Fee';
import { feeService } from '../services/feeService';

interface TabType {
  id: 'draft' | 'approved' | 'live';
  label: string;
}

const FeeList: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [activeTab, setActiveTab] = useState<'draft' | 'approved' | 'live'>('draft');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabTypes: TabType[] = [
    { id: 'draft', label: 'Draft' },
    { id: 'approved', label: 'Approved' },
    { id: 'live', label: 'Live' }
  ];

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const fetchedFees = await feeService.getFees();
      setFees(fetchedFees);
      setError(null);
    } catch (err) {
      setError('Failed to fetch fees');
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterFeesByTab = (status: string): Fee[] => {
    return fees.filter(fee => fee.status.toLowerCase() === status);
  };

  const handleTabChange = (tabId: 'draft' | 'approved' | 'live') => {
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Fee Management</h2>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs" id="feeTabs" role="tablist">
        {tabTypes.map((tab) => (
          <li className="nav-item" role="presentation" key={tab.id}>
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              id={`${tab.id}-tab`}
              data-bs-toggle="tab"
              data-bs-target={`#${tab.id}`}
              type="button"
              role="tab"
              aria-controls={tab.id}
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      <div className="tab-content mt-3" id="feeTabsContent">
        {tabTypes.map((tab) => (
          <div
            key={tab.id}
            className={`tab-pane fade ${activeTab === tab.id ? 'show active' : ''}`}
            id={tab.id}
            role="tabpanel"
            aria-labelledby={`${tab.id}-tab`}
            data-testid={`${tab.id}-fees`}
          >
            {filterFeesByTab(tab.id).length === 0 ? (
              <div className="text-center text-muted py-4">
                <p>No {tab.label.toLowerCase()} fees found.</p>
              </div>
            ) : (
              filterFeesByTab(tab.id).map((fee) => (
                <div key={fee.id} className="card mb-2">
                  <div className="card-body">
                    <h5 className="card-title">Fee ID: {fee.id}</h5>
                    <p className="card-text">Code: {fee.code}</p>
                    <p className="card-text">Value: £{parseFloat(fee.value).toFixed(2)}</p>
                    <p className="card-text">Status: {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}</p>
                    <p className="card-text">Description: {fee.description}</p>
                    <small className="text-muted">
                      Created: {new Date(fee.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="mt-3">
        <button
          className="btn btn-outline-primary"
          onClick={fetchFees}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Fees'}
        </button>
      </div>
    </div>
  );
};

export default FeeList;