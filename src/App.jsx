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
      {activeTab !== 1 && <FilterDate />}
      <RoutesTabs activeTab={activeTab} />
    </>
  );
}

export default App;
