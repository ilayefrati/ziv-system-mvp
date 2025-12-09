import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <div className="header-left">
        <div className="header-brand">
          <div className="header-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_6_535)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                  fill="currentColor"
                ></path>
              </g>
              <defs>
                <clipPath id="clip0_6_535"><rect width="48" height="48" fill="white"></rect></clipPath>
              </defs>
            </svg>
          </div>
          <h2 className="header-title">מערכת זיו</h2>
        </div>
        <div className="header-nav">
          <Link to="/">לוח בקרה</Link>
          <Link to="/vehicles">רכבים</Link>
          <Link to="/drivers">נהגים</Link>
          <Link to="/companies">חברות</Link>
        </div>
      </div>
      <div className="header-right">
        <div className="user-section">
          <div className="user-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
            </svg>
          </div>
          <span className="user-greeting">שלום מנהל</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

