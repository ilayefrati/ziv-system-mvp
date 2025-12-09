import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { vehiclesApi, companiesApi, type Vehicle, type Driver } from '../api/client';
import { isExpired, isExpiringSoon, getDateStatus } from '../utils/dateUtils';

const VehicleDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyDrivers, setCompanyDrivers] = useState<Driver[]>([]);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [assignedDriverIds, setAssignedDriverIds] = useState<Set<number>>(new Set());

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
      setSelectedDriverId(response.data.assigned_driver_id || null);
      
      if (response.data.company_id) {
        await fetchCompanyDrivers(response.data.company_id, response.data.id);
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDrivers = async (companyId: number, currentVehicleId?: number) => {
    try {
      const [driversResponse, vehiclesResponse] = await Promise.all([
        companiesApi.getDrivers(companyId),
        companiesApi.getVehicles(companyId)
      ]);
      
      setCompanyDrivers(driversResponse.data);
      
      const assignedIds = new Set<number>();
      vehiclesResponse.data.forEach((v: Vehicle) => {
        if (currentVehicleId && v.id !== currentVehicleId && v.assigned_driver_id) {
          assignedIds.add(v.assigned_driver_id);
        } else if (!currentVehicleId && v.assigned_driver_id) {
          assignedIds.add(v.assigned_driver_id);
        }
      });
      setAssignedDriverIds(assignedIds);
    } catch (error) {
      console.error('Error fetching company drivers:', error);
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
      setVehicle(response.data as Vehicle);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'עדכון רכב נכשל');
    } finally {
      setSaving(false);
    }
  };

  const handleDriverAssignment = async () => {
    if (!vehicle || !vehicle.company_id) return;
    
    setAssigningDriver(true);
    setError(null);

    try {
      await vehiclesApi.assignDriver(vehicle.id, selectedDriverId);
      const response = await vehiclesApi.getById(vehicle.id);
      setVehicle(response.data);
      setFormData(response.data);
      setSelectedDriverId(response.data.assigned_driver_id || null);
      await fetchCompanyDrivers(vehicle.company_id, vehicle.id);
    } catch (err: any) {
      setError(err.message || 'הקצאת נהג נכשלה');
    } finally {
      setAssigningDriver(false);
    }
  };

  const handleDriverSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDriverId(value ? parseInt(value) : null);
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

  if (!vehicle) {
    return (
      <div className="page-container">
        <div className="loading">רכב לא נמצא</div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '4px 20px', height: 'calc(100vh - 60px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="content-container" style={{ maxWidth: '100%', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Breadcrumbs - Minimal */}
        <div className="breadcrumbs" style={{ marginBottom: '4px', fontSize: '12px' }}>
          <Link to="/vehicles" className="breadcrumb-link">רכבים</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{vehicle.license_plate}</span>
        </div>

        {/* All Vehicle Details in One Compact Form */}
        <div style={{ flex: 1, overflow: 'auto', paddingRight: '4px' }}>
          <div className="detail-card" style={{ padding: '10px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h2 className="detail-card-title" style={{ fontSize: '16px', margin: 0, padding: 0, border: 'none' }}>כרטיס משאית - {vehicle.license_plate} - פרטי רכב</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{vehicle.manufacturer} {vehicle.model} {vehicle.production_year}</p>
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
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מספר רישוי *</label>
                <input
                  type="text"
                  name="license_plate"
                  className="form-input"
                  value={formData.license_plate || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  required
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>יצרן</label>
                <input
                  type="text"
                  name="manufacturer"
                  className="form-input"
                  value={formData.manufacturer || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>דגם</label>
                <input
                  type="text"
                  name="model"
                  className="form-input"
                  value={formData.model || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>סוג</label>
                <input
                  type="text"
                  name="car_type"
                  className="form-input"
                  value={formData.car_type || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>שנת ייצור / עלייה</label>
                <input
                  type="number"
                  name="production_year"
                  className="form-input"
                  value={formData.production_year || ''}
                  onChange={handleNumberChange}
                  readOnly={!isEditing}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>משקל כולל בטון</label>
                <input
                  type="number"
                  name="weight"
                  className="form-input"
                  value={formData.weight || ''}
                  onChange={handleNumberChange}
                  readOnly={!isEditing}
                  min="0"
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מספר שלדה</label>
                <input
                  type="text"
                  name="chassis_number"
                  className="form-input"
                  value={formData.chassis_number || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מספר פנימי</label>
                <input
                  type="number"
                  name="internal_number"
                  className="form-input"
                  value={formData.internal_number || ''}
                  onChange={handleNumberChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מחלקה</label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>מד אוץ (קילומטראז')</label>
                <input
                  type="number"
                  name="odometer_reading"
                  className="form-input"
                  value={formData.odometer_reading || ''}
                  onChange={handleNumberChange}
                  readOnly={!isEditing}
                  min="0"
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף רישוי</label>
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
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף רישיון מוביל</label>
                <input
                  type="date"
                  name="carrier_license_expiry_date"
                  className={getDateInputClass(formData.carrier_license_expiry_date)}
                  value={formData.carrier_license_expiry_date ? formData.carrier_license_expiry_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>ב.קב"ט אחרונה</label>
                <input
                  type="date"
                  name="last_safety_inspection"
                  className="form-input"
                  value={formData.last_safety_inspection ? formData.last_safety_inspection.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>ב.קב"ט הבאה</label>
                <input
                  type="date"
                  name="next_safety_inspection"
                  className="form-input"
                  value={formData.next_safety_inspection ? formData.next_safety_inspection.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף ביטוח חובה</label>
                <input
                  type="date"
                  name="hova_insurance_expiry_date"
                  className={getDateInputClass(formData.hova_insurance_expiry_date)}
                  value={formData.hova_insurance_expiry_date ? formData.hova_insurance_expiry_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף ביטוח מקיף</label>
                <input
                  type="date"
                  name="mekif_insurance_expiry_date"
                  className={getDateInputClass(formData.mekif_insurance_expiry_date)}
                  value={formData.mekif_insurance_expiry_date ? formData.mekif_insurance_expiry_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף בדיקת חורף</label>
                <input
                  type="date"
                  name="winter_inspection_expiry_date"
                  className={getDateInputClass(formData.winter_inspection_expiry_date)}
                  value={formData.winter_inspection_expiry_date ? formData.winter_inspection_expiry_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף בדיקת בלמים חצי שנתית</label>
                <input
                  type="date"
                  name="brake_inspection_expiry_date"
                  className={getDateInputClass(formData.brake_inspection_expiry_date)}
                  value={formData.brake_inspection_expiry_date ? formData.brake_inspection_expiry_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף ציוד ייעודי</label>
                <input
                  type="date"
                  name="special_equipment_expiry_date"
                  className="form-input"
                  value={formData.special_equipment_expiry_date ? formData.special_equipment_expiry_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף היתר חומ"ס</label>
                <input
                  type="date"
                  name="hazardous_license_expiry_date"
                  className="form-input"
                  value={formData.hazardous_license_expiry_date ? formData.hazardous_license_expiry_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>תוקף כיול טכוגרף</label>
                <input
                  type="date"
                  name="tachograph_expiry_date"
                  className={getDateInputClass(formData.tachograph_expiry_date)}
                  value={formData.tachograph_expiry_date ? formData.tachograph_expiry_date.split('T')[0] : ''}
                  onChange={handleDateChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>סוג ציוד/ציוד נלווה</label>
                <input
                  type="text"
                  name="equipment"
                  className="form-input"
                  value={formData.equipment || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                />
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>נהג</label>
                {vehicle.company_id ? (
                  <>
                    <select
                      name="assigned_driver_id"
                      className="form-input"
                      value={selectedDriverId || ''}
                      onChange={handleDriverSelectChange}
                      disabled={assigningDriver || !isEditing}
                      style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                    >
                      <option value="">אין נהג מוקצה</option>
                      {companyDrivers.map((driver) => {
                        const isAssigned = assignedDriverIds.has(driver.id);
                        const driverName = driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || driver.identity_card;
                        return (
                          <option 
                            key={driver.id} 
                            value={driver.id}
                            disabled={isAssigned}
                          >
                            {driverName}{isAssigned ? ' - הנהג הזה כבר מוקצה לרכב אחר בחברה' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {isEditing && (
                      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleDriverAssignment}
                          disabled={assigningDriver || selectedDriverId === (vehicle.assigned_driver_id || null) || (selectedDriverId !== null && assignedDriverIds.has(selectedDriverId))}
                          style={{ padding: '6px 16px', fontSize: '12px', height: '28px' }}
                        >
                          <span className="btn-text">{assigningDriver ? 'מקצה...' : 'הקצה נהג'}</span>
                        </button>
                      </div>
                    )}
                    {isEditing && selectedDriverId !== null && assignedDriverIds.has(selectedDriverId) && (
                      <div style={{ marginTop: '6px', color: 'var(--accent-danger)', fontSize: '12px', textAlign: 'center' }}>
                        הנהג הזה כבר מוקצה לרכב אחר בחברה
                      </div>
                    )}
                    {vehicle.driver_name && !isEditing && (
                      <div style={{ marginTop: '6px', fontSize: '13px' }}>
                        <span className="text-secondary">נהג נוכחי: </span>
                        <Link to={`/drivers/${vehicle.assigned_driver_id}`} className="link-inline">
                          {vehicle.driver_name}
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-secondary" style={{ padding: '8px', fontSize: '13px' }}>
                    רכב זה לא משויך לחברה. יש לשייך רכב לחברה לפני הקצאת נהג.
                  </div>
                )}
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label" style={{ fontSize: '11px', paddingBottom: '2px', marginBottom: '2px' }}>וו גרירה וצלחת</label>
                <select
                  name="has_tow_hook"
                  className="form-input"
                  value={formData.has_tow_hook ? 'yes' : 'no'}
                  onChange={(e) => handleBooleanChange({ target: { name: 'has_tow_hook', checked: e.target.value === 'yes' } } as any)}
                  disabled={!isEditing}
                  style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                >
                  <option value="no">אין</option>
                  <option value="yes">יש</option>
                </select>
              </div>
              <div className="form-group" style={{ maxWidth: '100%' }}>
                <label className="form-label checkbox-label" style={{ fontSize: '13px', paddingBottom: '4px' }}>
                  <input
                    type="checkbox"
                    name="is_operational"
                    checked={formData.is_operational || false}
                    onChange={handleBooleanChange}
                    disabled={!isEditing}
                    className="form-checkbox"
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>תפעולי</span>
                </label>
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

export default VehicleDetailsPage;
