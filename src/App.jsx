import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import DataSourcesPage from './components/DataSourcesPage';
import AIConfigPage from './components/AIConfigPage';
import Sidebar from './components/Sidebar';
import { useTheme } from './hooks/useTheme';

function App() {
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'sources'
  const [activeDomain, setActiveDomain] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
            theme={theme}
            toggleTheme={toggleTheme}
          />
        ) : activeView === 'aiconfig' ? (
          <AIConfigPage setSidebarOpen={setSidebarOpen} />
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
