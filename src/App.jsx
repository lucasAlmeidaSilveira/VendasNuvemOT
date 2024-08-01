import './App.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useTab } from './context/TabContext';
import { RoutesTabs } from './tools/RoutesTabs';
import { FilterDate } from './components/FilterDate';

function App() {
  const { activeTab } = useTab();

  return (
    <>
      <Header />
      <Footer />
      <div className={activeTab === 1 || activeTab === 3 ? 'hidden' : ''}>
        <FilterDate />
      </div>
      <RoutesTabs activeTab={activeTab} />
    </>
  );
}

export default App;
