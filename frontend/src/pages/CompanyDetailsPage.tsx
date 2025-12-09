import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { companiesApi, type Company, type Vehicle, type Driver } from '../api/client';
import { getDateStatus } from '../utils/dateUtils';
import AddVehicleModal from '../components/AddVehicleModal';
import AddDriverModal from '../components/AddDriverModal';

type TabType = 'details' | 'lists';

const CompanyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCompany();
      fetchVehicles();
      fetchDrivers();
    }
  }, [id]);

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
    try {
      const response = await companiesApi.getVehicles(Number(id));
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await companiesApi.getDrivers(Number(id));
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
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
      setCompany(response.data as Company);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'עדכון חברה נכשל');
    } finally {
      setSaving(false);
    }
  };

  const getDateInputClass = (dateStr: string | null | undefined): string => {
    const status = getDateStatus(dateStr);
    if (status === 'expired') return 'form-input date-expired';
    if (status === 'expiring_soon') return 'form-input date-expiring-soon';
    return 'form-input';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">טוען...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="page-container">
        <div className="loading">חברה לא נמצאה</div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '4px 20px', height: 'calc(100vh - 60px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="content-container" style={{ maxWidth: '100%', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Breadcrumbs - Minimal */}
        <div className="breadcrumbs" style={{ marginBottom: '4px', fontSize: '12px' }}>
          <Link to="/companies" className="breadcrumb-link">חברות</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{company.name || 'פרטי חברה'}</span>
        </div>

        {/* Tabs */}
        <div className="tabs-container" style={{ marginBottom: '4px' }}>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'details' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              פרטי חברה
            </button>
            <button
              className={`tab ${activeTab === 'lists' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('lists')}
            >
              רשימות
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {activeTab === 'details' && (
            <div style={{ flex: 1, overflow: 'auto', paddingRight: '4px' }}>
              {/* Company Details Form - Compact layout */}
              <div className="detail-card" style={{ padding: '10px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <h2 className="detail-card-title" style={{ fontSize: '16px', margin: 0, padding: 0, border: 'none' }}>{company.name || 'חברה ללא שם'} - פרטי חברה כללי</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>ת.ז: {company.identity_card}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!isEditing ? (
                      <button className="btn btn-primary" onClick={handleEdit} style={{ height: '28px', padding: '0 12px', fontSize: '13px' }}>
                        <span className="btn-text">עדכן</span>
                      </button>
                    ) : (
                      <>
                        <button className="btn btn-secondary" onClick={handleCancel} disabled={saving} style={{ height: '28px', padding: '0 12px', fontSize: '13px' }}>
                          <span className="btn-text">ביטול</span>
                        </button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ height: '28px', padding: '0 12px', fontSize: '13px' }}>
                          <span className="btn-text">{saving ? 'שומר...' : 'שמור שינויים'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {error && <div className="form-error" style={{ marginBottom: '6px', padding: '6px 10px', fontSize: '12px', backgroundColor: 'var(--accent-red-light)', color: 'var(--accent-danger)', borderRadius: '4px' }}>{error}</div>}
                <div className="company-details-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px 10px' }}>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מספר ת.ז/ח.פ *</label>
                    <input
                      type="text"
                      name="identity_card"
                      className="form-input"
                      value={formData.identity_card || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      required
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>שם חברה</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>כתובת</label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>ת.ד (תיבת דואר)</label>
                    <input
                      type="text"
                      name="po_box"
                      className="form-input"
                      value={formData.po_box || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>טלפון</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-input"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>פקס</label>
                    <input
                      type="text"
                      name="fax"
                      className="form-input"
                      value={formData.fax || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>דואר אלקטרוני</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>קצין בטיחות אחראי</label>
                    <input
                      type="text"
                      name="safety_officer"
                      className="form-input"
                      value={formData.safety_officer || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>איש קשר / אחראי</label>
                    <input
                      type="text"
                      name="contact_person"
                      className="form-input"
                      value={formData.contact_person || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>טלפון איש קשר</label>
                    <input
                      type="text"
                      name="contact_phone"
                      className="form-input"
                      value={formData.contact_phone || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מנהל מקצועי</label>
                    <input
                      type="text"
                      name="manager_name"
                      className="form-input"
                      value={formData.manager_name || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>ת.ז מנהל מקצועי</label>
                    <input
                      type="text"
                      name="manager_id"
                      className="form-input"
                      value={formData.manager_id || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>טלפון מנהל מקצועי</label>
                    <input
                      type="text"
                      name="manager_phone"
                      className="form-input"
                      value={formData.manager_phone || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תאריך הקמה</label>
                    <input
                      type="date"
                      name="established_date"
                      className="form-input"
                      value={formData.established_date ? formData.established_date.split('T')[0] : ''}
                      onChange={handleDateChange}
                      readOnly={!isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>רישיון מוביל בתוקף עד</label>
                <input
                  type="date"
                  name="carrier_license_expiry"
                  className={getDateInputClass(formData.carrier_license_expiry)}
                  value={formData.carrier_license_expiry ? formData.carrier_license_expiry.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
                  <div className="form-group" style={{ maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>שבוע בדיקה</label>
                    <input
                      type="number"
                      name="inspection_week"
                      className="form-input"
                      value={formData.inspection_week || ''}
                      onChange={handleNumberChange}
                      readOnly={!isEditing}
                      min="1"
                      max="52"
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1', maxWidth: '100%' }}>
                    <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>הערות כלליות</label>
                    <textarea
                      name="notes"
                      className="form-input form-textarea"
                      value={formData.notes || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      rows={2}
                      style={{ minHeight: '50px', resize: 'vertical', fontSize: '12px', padding: '4px 8px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lists' && (
            <div style={{ flex: 1, overflow: 'auto', paddingRight: '4px' }}>
              {/* Split View: Vehicles and Drivers Tables */}
              <div className="split-view" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'stretch' }}>
                {/* Vehicles Table */}
                <div className="detail-card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 className="detail-card-title" style={{ fontSize: '14px', margin: 0, padding: 0, border: 'none' }}>רשימת כלי רכב</h2>
                    <button className="btn btn-primary" onClick={() => setShowAddVehicleModal(true)} style={{ height: '28px', padding: '0 12px', fontSize: '13px' }}>
                      <span className="btn-text">הוספת רכב חדש</span>
                    </button>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {vehicles.length === 0 ? (
                      <div className="empty-state" style={{ padding: '12px', textAlign: 'center', fontSize: '12px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>לא נמצאו רכבים לחברה זו.</div>
                    ) : (
                      <div className="table-container" style={{ overflow: 'visible', flex: 1 }}>
                        <table className="table" style={{ fontSize: '12px', width: '100%', tableLayout: 'auto' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>מספר רישוי</th>
                              <th style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600' }}>יצרן</th>
                              <th style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600' }}>דגם</th>
                              <th style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600' }}>סוג</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vehicles.map((vehicle) => (
                              <tr 
                                key={vehicle.id} 
                                className="table-row-clickable"
                                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                                style={{ cursor: 'pointer' }}
                              >
                                <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                                  <Link to={`/vehicles/${vehicle.id}`} onClick={(e) => e.stopPropagation()} className="link-inline" style={{ fontSize: '12px' }}>
                                    {vehicle.license_plate}
                                  </Link>
                                </td>
                                <td style={{ padding: '6px 8px', fontSize: '12px' }}>{vehicle.manufacturer || '-'}</td>
                                <td style={{ padding: '6px 8px', fontSize: '12px' }}>{vehicle.model || '-'}</td>
                                <td style={{ padding: '6px 8px', fontSize: '12px' }}>{vehicle.car_type || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Drivers Table */}
                <div className="detail-card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 className="detail-card-title" style={{ fontSize: '14px', margin: 0, padding: 0, border: 'none' }}>רשימת נהגים</h2>
                    <button className="btn btn-primary" onClick={() => setShowAddDriverModal(true)} style={{ height: '28px', padding: '0 12px', fontSize: '13px' }}>
                      <span className="btn-text">הוספת נהג חדש</span>
                    </button>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {drivers.length === 0 ? (
                      <div className="empty-state" style={{ padding: '12px', textAlign: 'center', fontSize: '12px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>לא נמצאו נהגים לחברה זו.</div>
                    ) : (
                      <div className="table-container" style={{ overflow: 'visible', flex: 1 }}>
                        <table className="table" style={{ fontSize: '12px', width: '100%', tableLayout: 'auto' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600' }}>שם</th>
                              <th style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>תעודת זהות</th>
                              <th style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600' }}>סוג רישיון</th>
                              <th style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600' }}>טלפון</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drivers.map((driver) => (
                              <tr 
                                key={driver.id} 
                                className="table-row-clickable"
                                onClick={() => navigate(`/drivers/${driver.id}`)}
                                style={{ cursor: 'pointer' }}
                              >
                                <td style={{ padding: '6px 8px', fontSize: '12px' }}>
                                  <Link to={`/drivers/${driver.id}`} onClick={(e) => e.stopPropagation()} className="link-inline" style={{ fontSize: '12px' }}>
                                    {driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || '-'}
                                  </Link>
                                </td>
                                <td style={{ padding: '6px 8px', fontSize: '12px', whiteSpace: 'nowrap' }}>{driver.identity_card}</td>
                                <td style={{ padding: '6px 8px', fontSize: '12px' }}>{driver.license_class || '-'}</td>
                                <td style={{ padding: '6px 8px', fontSize: '12px' }}>{driver.phone_mobile || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddVehicleModal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
        onSuccess={() => {
          setShowAddVehicleModal(false);
          fetchVehicles();
        }}
        defaultCompanyId={company.id}
      />
      <AddDriverModal
        isOpen={showAddDriverModal}
        onClose={() => setShowAddDriverModal(false)}
        onSuccess={() => {
          setShowAddDriverModal(false);
          fetchDrivers();
        }}
        defaultCompanyId={company.id}
      />
    </div>
  );
};

export default CompanyDetailsPage;
