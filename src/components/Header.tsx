import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <div className="container">
      <nav className="navbar navbar-dark bg-dark px-0" aria-label="Custom navbar" id="freg-nav">
        <div className="container-fluid d-flex justify-content-between align-items-start">

          {/* LEFT SIDE: Brand + vertical nav */}
          <div className="d-flex flex-column align-items-start">
            <Link className="navbar-brand mb-2" to="/">MyApp</Link>
            <ul className="navbar-nav flex-row">
              <li className="nav-item me-3">
                <Link
                  to="/fees"
                  className={`nav-link ${location.pathname === '/fees' || location.pathname === '/' ? 'active' : ''}`}
                >
                  Fees
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/create"
                  className={`nav-link ${location.pathname === '/create' ? 'active' : ''}`}
                >
                  Create Fee
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/datatable"
                  className="nav-link"
                >
                  Data Table
                </Link>
              </li>
            </ul>
          </div>

          {/* RIGHT SIDE: Logout button */}
          <ul className="navbar-nav flex-row">
            <li className="nav-item">
              <Link to="/logout" className="nav-link">Logout</Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Header;