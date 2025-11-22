import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { vehiclesApi } from '../api/client';

interface Vehicle {
  id: number;
  license_plate: string;
  company_id?: number;
  company_name?: string;
  assigned_driver_id?: number;
  driver_name?: string;
  manufacturer?: string;
  model?: string;
  weight?: number;
  department?: string;
  car_type?: string;
  carrier_license_expiry_date?: string;
  internal_number?: number;
  chassis_number?: string;
  odometer_reading?: number;
  production_year?: number;
  license_expiry_date?: string;
  last_safety_inspection?: string;
  next_safety_inspection?: string;
  hova_insurance_expiry_date?: string;
  mekif_insurance_expiry_date?: string;
  special_equipment_expiry_date?: string;
  hazardous_license_expiry_date?: string;
  tachograph_expiry_date?: string;
  winter_inspection_expiry_date?: string;
  brake_inspection_expiry_date?: string;
  equipment?: string;
  has_tow_hook?: boolean;
  is_operational?: boolean;
  notes?: string;
}

type TabType = 'info' | 'files';

const VehicleDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await vehiclesApi.getById(Number(id));
      setVehicle(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? parseInt(value) : undefined
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
    setFormData(vehicle || {});
    setError(null);
  };

  const handleSave = async () => {
    if (!vehicle) return;
    
    setSaving(true);
    setError(null);

    try {
      const response = await vehiclesApi.update(vehicle.id, formData);
      setVehicle(response.data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update vehicle');
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

  if (!vehicle) {
    return (
      <div className="page-container">
        <div className="loading">Vehicle not found</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/vehicles" className="breadcrumb-link">Vehicles</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{vehicle.license_plate}</span>
        </div>

        {/* Vehicle Header */}
        <div className="company-header">
          <div>
            <h1 className="company-title">{vehicle.license_plate}</h1>
            <p className="company-id">{vehicle.manufacturer} {vehicle.model} {vehicle.production_year}</p>
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
              <h2 className="section-title">Vehicle Details</h2>
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
                  <label className="form-label">License Plate *</label>
                  <input
                    type="text"
                    name="license_plate"
                    className="form-input"
                    value={formData.license_plate || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    className="form-input"
                    value={formData.manufacturer || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input
                    type="text"
                    name="model"
                    className="form-input"
                    value={formData.model || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <input
                    type="text"
                    name="car_type"
                    className="form-input"
                    value={formData.car_type || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Production Year</label>
                  <input
                    type="number"
                    name="production_year"
                    className="form-input"
                    value={formData.production_year || ''}
                    onChange={handleNumberChange}
                    readOnly={!isEditing}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    className="form-input"
                    value={formData.weight || ''}
                    onChange={handleNumberChange}
                    readOnly={!isEditing}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Chassis Number</label>
                  <input
                    type="text"
                    name="chassis_number"
                    className="form-input"
                    value={formData.chassis_number || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Internal Number</label>
                  <input
                    type="number"
                    name="internal_number"
                    className="form-input"
                    value={formData.internal_number || ''}
                    onChange={handleNumberChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    value={formData.department || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Odometer Reading</label>
                  <input
                    type="number"
                    name="odometer_reading"
                    className="form-input"
                    value={formData.odometer_reading || ''}
                    onChange={handleNumberChange}
                    readOnly={!isEditing}
                    min="0"
                  />
                </div>
              </div>

              <h2 className="section-title">License & Registration</h2>
              
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
                  <label className="form-label">Carrier License Expiry Date</label>
                  <input
                    type="date"
                    name="carrier_license_expiry_date"
                    className="form-input"
                    value={formData.carrier_license_expiry_date ? formData.carrier_license_expiry_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <h2 className="section-title">Inspections</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Last Safety Inspection</label>
                  <input
                    type="date"
                    name="last_safety_inspection"
                    className="form-input"
                    value={formData.last_safety_inspection ? formData.last_safety_inspection.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Next Safety Inspection</label>
                  <input
                    type="date"
                    name="next_safety_inspection"
                    className="form-input"
                    value={formData.next_safety_inspection ? formData.next_safety_inspection.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Winter Inspection Expiry</label>
                  <input
                    type="date"
                    name="winter_inspection_expiry_date"
                    className="form-input"
                    value={formData.winter_inspection_expiry_date ? formData.winter_inspection_expiry_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brake Inspection Expiry</label>
                  <input
                    type="date"
                    name="brake_inspection_expiry_date"
                    className="form-input"
                    value={formData.brake_inspection_expiry_date ? formData.brake_inspection_expiry_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <h2 className="section-title">Insurance</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hova Insurance Expiry</label>
                  <input
                    type="date"
                    name="hova_insurance_expiry_date"
                    className="form-input"
                    value={formData.hova_insurance_expiry_date ? formData.hova_insurance_expiry_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mekif Insurance Expiry</label>
                  <input
                    type="date"
                    name="mekif_insurance_expiry_date"
                    className="form-input"
                    value={formData.mekif_insurance_expiry_date ? formData.mekif_insurance_expiry_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <h2 className="section-title">Additional Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Special Equipment Expiry</label>
                  <input
                    type="date"
                    name="special_equipment_expiry_date"
                    className="form-input"
                    value={formData.special_equipment_expiry_date ? formData.special_equipment_expiry_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hazardous License Expiry</label>
                  <input
                    type="date"
                    name="hazardous_license_expiry_date"
                    className="form-input"
                    value={formData.hazardous_license_expiry_date ? formData.hazardous_license_expiry_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tachograph Expiry</label>
                  <input
                    type="date"
                    name="tachograph_expiry_date"
                    className="form-input"
                    value={formData.tachograph_expiry_date ? formData.tachograph_expiry_date.split('T')[0] : ''}
                    onChange={handleDateChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Equipment</label>
                  <input
                    type="text"
                    name="equipment"
                    className="form-input"
                    value={formData.equipment || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label checkbox-label">
                    <input
                      type="checkbox"
                      name="has_tow_hook"
                      checked={formData.has_tow_hook || false}
                      onChange={handleBooleanChange}
                      disabled={!isEditing}
                      className="form-checkbox"
                    />
                    <span>Has Tow Hook</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label checkbox-label">
                    <input
                      type="checkbox"
                      name="is_operational"
                      checked={formData.is_operational || false}
                      onChange={handleBooleanChange}
                      disabled={!isEditing}
                      className="form-checkbox"
                    />
                    <span>Is Operational</span>
                  </label>
                </div>
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

export default VehicleDetailsPage;
