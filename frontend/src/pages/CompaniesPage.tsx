import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { companiesApi, searchApi, type Company } from '../api/client';
import AddCompanyModal from '../components/AddCompanyModal';

const CompaniesPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await companiesApi.getAll();
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      if (query.trim()) {
        const response = await searchApi.companies(query);
        setCompanies(response.data);
      } else {
        fetchCompanies();
      }
    } catch (error) {
      console.error('Error searching companies:', error);
    }
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
          <p className="page-title">חברות</p>
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
            <span className="btn-text">הוסף חברה</span>
          </button>
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>שם חברה</th>
                  <th>תעודת זהות</th>
                  <th>טלפון</th>
                  <th>אימייל</th>
                  <th>רכבים</th>
                  <th>נהגים</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-secondary empty-state">
                      לא נמצאו חברות
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr 
                      key={company.id}
                      onClick={() => navigate(`/companies/${company.id}`)}
                      className="table-row-clickable"
                    >
                      <td>
                        <Link to={`/companies/${company.id}`} className="link-inline" onClick={(e) => e.stopPropagation()}>
                          {company.name || company.identity_card}
                        </Link>
                      </td>
                      <td>{company.identity_card}</td>
                      <td>{company.phone || '-'}</td>
                      <td>{company.email || '-'}</td>
                      <td>{company.vehicles_count || 0}</td>
                      <td>{company.drivers_count || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchCompanies();
          setSearchQuery('');
        }}
      />
    </div>
  );
};

export default CompaniesPage;

