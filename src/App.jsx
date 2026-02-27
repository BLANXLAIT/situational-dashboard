import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import DataSourcesPage from './components/DataSourcesPage';
import Sidebar from './components/Sidebar';

function App() {
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'sources'
  const [activeDomain, setActiveDomain] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeDomain={activeDomain}
        setActiveDomain={setActiveDomain}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="dashboard-main">
        {activeView === 'dashboard' ? (
          <Dashboard
            activeDomain={activeDomain}
            activeView={activeView}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        ) : (
          <DataSourcesPage
            setSidebarOpen={setSidebarOpen}
          />
        )}
      </main>
    </div>
  );
}

export default App;
