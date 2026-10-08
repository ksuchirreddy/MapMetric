import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { NavItem } from './components/layout/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { InfrastructureView } from './components/views/InfrastructureView';
import { ResourcesView } from './components/views/ResourcesView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { CostIntelligenceView } from './components/views/CostIntelligenceView';
import { RecommendationsView } from './components/views/RecommendationsView';
import { AlertsView } from './components/views/AlertsView';
import { ActivityView } from './components/views/ActivityView';
import { SettingsView } from './components/views/SettingsView';
import { UploadModal } from './components/modals/UploadModal';
import { SearchModal } from './components/modals/SearchModal';
import { ErrorState } from './components/ui/ErrorState';
import { SceneRoot } from './scene/SceneRoot';
import { StaticOrrery } from './scene/fallback/StaticOrrery';
import { checkKillSwitch } from './lib/tokens';
import { detectPerformanceTier } from './scene/tier';
import { SceneMode, PerformanceTier } from './scene/store';
import { api, FileRecordItem } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavItem>('dashboard');
  const [files, setFiles] = useState<FileRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedCrs, setSelectedCrs] = useState<string>('AUTO_UTM');

  // Scene & Performance Tier
  const [sceneMode, setSceneMode] = useState<SceneMode>(checkKillSwitch() ? 'off' : 'full');
  const [tier, setTier] = useState<PerformanceTier>('high');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setTier(detectPerformanceTier());
  }, []);

  const toggleSceneMode = () => {
    setSceneMode((prev) => {
      const next = prev === 'full' ? 'calm' : prev === 'calm' ? 'off' : 'full';
      if (next === 'off') localStorage.setItem('mapmetric_scene_mode', 'off');
      else localStorage.removeItem('mapmetric_scene_mode');
      return next;
    });
  };

  // Fetch Health & Files
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const health = await api.getHealth().catch(() => ({ status: 'unhealthy' }));
      const healthy = health.status === 'healthy' || health.status === 'ok';
      setIsBackendHealthy(healthy);

      const fileList = await api.listFiles(100, 0);
      setFiles(fileList || []);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load initial MapMetric backend data:', err);
      setIsBackendHealthy(false);
      setApiError(err.message || 'Cannot connect to FastAPI backend at http://localhost:8000');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSelectFile = (fileId: string) => {
    setSelectedFileId(fileId);
    setActiveTab('resources');
  };

  const handleUploadSuccess = (newFileId: string) => {
    setSelectedFileId(newFileId);
    fetchInitialData();
    setActiveTab('resources');
  };

  const renderActiveView = () => {
    if (apiError && files.length === 0) {
      return (
        <ErrorState
          title="FastAPI Backend Unavailable"
          message={`MapMetric requires the FastAPI backend running on http://localhost:8000. Error: ${apiError}`}
          onRetry={fetchInitialData}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <OverviewView
            files={files}
            isLoading={isLoading}
            onRefresh={fetchInitialData}
            onSelectFile={handleSelectFile}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        );
      case 'infrastructure':
        return (
          <InfrastructureView
            files={files}
            isLoading={isLoading}
            onRefresh={fetchInitialData}
            onSelectFile={handleSelectFile}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        );
      case 'resources':
        return (
          <ResourcesView
            files={files}
            selectedFileId={selectedFileId}
            onSelectFile={(id) => setSelectedFileId(id)}
          />
        );
      case 'analytics':
        return <AnalyticsView files={files} />;
      case 'cost':
        return <CostIntelligenceView files={files} />;
      case 'recommendations':
        return <RecommendationsView files={files} />;
      case 'alerts':
        return <AlertsView files={files} />;
      case 'activity':
        return <ActivityView files={files} />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <OverviewView
            files={files}
            isLoading={isLoading}
            onRefresh={fetchInitialData}
            onSelectFile={handleSelectFile}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        );
    }
  };

  return (
    <>
      {/* Signal Orrery 3D Scene Root (when sceneMode !== 'off') */}
      {sceneMode !== 'off' ? (
        <SceneRoot
          files={files}
          hoveredId={hoveredId}
          selectedId={selectedFileId}
          onHoverBody={setHoveredId}
          onSelectBody={handleSelectFile}
          tier={tier}
          sceneMode={sceneMode}
        />
      ) : null}

      <MainLayout
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        isBackendHealthy={isBackendHealthy}
        selectedCrs={selectedCrs}
        onChangeCrs={setSelectedCrs}
        datasetCount={files.length}
        sceneMode={sceneMode}
        onToggleSceneMode={toggleSceneMode}
      >
        {sceneMode === 'off' && <StaticOrrery />}
        {renderActiveView()}
      </MainLayout>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        files={files}
        onSelectFile={handleSelectFile}
      />
    </>
  );
};
