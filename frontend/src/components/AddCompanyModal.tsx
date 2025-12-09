import { useState } from 'react';
import Modal from './Modal';
import { companiesApi } from '../api/client';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCompanyModal = ({ isOpen, onClose, onSuccess }: AddCompanyModalProps) => {
  const [formData, setFormData] = useState({
    identity_card: '',
    name: '',
    address: '',
    po_box: '',
    phone: '',
    fax: '',
    contact_person: '',
    contact_phone: '',
    manager_name: '',
    manager_phone: '',
    manager_id: '',
    email: '',
    safety_officer: '',
    carrier_license_expiry: '',
    established_date: '',
    inspection_week: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        name: formData.name || undefined,
        address: formData.address || undefined,
        po_box: formData.po_box || undefined,
        phone: formData.phone || undefined,
        fax: formData.fax || undefined,
        contact_person: formData.contact_person || undefined,
        contact_phone: formData.contact_phone || undefined,
        manager_name: formData.manager_name || undefined,
        manager_phone: formData.manager_phone || undefined,
        manager_id: formData.manager_id || undefined,
        email: formData.email || undefined,
        safety_officer: formData.safety_officer || undefined,
        inspection_week: formData.inspection_week ? parseInt(formData.inspection_week) : undefined,
        notes: formData.notes || undefined,
      };

      if (formData.carrier_license_expiry) {
        payload.carrier_license_expiry = formData.carrier_license_expiry;
      }
      if (formData.established_date) {
        payload.established_date = formData.established_date;
      }

      await companiesApi.create(payload);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        identity_card: '',
        name: '',
        address: '',
        po_box: '',
        phone: '',
        fax: '',
        contact_person: '',
        contact_phone: '',
        manager_name: '',
        manager_phone: '',
        manager_id: '',
        email: '',
        safety_officer: '',
        carrier_license_expiry: '',
        established_date: '',
        inspection_week: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err.message || 'יצירת חברה נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="הוסף חברה">
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-error">{error}</div>}
        
        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">מספר ת.ז/ח.פ *</label>
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
            <label className="form-label">שם חברה</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">כתובת</label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">ת.ד (תיבת דואר)</label>
            <input
              type="text"
              name="po_box"
              className="form-input"
              value={formData.po_box}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">טלפון</label>
            <input
              type="text"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">פקס</label>
            <input
              type="text"
              name="fax"
              className="form-input"
              value={formData.fax}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
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
          <div className="form-group">
            <label className="form-label">קצין בטיחות אחראי</label>
            <input
              type="text"
              name="safety_officer"
              className="form-input"
              value={formData.safety_officer}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">איש קשר / אחראי</label>
            <input
              type="text"
              name="contact_person"
              className="form-input"
              value={formData.contact_person}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">טלפון איש קשר</label>
            <input
              type="text"
              name="contact_phone"
              className="form-input"
              value={formData.contact_phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">מנהל מקצועי</label>
            <input
              type="text"
              name="manager_name"
              className="form-input"
              value={formData.manager_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">ת.ז מנהל מקצועי</label>
            <input
              type="text"
              name="manager_id"
              className="form-input"
              value={formData.manager_id}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">טלפון מנהל מקצועי</label>
            <input
              type="text"
              name="manager_phone"
              className="form-input"
              value={formData.manager_phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">שבוע בדיקה</label>
            <input
              type="number"
              name="inspection_week"
              className="form-input"
              value={formData.inspection_week}
              onChange={handleNumberChange}
              min="1"
              max="52"
            />
          </div>
        </div>

        <div className="modal-form-row">
          <div className="form-group">
            <label className="form-label">רישיון מוביל בתוקף עד</label>
            <input
              type="date"
              name="carrier_license_expiry"
              className="form-input"
              value={formData.carrier_license_expiry}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">תאריך הקמה</label>
            <input
              type="date"
              name="established_date"
              className="form-input"
              value={formData.established_date}
              onChange={handleDateChange}
            />
          </div>
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
            {loading ? 'יוצר...' : 'צור חברה'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCompanyModal;
