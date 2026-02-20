import { Link, useLocation } from 'react-router-dom';

import BlueHoldImage from '../../assets/images/blue_hold.png';
import GreenHoldImage from '../../assets/images/green_hold.png';
import YellowHoldImage from '../../assets/images/yellow_hold.png';

export const PageHeader = () => {
  const { pathname } = useLocation();

  return (
    <header className="result-page__header">
      <div className="result-page__header-logo">BOLLOG</div>
      <nav className="result-page__header-nav">
        <Link
          to="/month"
          className={`result-page__nav-link result-page__nav-link--month${pathname === '/month' ? ' result-page__nav-link--active' : ''}`}
        >
          <img
            src={GreenHoldImage}
            style={{ width: '20px', marginRight: '10px' }}
            alt="マンスリー別完登率"
          />
          マンスリー別完登率
        </Link>
        <Link
          to="/area"
          className={`result-page__nav-link result-page__nav-link--area${pathname === '/area' ? ' result-page__nav-link--active' : ''}`}
        >
          <img
            src={BlueHoldImage}
            style={{ width: '20px', marginRight: '10px' }}
            alt="エリア別完登率"
          />
          エリア別完登率
        </Link>
        <Link
          to="/trylog"
          className={`result-page__nav-link result-page__nav-link--trylog${pathname === '/trylog' ? ' result-page__nav-link--active' : ''}`}
        >
          <img
            src={YellowHoldImage}
            style={{ width: '17px', marginRight: '10px' }}
            alt="トライログ"
          />
          トライログ
        </Link>
      </nav>
    </header>
  );
};
