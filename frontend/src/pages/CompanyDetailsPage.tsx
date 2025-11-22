import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { companiesApi } from '../api/client';

interface Company {
  id: number;
  identity_card: string;
  name: string;
  address?: string;
  po_box?: string;
  phone?: string;
  fax?: string;
  contact_person?: string;
  contact_phone?: string;
  manager_name?: string;
  manager_phone?: string;
  manager_id?: string;
  email?: string;
  safety_officer?: string;
  carrier_license_expiry?: string;
  established_date?: string;
  inspection_week?: number;
  notes?: string;
  vehicles_count: number;
  drivers_count: number;
}

interface Vehicle {
  id: number;
  license_plate: string;
  manufacturer?: string;
  model?: string;
  car_type?: string;
  production_year?: number;
  assigned_driver_id?: number;
  driver_name?: string;
  license_expiry_date?: string;
  is_operational?: boolean;
}

interface Driver {
  id: number;
  identity_card: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  license_class?: string;
  license_expiry_date?: string;
  phone_mobile?: string;
  email?: string;
  vehicle_id?: number;
  vehicle_plate?: string;
}

type TabType = 'info' | 'vehicles' | 'drivers' | 'files';

const CompanyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === 'vehicles') {
      fetchVehicles();
    }
  }, [id, activeTab]);

  useEffect(() => {
    if (id && activeTab === 'drivers') {
      fetchDrivers();
    }
  }, [id, activeTab]);

  const fetchCompany = async () => {
    try {
      const response = await companiesApi.getById(Number(id));
      setCompany(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const response = await companiesApi.getVehicles(Number(id));
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const fetchDrivers = async () => {
    setDriversLoading(true);
    try {
      const response = await companiesApi.getDrivers(Number(id));
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setDriversLoading(false);
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? parseInt(value) : undefined
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
    setFormData(company || {});
    setError(null);
  };

  const handleSave = async () => {
    if (!company) return;
    
    setSaving(true);
    setError(null);

    try {
      const response = await companiesApi.update(company.id, formData);
      setCompany(response.data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update company');
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

  if (!company) {
    return (
      <div className="page-container">
        <div className="loading">Company not found</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/companies" className="breadcrumb-link">Companies</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{company.name || 'Company Details'}</span>
        </div>

        {/* Company Header */}
        <div className="company-header">
          <div>
            <h1 className="company-title">{company.name || 'Unnamed Company'}</h1>
            <p className="company-id">ID: {company.identity_card}</p>
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
              className={`tab ${activeTab === 'vehicles' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('vehicles')}
            >
              Vehicles
            </button>
            <button
              className={`tab ${activeTab === 'drivers' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('drivers')}
            >
              Drivers
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
              <h2 className="section-title">Company Details</h2>
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
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

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
                  <label className="form-label">P.O. Box</label>
                  <input
                    type="text"
                    name="po_box"
                    className="form-input"
                    value={formData.po_box || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fax</label>
                  <input
                    type="text"
                    name="fax"
                    className="form-input"
                    value={formData.fax || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label className="form-label">Safety Officer</label>
                  <input
                    type="text"
                    name="safety_officer"
                    className="form-input"
                    value={formData.safety_officer || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <h2 className="section-title">Contact Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    name="contact_person"
                    className="form-input"
                    value={formData.contact_person || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    name="contact_phone"
                    className="form-input"
                    value={formData.contact_phone || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <h2 className="section-title">Manager Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Manager Name</label>
                  <input
                    type="text"
                    name="manager_name"
                    className="form-input"
                    value={formData.manager_name || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Manager ID</label>
                  <input
                    type="text"
                    name="manager_id"
                    className="form-input"
                    value={formData.manager_id || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Manager Phone</label>
                  <input
                    type="text"
                    name="manager_phone"
                    className="form-input"
                    value={formData.manager_phone || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group"></div>
              </div>

              <h2 className="section-title">Additional Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Carrier License Expiry</label>
                  <input
                    type="date"
                    name="carrier_license_expiry"
                    className="form-input"
                    value={formData.carrier_license_expiry ? formData.carrier_license_expiry.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Established Date</label>
                  <input
                    type="date"
                    name="established_date"
                    className="form-input"
                    value={formData.established_date ? formData.established_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Inspection Week</label>
                  <input
                    type="number"
                    name="inspection_week"
                    className="form-input"
                    value={formData.inspection_week || ''}
                    onChange={handleNumberChange}
                    readOnly={!isEditing}
                    min="1"
                    max="52"
                  />
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

        {activeTab === 'vehicles' && (
          <div className="tab-content">
            <h2 className="section-title">Vehicles</h2>
            {vehiclesLoading ? (
              <div className="loading">Loading vehicles...</div>
            ) : vehicles.length === 0 ? (
              <div className="empty-state">No vehicles found for this company.</div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>License Plate</th>
                      <th>Manufacturer</th>
                      <th>Model</th>
                      <th>Type</th>
                      <th>Year</th>
                      <th>Driver</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>
                          <Link to={`/vehicles/${vehicle.id}`} className="link-inline">
                            {vehicle.license_plate}
                          </Link>
                        </td>
                        <td>{vehicle.manufacturer || '-'}</td>
                        <td>{vehicle.model || '-'}</td>
                        <td>{vehicle.car_type || '-'}</td>
                        <td>{vehicle.production_year || '-'}</td>
                        <td>
                          {vehicle.driver_name ? (
                            <Link to={`/drivers/${vehicle.assigned_driver_id}`} className="link-inline">
                              {vehicle.driver_name}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${vehicle.is_operational ? 'status-active' : 'status-inactive'}`}>
                            {vehicle.is_operational ? 'Operational' : 'Not Operational'}
                          </span>
                        </td>
                        <td>
                          <Link to={`/vehicles/${vehicle.id}`} className="btn btn-text">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="tab-content">
            <h2 className="section-title">Drivers</h2>
            {driversLoading ? (
              <div className="loading">Loading drivers...</div>
            ) : drivers.length === 0 ? (
              <div className="empty-state">No drivers found for this company.</div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Identity Card</th>
                      <th>License Class</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Vehicle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr key={driver.id}>
                        <td>
                          <Link to={`/drivers/${driver.id}`} className="link-inline">
                            {driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || '-'}
                          </Link>
                        </td>
                        <td>{driver.identity_card}</td>
                        <td>{driver.license_class || '-'}</td>
                        <td>{driver.phone_mobile || '-'}</td>
                        <td>{driver.email || '-'}</td>
                        <td>
                          {driver.vehicle_plate ? (
                            <Link to={`/vehicles/${driver.vehicle_id}`} className="link-inline">
                              {driver.vehicle_plate}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <Link to={`/drivers/${driver.id}`} className="btn btn-text">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

export default CompanyDetailsPage;
