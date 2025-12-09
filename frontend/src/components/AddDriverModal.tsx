import { useState, useEffect } from 'react';
import Modal from './Modal';
import { driversApi, companiesApi, type Company } from '../api/client';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultCompanyId?: number;
}

const AddDriverModal = ({ isOpen, onClose, onSuccess, defaultCompanyId }: AddDriverModalProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    identity_card: '',
    company_id: '',
    first_name: '',
    last_name: '',
    license_class: '',
    license_expiry_date: '',
    traffic_info_expiry_date: '',
    address: '',
    phone_mobile: '',
    phone_home: '',
    email: '',
    job_title: '',
    work_location: '',
    marital_status: '',
    birth_date: '',
    employment_start_date: '',
    education: '',
    personal_number_in_company: '',
    was_license_revoked: false,
    has_hazardous_materials_permit: false,
    has_crane_operation_permit: false,
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
        identity_card: '',
        company_id: defaultCompanyId ? String(defaultCompanyId) : '',
        first_name: '',
        last_name: '',
        license_class: '',
        license_expiry_date: '',
        traffic_info_expiry_date: '',
        address: '',
        phone_mobile: '',
        phone_home: '',
        email: '',
        job_title: '',
        work_location: '',
        marital_status: '',
        birth_date: '',
        employment_start_date: '',
        education: '',
        personal_number_in_company: '',
        was_license_revoked: false,
        has_hazardous_materials_permit: false,
        has_crane_operation_permit: false,
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
        identity_card: formData.identity_card,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        license_class: formData.license_class || undefined,
        address: formData.address || undefined,
        phone_mobile: formData.phone_mobile || undefined,
        phone_home: formData.phone_home || undefined,
        email: formData.email || undefined,
        job_title: formData.job_title || undefined,
        work_location: formData.work_location || undefined,
        marital_status: formData.marital_status || undefined,
        education: formData.education || undefined,
        personal_number_in_company: formData.personal_number_in_company || undefined,
        was_license_revoked: formData.was_license_revoked,
        has_hazardous_materials_permit: formData.has_hazardous_materials_permit,
        has_crane_operation_permit: formData.has_crane_operation_permit,
        notes: formData.notes || undefined,
      };
      
      if (formData.company_id) {
        payload.company_id = parseInt(formData.company_id);
      }

      // Add date fields
      if (formData.license_expiry_date) payload.license_expiry_date = formData.license_expiry_date;
      if (formData.traffic_info_expiry_date) payload.traffic_info_expiry_date = formData.traffic_info_expiry_date;
      if (formData.birth_date) payload.birth_date = formData.birth_date;
      if (formData.employment_start_date) payload.employment_start_date = formData.employment_start_date;

      await driversApi.create(payload);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        identity_card: '',
        company_id: defaultCompanyId ? String(defaultCompanyId) : '',
        first_name: '',
        last_name: '',
        license_class: '',
        license_expiry_date: '',
        traffic_info_expiry_date: '',
        address: '',
        phone_mobile: '',
        phone_home: '',
        email: '',
        job_title: '',
        work_location: '',
        marital_status: '',
        birth_date: '',
        employment_start_date: '',
        education: '',
        personal_number_in_company: '',
        was_license_revoked: false,
        has_hazardous_materials_permit: false,
        has_crane_operation_permit: false,
        notes: '',
      });
    } catch (err: any) {
      setError(err.message || 'יצירת נהג נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="הוסף נהג">
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-error">{error}</div>}
        
        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">מספר ת.ז *</label>
            <input
              type="text"
              name="identity_card"
              className="form-input"
              value={formData.identity_card}
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
            <label className="form-label">שם פרטי</label>
            <input
              type="text"
              name="first_name"
              className="form-input"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">שם משפחה</label>
            <input
              type="text"
              name="last_name"
              className="form-input"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">דרגת רישיון נהיגה</label>
            <input
              type="text"
              name="license_class"
              className="form-input"
              value={formData.license_class}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">מספר אישי בחברה</label>
            <input
              type="text"
              name="personal_number_in_company"
              className="form-input"
              value={formData.personal_number_in_company}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">תוקף רישיון נהיגה</label>
            <input
              type="date"
              name="license_expiry_date"
              className="form-input"
              value={formData.license_expiry_date}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">תוקף מידע תעבורתי</label>
            <input
              type="date"
              name="traffic_info_expiry_date"
              className="form-input"
              value={formData.traffic_info_expiry_date}
              onChange={handleDateChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">כתובת מגורים</label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">טל נייד</label>
            <input
              type="text"
              name="phone_mobile"
              className="form-input"
              value={formData.phone_mobile}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">טל בבית</label>
            <input
              type="text"
              name="phone_home"
              className="form-input"
              value={formData.phone_home}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">דואר אלקטרוני</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">תפקיד</label>
            <input
              type="text"
              name="job_title"
              className="form-input"
              value={formData.job_title}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">אזור / מקום עבודה</label>
            <input
              type="text"
              name="work_location"
              className="form-input"
              value={formData.work_location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">מצב משפחתי</label>
            <input
              type="text"
              name="marital_status"
              className="form-input"
              value={formData.marital_status}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">השכלה</label>
            <input
              type="text"
              name="education"
              className="form-input"
              value={formData.education}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">תאריך לידה</label>
            <input
              type="date"
              name="birth_date"
              className="form-input"
              value={formData.birth_date}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">מועד תחילת עבודה</label>
            <input
              type="date"
              name="employment_start_date"
              className="form-input"
              value={formData.employment_start_date}
              onChange={handleDateChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label checkbox-label">
              <input
                type="checkbox"
                name="was_license_revoked"
                checked={formData.was_license_revoked}
                onChange={handleBooleanChange}
                className="form-checkbox"
              />
              <span>נשלל בפועל בעבר</span>
            </label>
          </div>
          <div className="form-group">
            <label className="form-label checkbox-label">
              <input
                type="checkbox"
                name="has_hazardous_materials_permit"
                checked={formData.has_hazardous_materials_permit}
                onChange={handleBooleanChange}
                className="form-checkbox"
              />
              <span>היתר להוביל חומרים מסוכנים</span>
            </label>
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label checkbox-label">
              <input
                type="checkbox"
                name="has_crane_operation_permit"
                checked={formData.has_crane_operation_permit}
                onChange={handleBooleanChange}
                className="form-checkbox"
              />
              <span>היתר להפעיל מנוף</span>
            </label>
          </div>
          <div className="form-group"></div>
        </div>

        <div className="form-group">
          <label className="form-label">הערות כלליות</label>
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
            {loading ? 'יוצר...' : 'צור נהג'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDriverModal;
