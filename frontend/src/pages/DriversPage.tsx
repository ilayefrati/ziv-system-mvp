import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { driversApi, searchApi, type Driver } from '../api/client';
import AddDriverModal from '../components/AddDriverModal';

const DriversPage = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await driversApi.getAll();
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      if (query.trim()) {
        const response = await searchApi.drivers(query);
        setDrivers(response.data);
      } else {
        fetchDrivers();
      }
    } catch (error) {
      console.error('Error searching drivers:', error);
    }
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">טוען...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <p className="page-title">נהגים</p>
        </div>
        <div className="page-actions">
          <div className="search-container">
            <label className="form-group">
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                  </svg>
                </div>
                <input
                  placeholder="חיפוש לפי שם או תעודת זהות"
                  className="form-input search-input"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </label>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <span className="btn-text">הוסף נהג</span>
          </button>
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>שם</th>
                  <th>תעודת זהות</th>
                  <th>חברה</th>
                  <th>סוג רישיון</th>
                  <th>תפוגת רישיון</th>
                  <th>רכב</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-secondary empty-state">
                      לא נמצאו נהגים
                    </td>
                  </tr>
                ) : (
                  drivers.map((driver) => (
                    <tr 
                      key={driver.id}
                      onClick={() => navigate(`/drivers/${driver.id}`)}
                      className="table-row-clickable"
                    >
                      <td>
                        <Link to={`/drivers/${driver.id}`} className="link-inline" onClick={(e) => e.stopPropagation()}>
                          {driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || '-'}
                        </Link>
                      </td>
                      <td>{driver.identity_card}</td>
                      <td>{driver.company_name || '-'}</td>
                      <td>{driver.license_class || '-'}</td>
                      <td className={driver.license_expiry_date && isExpired(driver.license_expiry_date) ? 'text-red' : 'text-secondary'}>
                        {driver.license_expiry_date ? new Date(driver.license_expiry_date).toLocaleDateString() : '-'}
                      </td>
                      <td>{driver.vehicle_plate || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddDriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchDrivers();
          setSearchQuery('');
        }}
      />
    </div>
  );
};

export default DriversPage;
