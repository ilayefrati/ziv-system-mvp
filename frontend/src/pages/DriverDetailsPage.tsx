import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { driversApi, type Driver } from '../api/client';
import { getDateStatus } from '../utils/dateUtils';

const DriverDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
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
      setDriver(response.data as Driver);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'עדכון נהג נכשל');
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

  if (!driver) {
    return (
      <div className="page-container">
        <div className="loading">נהג לא נמצא</div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '4px 20px', height: 'calc(100vh - 60px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="content-container" style={{ maxWidth: '100%', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Breadcrumbs - Minimal */}
        <div className="breadcrumbs" style={{ marginBottom: '4px', fontSize: '12px' }}>
          <Link to="/drivers" className="breadcrumb-link">נהגים</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'נהג'}</span>
        </div>

        {/* All Driver Details in One Compact Form */}
        <div style={{ flex: 1, overflow: 'auto', paddingRight: '4px' }}>
          <div className="detail-card" style={{ padding: '10px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h2 className="detail-card-title" style={{ fontSize: '16px', margin: 0, padding: 0, border: 'none' }}>כרטיס נהג - {driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'נהג ללא שם'} - פרטי נהג</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>ת.ז: {driver.identity_card}</p>
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
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מספר ת.ז *</label>
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
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>שם פרטי</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>שם משפחה</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תאריך לידה</label>
                <input
                  type="date"
                  name="birth_date"
                  className="form-input"
                  value={formData.birth_date ? formData.birth_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מצב משפחתי</label>
                <input
                  type="text"
                  name="marital_status"
                  className="form-input"
                  value={formData.marital_status || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>כתובת מגורים</label>
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
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>טלפון נייד</label>
                <input
                  type="text"
                  name="phone_mobile"
                  className="form-input"
                  value={formData.phone_mobile || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>טלפון בבית</label>
                <input
                  type="text"
                  name="phone_home"
                  className="form-input"
                  value={formData.phone_home || ''}
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
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>דרגת רישיון נהיגה</label>
                <input
                  type="text"
                  name="license_class"
                  className="form-input"
                  value={formData.license_class || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף רישיון נהיגה</label>
                <input
                  type="date"
                  name="license_expiry_date"
                  className={getDateInputClass(formData.license_expiry_date)}
                  value={formData.license_expiry_date ? formData.license_expiry_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף מידע תעבורתי</label>
                <input
                  type="date"
                  name="traffic_info_expiry_date"
                  className={getDateInputClass(formData.traffic_info_expiry_date)}
                  value={formData.traffic_info_expiry_date ? formData.traffic_info_expiry_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תפקיד</label>
                <input
                  type="text"
                  name="job_title"
                  className="form-input"
                  value={formData.job_title || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>איזור/מקום עבודה</label>
                <input
                  type="text"
                  name="work_location"
                  className="form-input"
                  value={formData.work_location || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מועד תחילת עבודה</label>
                <input
                  type="date"
                  name="employment_start_date"
                  className="form-input"
                  value={formData.employment_start_date ? formData.employment_start_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>השכלה</label>
                <input
                  type="text"
                  name="education"
                  className="form-input"
                  value={formData.education || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מס' אישי בחברה</label>
                <input
                  type="text"
                  name="personal_number_in_company"
                  className="form-input"
                  value={formData.personal_number_in_company || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label checkbox-label" style={{ fontSize: '13px', paddingBottom: '4px' }}>
                  <input
                    type="checkbox"
                    name="was_license_revoked"
                    checked={formData.was_license_revoked || false}
                    onChange={handleBooleanChange}
                    disabled={!isEditing}
                    className="form-checkbox"
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>נשלל בפועל בעבר</span>
                </label>
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label checkbox-label" style={{ fontSize: '13px', paddingBottom: '4px' }}>
                  <input
                    type="checkbox"
                    name="has_hazardous_materials_permit"
                    checked={formData.has_hazardous_materials_permit || false}
                    onChange={handleBooleanChange}
                    disabled={!isEditing}
                    className="form-checkbox"
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>היתר להוביל חומ"ס</span>
                </label>
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label checkbox-label" style={{ fontSize: '13px', paddingBottom: '4px' }}>
                  <input
                    type="checkbox"
                    name="has_crane_operation_permit"
                    checked={formData.has_crane_operation_permit || false}
                    onChange={handleBooleanChange}
                    disabled={!isEditing}
                    className="form-checkbox"
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>רישיון מנוף</span>
                </label>
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>רכב מוקצה</label>
                {driver.vehicle_plate ? (
                  <div style={{ padding: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '13px' }}>
                    <Link to={`/vehicles/${driver.vehicle_id}`} className="link-inline">
                      {driver.vehicle_plate}
                    </Link>
                  </div>
                ) : (
                  <div style={{ padding: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    אין רכב מוקצה
                  </div>
                )}
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1', maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>הערות</label>
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
      </div>
    </div>
  );
};

export default DriverDetailsPage;
