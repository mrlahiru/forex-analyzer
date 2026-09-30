import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { fetchHealth } from '../services/api';

export const MainLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthInfo, setHealthInfo] = useState(null);
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
    } else {
      setIsApiOnline(false);
      setLatency(null);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkStatus();
    // Poll health endpoint every 15 seconds
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#080B11] flex flex-col text-slate-100">
      <Header
        healthInfo={healthInfo}
        isApiOnline={isApiOnline}
        latency={latency}
      />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto bg-[#080B11]">
          {React.cloneElement(children, {
            healthInfo,
            isApiOnline,
            latency,
            onRefreshHealth: checkStatus,
            isRefreshing,
          })}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
