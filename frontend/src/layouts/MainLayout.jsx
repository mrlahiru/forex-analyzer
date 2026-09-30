import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { fetchHealth, fetchProviderStatus } from '../services/api';

export const MainLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthInfo, setHealthInfo] = useState(null);
  const [providerStatus, setProviderStatus] = useState(null);
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [latency, setLatency] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = async () => {
    setIsRefreshing(true);
    const result = await fetchHealth();
    if (result.success) {
      setHealthInfo(result.data);
      setIsApiOnline(true);
      setLatency(result.latency);

      // Fetch provider status alongside health
      const provRes = await fetchProviderStatus();
      if (provRes.success) {
        setProviderStatus(provRes.data);
      }
    } else {
      setIsApiOnline(false);
      setLatency(null);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#060911] flex flex-col text-slate-100 relative overflow-hidden">
      {/* Ambient Decorative Lighting */}
      <div className="fixed inset-0 pointer-events-none aurora-glow z-0 opacity-70" />
      <div className="fixed inset-0 pointer-events-none cyber-grid opacity-30 z-0" />

      {/* Primary Application Shell */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          healthInfo={healthInfo}
          isApiOnline={isApiOnline}
          latency={latency}
          providerStatus={providerStatus}
        />
        <div className="flex flex-1">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 overflow-y-auto">
            {React.cloneElement(children, {
              healthInfo,
              providerStatus,
              isApiOnline,
              latency,
              onRefreshHealth: checkStatus,
              isRefreshing,
              activeTab,
              setActiveTab,
            })}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
