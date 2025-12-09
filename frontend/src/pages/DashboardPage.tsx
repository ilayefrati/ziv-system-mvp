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
          checkDate(vehicle.license_expiry_date, 'תוקף רישיון', vehicle);
          checkDate(vehicle.next_safety_inspection, 'בדיקת קב"ט הבאה', vehicle);
          checkDate(vehicle.hova_insurance_expiry_date, 'תוקף ביטוח חובה', vehicle);
          checkDate(vehicle.mekif_insurance_expiry_date, 'תוקף ביטוח מקיף/ג', vehicle);
          checkDate(vehicle.carrier_license_expiry_date, 'תוקף רישיון מוביל', vehicle);
          checkDate(vehicle.hazardous_license_expiry_date, 'תוקף היתר חומ"ס', vehicle);
          checkDate(vehicle.tachograph_expiry_date, 'תוקף כיול טכוגרף', vehicle);
          checkDate(vehicle.winter_inspection_expiry_date, 'תוקף בדיקת חורף', vehicle);
          checkDate(vehicle.brake_inspection_expiry_date, 'תוקף בדיקת בלמים חצי שנתית', vehicle);
          checkDate(vehicle.special_equipment_expiry_date, 'תוקף ציוד ייעודי', vehicle);
        });

        // Check driver expiry dates
        driversRes.data.forEach((driver: any) => {
          checkDate(driver.license_expiry_date, 'תוקף רישיון נהיגה', undefined, driver);
          checkDate(driver.traffic_info_expiry_date, 'תוקף מידע תעבורתי', undefined, driver);
        });

        // Check company expiry dates
        companiesRes.data.forEach((company: any) => {
          checkDate(company.carrier_license_expiry, 'רישיון מוביל בתוקף עד', undefined, undefined, company);
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
        <div className="loading">טוען...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <p className="page-title">לוח בקרה</p>
        </div>
        <div className="stats-grid">
          <Link to="/vehicles" className="stat-card-link">
            <div className="stat-card">
              <p className="stat-label">רכבים</p>
              <p className="stat-value">{stats.vehicles}</p>
            </div>
          </Link>
          <Link to="/drivers" className="stat-card-link">
            <div className="stat-card">
              <p className="stat-label">נהגים</p>
              <p className="stat-value">{stats.drivers}</p>
            </div>
          </Link>
          <Link to="/companies" className="stat-card-link">
            <div className="stat-card">
              <p className="stat-label">חברות</p>
              <p className="stat-value">{stats.companies}</p>
            </div>
          </Link>
        </div>
        <h2 className="page-section-title">התראות תפוגה קרובות</h2>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>מסמך</th>
                  <th>ישות</th>
                  <th>סוג</th>
                  <th>תאריך תפוגה</th>
                  <th className="narrow">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {expiryAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary empty-state">
                      אין התראות תפוגה
                    </td>
                  </tr>
                ) : (
                  expiryAlerts
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((alert, index) => {
                    const expiryDate = new Date(alert.expiry_date);
                    const formattedDate = expiryDate.toLocaleDateString();
                    const daysText = alert.days_until_expiry < 0 
                      ? `לפני ${Math.abs(alert.days_until_expiry)} ימים`
                      : alert.days_until_expiry === 0
                      ? 'היום'
                      : `${alert.days_until_expiry} ימים`;

                    const entityType = alert.vehicle_id ? 'רכב' : alert.driver_id ? 'נהג' : alert.company_id ? 'חברה' : '-';

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
                        <td>{entityType}</td>
                        <td className="text-secondary">
                          {formattedDate} <span className="text-secondary" style={{ fontSize: '12px', marginRight: '8px' }}>({daysText})</span>
                        </td>
                        <td className="narrow">
                          <button
                            className={`btn ${alert.status === 'expired' ? 'btn-danger' : 'btn-warning'}`}
                          >
                          <span className="btn-text">
                            {alert.status === 'expired' ? 'פג תוקף' : 'יפוג בקרוב'}
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
              <span className="btn-text">הקודם</span>
            </button>
            <span className="pagination-info">
              עמוד {currentPage} מתוך {Math.ceil(expiryAlerts.length / itemsPerPage)} ({expiryAlerts.length} סה"כ)
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(expiryAlerts.length / itemsPerPage), prev + 1))}
              disabled={currentPage >= Math.ceil(expiryAlerts.length / itemsPerPage)}
            >
              <span className="btn-text">הבא</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

