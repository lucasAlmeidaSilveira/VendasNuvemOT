import './App.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useTab } from './context/TabContext';
import { RoutesTabs } from './tools/RoutesTabs';
import { FilterDate } from './components/FilterDate';
import { AuthPopup } from './components/AuthPopup';
import { BackToTop } from './components/BackToTop';
import { Toolbar } from '@mui/material';

function App() {
  const { activeTab } = useTab();

  return (
    <>
      <AuthPopup />
      <Toolbar style={{minHeight: '0px'}} id="back-to-top-anchor" />
      <Header />
      <Footer />
      <div className={activeTab === 3 ? 'hidden' : ''}>
        <FilterDate />
      </div>
      <RoutesTabs activeTab={activeTab} />
      <BackToTop />
    </>
  );
}

export default App;
