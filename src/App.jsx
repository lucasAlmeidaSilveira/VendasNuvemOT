import './App.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useTab } from './context/TabContext';
import { RoutesTabs } from './tools/RoutesTabs';
import { FilterDate } from './components/FilterDate';
import { AuthPopup } from './components/AuthPopup';

function App() {
  const { activeTab } = useTab();

  return (
    <>
      <AuthPopup />
      <Header />
      <Footer />
      <div className={activeTab === 3 ? 'hidden' : ''}>
        <FilterDate />
      </div>
      <RoutesTabs activeTab={activeTab} />
    </>
  );
}

export default App;
