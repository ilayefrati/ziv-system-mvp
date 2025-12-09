import { useState, useEffect } from 'react';
import Modal from './Modal';
import { vehiclesApi, companiesApi, type Company } from '../api/client';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultCompanyId?: number;
}

const AddVehicleModal = ({ isOpen, onClose, onSuccess, defaultCompanyId }: AddVehicleModalProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    license_plate: '',
    company_id: '',
    manufacturer: '',
    model: '',
    car_type: '',
    production_year: '',
    weight: '',
    department: '',
    chassis_number: '',
    internal_number: '',
    odometer_reading: '',
    equipment: '',
    has_tow_hook: false,
    is_operational: false,
    license_expiry_date: '',
    carrier_license_expiry_date: '',
    last_safety_inspection: '',
    next_safety_inspection: '',
    hova_insurance_expiry_date: '',
    mekif_insurance_expiry_date: '',
    special_equipment_expiry_date: '',
    hazardous_license_expiry_date: '',
    tachograph_expiry_date: '',
    winter_inspection_expiry_date: '',
    brake_inspection_expiry_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      if (defaultCompanyId) {
        setFormData(prev => ({ ...prev, company_id: String(defaultCompanyId) }));
      }
    } else {
      // Reset form when modal closes
      setFormData({
        license_plate: '',
        company_id: defaultCompanyId ? String(defaultCompanyId) : '',
        manufacturer: '',
        model: '',
        car_type: '',
        production_year: '',
        weight: '',
        department: '',
        chassis_number: '',
        internal_number: '',
        odometer_reading: '',
        equipment: '',
        has_tow_hook: false,
        is_operational: false,
        license_expiry_date: '',
        carrier_license_expiry_date: '',
        last_safety_inspection: '',
        next_safety_inspection: '',
        hova_insurance_expiry_date: '',
        mekif_insurance_expiry_date: '',
        special_equipment_expiry_date: '',
        hazardous_license_expiry_date: '',
        tachograph_expiry_date: '',
        winter_inspection_expiry_date: '',
        brake_inspection_expiry_date: '',
        notes: '',
      });
    }
  }, [isOpen, defaultCompanyId]);

  const fetchCompanies = async () => {
    try {
      const response = await companiesApi.getAll();
      setCompanies(response.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? parseInt(value) : ''
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
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        license_plate: formData.license_plate,
        manufacturer: formData.manufacturer || undefined,
        model: formData.model || undefined,
        car_type: formData.car_type || undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        department: formData.department || undefined,
        chassis_number: formData.chassis_number || undefined,
        internal_number: formData.internal_number ? parseInt(formData.internal_number) : undefined,
        odometer_reading: formData.odometer_reading ? parseInt(formData.odometer_reading) : undefined,
        production_year: formData.production_year ? parseInt(formData.production_year) : undefined,
        equipment: formData.equipment || undefined,
        has_tow_hook: formData.has_tow_hook,
        is_operational: formData.is_operational,
        notes: formData.notes || undefined,
      };
      
      if (formData.company_id) {
        payload.company_id = parseInt(formData.company_id);
      }

      // Add date fields
      if (formData.license_expiry_date) payload.license_expiry_date = formData.license_expiry_date;
      if (formData.carrier_license_expiry_date) payload.carrier_license_expiry_date = formData.carrier_license_expiry_date;
      if (formData.last_safety_inspection) payload.last_safety_inspection = formData.last_safety_inspection;
      if (formData.next_safety_inspection) payload.next_safety_inspection = formData.next_safety_inspection;
      if (formData.hova_insurance_expiry_date) payload.hova_insurance_expiry_date = formData.hova_insurance_expiry_date;
      if (formData.mekif_insurance_expiry_date) payload.mekif_insurance_expiry_date = formData.mekif_insurance_expiry_date;
      if (formData.special_equipment_expiry_date) payload.special_equipment_expiry_date = formData.special_equipment_expiry_date;
      if (formData.hazardous_license_expiry_date) payload.hazardous_license_expiry_date = formData.hazardous_license_expiry_date;
      if (formData.tachograph_expiry_date) payload.tachograph_expiry_date = formData.tachograph_expiry_date;
      if (formData.winter_inspection_expiry_date) payload.winter_inspection_expiry_date = formData.winter_inspection_expiry_date;
      if (formData.brake_inspection_expiry_date) payload.brake_inspection_expiry_date = formData.brake_inspection_expiry_date;

      await vehiclesApi.create(payload);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        license_plate: '',
        company_id: defaultCompanyId ? String(defaultCompanyId) : '',
        manufacturer: '',
        model: '',
        car_type: '',
        production_year: '',
        weight: '',
        department: '',
        chassis_number: '',
        internal_number: '',
        odometer_reading: '',
        equipment: '',
        has_tow_hook: false,
        is_operational: false,
        license_expiry_date: '',
        carrier_license_expiry_date: '',
        last_safety_inspection: '',
        next_safety_inspection: '',
        hova_insurance_expiry_date: '',
        mekif_insurance_expiry_date: '',
        special_equipment_expiry_date: '',
        hazardous_license_expiry_date: '',
        tachograph_expiry_date: '',
        winter_inspection_expiry_date: '',
        brake_inspection_expiry_date: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err.message || 'יצירת רכב נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="הוסף רכב">
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-error">{error}</div>}
        
        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">מספר רישוי *</label>
            <input
              type="text"
              name="license_plate"
              className="form-input"
              value={formData.license_plate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">חברה</label>
            <select
              name="company_id"
              className="form-input"
              value={formData.company_id}
              onChange={handleChange}
              disabled={!!defaultCompanyId}
            >
              <option value="">בחר חברה</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name || company.identity_card}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">יצרן</label>
            <input
              type="text"
              name="manufacturer"
              className="form-input"
              value={formData.manufacturer}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">דגם</label>
            <input
              type="text"
              name="model"
              className="form-input"
              value={formData.model}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">סוג</label>
            <input
              type="text"
              name="car_type"
              className="form-input"
              value={formData.car_type}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">שנת ייצור / עלייה</label>
            <input
              type="number"
              name="production_year"
              className="form-input"
              value={formData.production_year}
              onChange={handleNumberChange}
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">משקל כולל בטון</label>
            <input
              type="number"
              name="weight"
              className="form-input"
              value={formData.weight}
              onChange={handleNumberChange}
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">מחלקה</label>
            <input
              type="text"
              name="department"
              className="form-input"
              value={formData.department}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">מספר שלדה</label>
            <input
              type="text"
              name="chassis_number"
              className="form-input"
              value={formData.chassis_number}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">מספר פנימי</label>
            <input
              type="number"
              name="internal_number"
              className="form-input"
              value={formData.internal_number}
              onChange={handleNumberChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">מד אוץ (קילומטראז')</label>
            <input
              type="number"
              name="odometer_reading"
              className="form-input"
              value={formData.odometer_reading}
              onChange={handleNumberChange}
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">סוג ציוד/ציוד נלווה</label>
            <input
              type="text"
              name="equipment"
              className="form-input"
              value={formData.equipment}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">תוקף רישיון</label>
            <input
              type="date"
              name="license_expiry_date"
              className="form-input"
              value={formData.license_expiry_date}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">תוקף רישיון מוביל</label>
            <input
              type="date"
              name="carrier_license_expiry_date"
              className="form-input"
              value={formData.carrier_license_expiry_date}
              onChange={handleDateChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">בדיקת קב"ט אחרונה</label>
            <input
              type="date"
              name="last_safety_inspection"
              className="form-input"
              value={formData.last_safety_inspection}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">בדיקת קב"ט הבאה</label>
            <input
              type="date"
              name="next_safety_inspection"
              className="form-input"
              value={formData.next_safety_inspection}
              onChange={handleDateChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">תוקף ביטוח חובה</label>
            <input
              type="date"
              name="hova_insurance_expiry_date"
              className="form-input"
              value={formData.hova_insurance_expiry_date}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">תוקף ביטוח מקיף/ג</label>
            <input
              type="date"
              name="mekif_insurance_expiry_date"
              className="form-input"
              value={formData.mekif_insurance_expiry_date}
              onChange={handleDateChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">תוקף ציוד ייעודי</label>
            <input
              type="date"
              name="special_equipment_expiry_date"
              className="form-input"
              value={formData.special_equipment_expiry_date}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">תוקף היתר חומ"ס</label>
            <input
              type="date"
              name="hazardous_license_expiry_date"
              className="form-input"
              value={formData.hazardous_license_expiry_date}
              onChange={handleDateChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">תוקף כיול טכוגרף</label>
            <input
              type="date"
              name="tachograph_expiry_date"
              className="form-input"
              value={formData.tachograph_expiry_date}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">תוקף בדיקת חורף</label>
            <input
              type="date"
              name="winter_inspection_expiry_date"
              className="form-input"
              value={formData.winter_inspection_expiry_date}
              onChange={handleDateChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">תוקף בדיקת בלמים חצי שנתית</label>
            <input
              type="date"
              name="brake_inspection_expiry_date"
              className="form-input"
              value={formData.brake_inspection_expiry_date}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group"></div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label checkbox-label">
              <input
                type="checkbox"
                name="has_tow_hook"
                checked={formData.has_tow_hook}
                onChange={handleBooleanChange}
                className="form-checkbox"
              />
              <span>וו גרירה / צלחת</span>
            </label>
          </div>
          <div className="form-group">
            <label className="form-label checkbox-label">
              <input
                type="checkbox"
                name="is_operational"
                checked={formData.is_operational}
                onChange={handleBooleanChange}
                className="form-checkbox"
              />
              <span>תפעולי</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">הערות</label>
          <textarea
            name="notes"
            className="form-input form-textarea"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            ביטול
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'יוצר...' : 'צור רכב'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddVehicleModal;
