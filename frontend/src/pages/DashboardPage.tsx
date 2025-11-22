import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { companiesApi, vehiclesApi, driversApi } from '../api/client';

interface Stats {
  vehicles: number;
  drivers: number;
  companies: number;
}

interface ExpiryAlert {
  document: string;
  vehicle?: string;
  vehicle_id?: number;
  driver?: string;
  driver_id?: number;
  company?: string;
  company_id?: number;
  expiry_date: string;
  status: 'expired' | 'expiring_soon';
  days_until_expiry: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<Stats>({ vehicles: 0, drivers: 0, companies: 0 });
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, driversRes, companiesRes] = await Promise.all([
          vehiclesApi.getAll(),
          driversApi.getAll(),
          companiesApi.getAll(),
        ]);

        setStats({
          vehicles: vehiclesRes.data.length,
          drivers: driversRes.data.length,
          companies: companiesRes.data.length,
        });

        // Calculate expiry alerts
        const alerts: ExpiryAlert[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const checkDate = (dateStr: string | null | undefined, documentName: string, vehicle?: any, driver?: any, company?: any) => {
          if (!dateStr) return;
          
          const expiry = new Date(dateStr);
          expiry.setHours(0, 0, 0, 0);
          const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (expiry < today || expiry <= thirtyDaysFromNow) {
            const alert: ExpiryAlert = {
              document: documentName,
              expiry_date: dateStr,
              status: expiry < today ? 'expired' : 'expiring_soon',
              days_until_expiry: daysUntilExpiry,
            };
            
            if (vehicle) {
              alert.vehicle = vehicle.license_plate;
              alert.vehicle_id = vehicle.id;
              alert.driver = vehicle.driver_name || undefined;
            }
            if (driver) {
              alert.driver = driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || undefined;
              alert.driver_id = driver.id;
            }
            if (company) {
              alert.company = company.name || company.identity_card;
              alert.company_id = company.id;
            }
            
            alerts.push(alert);
          }
        };

        // Check vehicle expiry dates
        vehiclesRes.data.forEach((vehicle: any) => {
          checkDate(vehicle.license_expiry_date, 'Vehicle License', vehicle);
          checkDate(vehicle.next_safety_inspection, 'Safety Inspection', vehicle);
          checkDate(vehicle.hova_insurance_expiry_date, 'Hova Insurance', vehicle);
          checkDate(vehicle.mekif_insurance_expiry_date, 'Mekif Insurance', vehicle);
          checkDate(vehicle.carrier_license_expiry_date, 'Carrier License', vehicle);
          checkDate(vehicle.hazardous_license_expiry_date, 'Hazardous License', vehicle);
          checkDate(vehicle.tachograph_expiry_date, 'Tachograph', vehicle);
          checkDate(vehicle.winter_inspection_expiry_date, 'Winter Inspection', vehicle);
          checkDate(vehicle.brake_inspection_expiry_date, 'Brake Inspection', vehicle);
          checkDate(vehicle.special_equipment_expiry_date, 'Special Equipment', vehicle);
        });

        // Check driver expiry dates
        driversRes.data.forEach((driver: any) => {
          checkDate(driver.license_expiry_date, 'Driver License', undefined, driver);
          checkDate(driver.traffic_info_expiry_date, 'Traffic Info', undefined, driver);
        });

        // Check company expiry dates
        companiesRes.data.forEach((company: any) => {
          checkDate(company.carrier_license_expiry, 'Company Carrier License', undefined, undefined, company);
        });

        // Sort by expiry date (soonest first)
        alerts.sort((a, b) => {
          const dateA = new Date(a.expiry_date).getTime();
          const dateB = new Date(b.expiry_date).getTime();
          return dateA - dateB;
        });

        setExpiryAlerts(alerts);
        setCurrentPage(1); // Reset to first page when data refreshes
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <p className="page-title">Dashboard</p>
        </div>
        <h2 className="page-section-title">Quick insights</h2>
        <div className="stats-grid">
          <Link to="/vehicles" className="stat-card-link">
            <div className="stat-card">
              <p className="stat-label">Vehicles</p>
              <p className="stat-value">{stats.vehicles}</p>
            </div>
          </Link>
          <Link to="/drivers" className="stat-card-link">
            <div className="stat-card">
              <p className="stat-label">Drivers</p>
              <p className="stat-value">{stats.drivers}</p>
            </div>
          </Link>
          <Link to="/companies" className="stat-card-link">
            <div className="stat-card">
              <p className="stat-label">Companies</p>
              <p className="stat-value">{stats.companies}</p>
            </div>
          </Link>
        </div>
        <h2 className="page-section-title">Upcoming expiry alerts</h2>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Entity</th>
                  <th>Related</th>
                  <th>Expiry date</th>
                  <th className="narrow">Status</th>
                </tr>
              </thead>
              <tbody>
                {expiryAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary empty-state">
                      No expiry alerts
                    </td>
                  </tr>
                ) : (
                  expiryAlerts
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((alert, index) => {
                    const expiryDate = new Date(alert.expiry_date);
                    const formattedDate = expiryDate.toLocaleDateString();
                    const daysText = alert.days_until_expiry < 0 
                      ? `${Math.abs(alert.days_until_expiry)} days ago`
                      : alert.days_until_expiry === 0
                      ? 'Today'
                      : `${alert.days_until_expiry} days`;

                    return (
                      <tr key={index}>
                        <td>{alert.document}</td>
                        <td>
                          {alert.vehicle_id ? (
                            <Link to={`/vehicles/${alert.vehicle_id}`} className="link-inline">
                              {alert.vehicle}
                            </Link>
                          ) : alert.driver_id ? (
                            <Link to={`/drivers/${alert.driver_id}`} className="link-inline">
                              {alert.driver}
                            </Link>
                          ) : alert.company_id ? (
                            <Link to={`/companies/${alert.company_id}`} className="link-inline">
                              {alert.company}
                            </Link>
                          ) : (
                            alert.vehicle || alert.driver || alert.company || '-'
                          )}
                        </td>
                        <td>
                          {alert.vehicle_id && alert.driver ? (
                            alert.driver
                          ) : alert.driver_id && alert.vehicle ? (
                            alert.vehicle
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-secondary">
                          {formattedDate} <span className="text-secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>({daysText})</span>
                        </td>
                        <td className="narrow">
                          <button
                            className={`btn ${alert.status === 'expired' ? 'btn-danger' : 'btn-warning'}`}
                          >
                            <span className="btn-text">
                              {alert.status === 'expired' ? 'Expired' : 'Expiring Soon'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {expiryAlerts.length > itemsPerPage && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <span className="btn-text">Previous</span>
            </button>
            <span className="pagination-info">
              Page {currentPage} of {Math.ceil(expiryAlerts.length / itemsPerPage)} ({expiryAlerts.length} total)
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(expiryAlerts.length / itemsPerPage), prev + 1))}
              disabled={currentPage >= Math.ceil(expiryAlerts.length / itemsPerPage)}
            >
              <span className="btn-text">Next</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

