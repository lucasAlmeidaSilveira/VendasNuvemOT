import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useTab } from './context/TabContext';
import { RoutesTabs } from './tools/RoutesTabs';
import { FilterDate } from './components/FilterDate';
import { AuthPopup } from './components/AuthPopup';
import { BackToTop } from './components/BackToTop';
import { Toolbar } from '@mui/material';
import { AlertStatusInternet } from './components/AlertStatusInternet';
import { Analytics } from '@vercel/analytics/react';
import { StatusPage } from './pages/Status';

function HomePage() {
  const { activeTab } = useTab();
  return (
    <>
      <Toolbar style={{ minHeight: '0px' }} id="back-to-top-anchor" />
      <Header />
      <Footer />
      <div
        className={activeTab === 3 ? 'hidden' : activeTab === 5 ? 'hidden' : ''}
      >
        <FilterDate />
      </div>
      <RoutesTabs activeTab={activeTab} />
      <BackToTop />
    </>
  );
}

export default function App() {
  return (
    <>
      <AuthPopup />
      <AlertStatusInternet />
      <Analytics />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </>
  );
}
