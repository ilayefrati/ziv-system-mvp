import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { driversApi } from '../api/client';

interface Driver {
  id: number;
  identity_card: string;
  company_id?: number;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  license_class?: string;
  license_expiry_date?: string;
  traffic_info_expiry_date?: string;
  address?: string;
  phone_mobile?: string;
  phone_home?: string;
  job_title?: string;
  work_location?: string;
  marital_status?: string;
  birth_date?: string;
  employment_start_date?: string;
  education?: string;
  was_license_revoked?: boolean;
  has_hazardous_materials_permit?: boolean;
  has_crane_operation_permit?: boolean;
  personal_number_in_company?: string;
  email?: string;
  notes?: string;
  vehicle_id?: number;
  vehicle_plate?: string;
}

type TabType = 'info' | 'files';

const DriverDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Driver>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDriver();
    }
  }, [id]);

  const fetchDriver = async () => {
    try {
      const response = await driversApi.getById(Number(id));
      setDriver(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching driver:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || undefined
    }));
    setError(null);
  };

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
    setError(null);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || undefined
    }));
    setError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(driver || {});
    setError(null);
  };

  const handleSave = async () => {
    if (!driver) return;
    
    setSaving(true);
    setError(null);

    try {
      const response = await driversApi.update(driver.id, formData);
      setDriver(response.data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update driver');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="page-container">
        <div className="loading">Driver not found</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/drivers" className="breadcrumb-link">Drivers</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Driver'}</span>
        </div>

        {/* Driver Header */}
        <div className="company-header">
          <div>
            <h1 className="company-title">{driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unnamed Driver'}</h1>
            <p className="company-id">ID: {driver.identity_card}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'info' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Info
            </button>
            <button
              className={`tab ${activeTab === 'files' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              Uploaded files
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="tab-content">
            {error && <div className="form-error">{error}</div>}
            
            <div className="info-tab-header">
              <h2 className="section-title">Driver Details</h2>
              {!isEditing ? (
                <button className="btn btn-primary" onClick={handleEdit}>
                  <span className="btn-text">Update</span>
                </button>
              ) : (
                <div className="company-actions">
                  <button className="btn btn-secondary" onClick={handleCancel} disabled={saving}>
                    <span className="btn-text">Cancel</span>
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <span className="btn-text">{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="company-details-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Identity Card *</label>
                  <input
                    type="text"
                    name="identity_card"
                    className="form-input"
                    value={formData.identity_card || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-input"
                    value={formData.first_name || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-input"
                    value={formData.last_name || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">License Class</label>
                  <input
                    type="text"
                    name="license_class"
                    className="form-input"
                    value={formData.license_class || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">License Expiry Date</label>
                  <input
                    type="date"
                    name="license_expiry_date"
                    className="form-input"
                    value={formData.license_expiry_date ? formData.license_expiry_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Traffic Info Expiry Date</label>
                  <input
                    type="date"
                    name="traffic_info_expiry_date"
                    className="form-input"
                    value={formData.traffic_info_expiry_date ? formData.traffic_info_expiry_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <h2 className="section-title">Contact Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Phone</label>
                  <input
                    type="text"
                    name="phone_mobile"
                    className="form-input"
                    value={formData.phone_mobile || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Home Phone</label>
                  <input
                    type="text"
                    name="phone_home"
                    className="form-input"
                    value={formData.phone_home || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <h2 className="section-title">Employment Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    name="job_title"
                    className="form-input"
                    value={formData.job_title || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Location</label>
                  <input
                    type="text"
                    name="work_location"
                    className="form-input"
                    value={formData.work_location || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Personal Number in Company</label>
                  <input
                    type="text"
                    name="personal_number_in_company"
                    className="form-input"
                    value={formData.personal_number_in_company || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Employment Start Date</label>
                  <input
                    type="date"
                    name="employment_start_date"
                    className="form-input"
                    value={formData.employment_start_date ? formData.employment_start_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <h2 className="section-title">Personal Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Birth Date</label>
                  <input
                    type="date"
                    name="birth_date"
                    className="form-input"
                    value={formData.birth_date ? formData.birth_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Marital Status</label>
                  <input
                    type="text"
                    name="marital_status"
                    className="form-input"
                    value={formData.marital_status || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Education</label>
                  <input
                    type="text"
                    name="education"
                    className="form-input"
                    value={formData.education || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group"></div>
              </div>

              <h2 className="section-title">Permits & Status</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label checkbox-label">
                    <input
                      type="checkbox"
                      name="was_license_revoked"
                      checked={formData.was_license_revoked || false}
                      onChange={handleBooleanChange}
                      disabled={!isEditing}
                      className="form-checkbox"
                    />
                    <span>Was License Revoked</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label checkbox-label">
                    <input
                      type="checkbox"
                      name="has_hazardous_materials_permit"
                      checked={formData.has_hazardous_materials_permit || false}
                      onChange={handleBooleanChange}
                      disabled={!isEditing}
                      className="form-checkbox"
                    />
                    <span>Has Hazardous Materials Permit</span>
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label checkbox-label">
                    <input
                      type="checkbox"
                      name="has_crane_operation_permit"
                      checked={formData.has_crane_operation_permit || false}
                      onChange={handleBooleanChange}
                      disabled={!isEditing}
                      className="form-checkbox"
                    />
                    <span>Has Crane Operation Permit</span>
                  </label>
                </div>
                <div className="form-group"></div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    className="form-input form-textarea"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="tab-content">
            <h2 className="section-title">Uploaded Files</h2>
            <div className="empty-state">File upload functionality coming soon.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDetailsPage;
