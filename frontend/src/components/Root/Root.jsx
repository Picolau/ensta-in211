import './Root.css';
import background from '../../../images/cinema-background.jpg';
import Header from '../Header/Header';

export const Root = ({ children }) => {
  return (
    <div className="Root-container">
      <img className="Root-background-image" src={background} alt="" />
      <div className="Root-background-shadow"></div>
      <Header />
      <div className="Root-content">{children}</div>
    </div>
  );
};
