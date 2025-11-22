import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vehiclesApi, searchApi } from '../api/client';
import AddVehicleModal from '../components/AddVehicleModal';

interface Vehicle {
  id: number;
  license_plate: string;
  manufacturer?: string;
  model?: string;
  production_year?: number;
  car_type?: string;
  company_name?: string;
  driver_name?: string;
  license_expiry_date?: string;
  next_safety_inspection?: string;
  is_operational?: boolean;
}

const VehiclesPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesApi.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      if (query.trim()) {
        const response = await searchApi.vehicles(query);
        setVehicles(response.data);
      } else {
        fetchVehicles();
      }
    } catch (error) {
      console.error('Error searching vehicles:', error);
    }
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <p className="page-title">Vehicles</p>
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
                  placeholder="Search by license plate"
                  className="form-input search-input"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </label>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <span className="btn-text">Add Vehicle</span>
          </button>
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>License Plate</th>
                  <th>Make/Model</th>
                  <th>Company</th>
                  <th>Driver</th>
                  <th>Registration Expiry</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary empty-state">
                      No vehicles found
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr 
                      key={vehicle.id}
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      className="table-row-clickable"
                    >
                      <td>
                        <Link to={`/vehicles/${vehicle.id}`} className="link-inline" onClick={(e) => e.stopPropagation()}>
                          {vehicle.license_plate}
                        </Link>
                      </td>
                      <td>
                        {[vehicle.manufacturer, vehicle.model, vehicle.production_year].filter(Boolean).join(' ') || '-'}
                      </td>
                      <td>{vehicle.company_name || '-'}</td>
                      <td>{vehicle.driver_name || '-'}</td>
                      <td className={vehicle.license_expiry_date && isExpired(vehicle.license_expiry_date) ? 'text-red' : 'text-secondary'}>
                        {vehicle.license_expiry_date ? new Date(vehicle.license_expiry_date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchVehicles();
          setSearchQuery('');
        }}
      />
    </div>
  );
};

export default VehiclesPage;
