import React, { useEffect } from 'react';
import { NavItem } from './Sidebar';
import { TopBar } from './TopBar';
import { SpatialNav } from '../spatial/SpatialNav';
import { SceneMode } from '../../scene/store';
import { motion, AnimatePresence } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  onOpenUploadModal: () => void;
  onOpenSearchModal: () => void;
  isBackendHealthy: boolean;
  selectedCrs: string;
  onChangeCrs: (crs: string) => void;
  datasetCount?: number;
  sceneMode: SceneMode;
  onToggleSceneMode: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  onSelectTab,
  onOpenUploadModal,
  onOpenSearchModal,
  isBackendHealthy,
  selectedCrs,
  onChangeCrs,
  sceneMode,
  onToggleSceneMode,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearchModal]);

  return (
    <div className="relative flex h-screen bg-[#06070B] text-[#ECE8DF] font-sans overflow-hidden antialiased selection:bg-[#D6A24A]/30">
      {/* Floating Brass-Framed Spatial Top Navigation Bar */}
      <SpatialNav
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isBackendHealthy={isBackendHealthy}
        sceneMode={sceneMode}
        onToggleSceneMode={onToggleSceneMode}
      />

      {/* Main Container Full Width */}
      <div className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden pt-20">
        {/* Top Bar Secondary Info Header */}
        <TopBar
          onOpenUploadModal={onOpenUploadModal}
          onOpenSearchModal={onOpenSearchModal}
          isBackendHealthy={isBackendHealthy}
          selectedCrs={selectedCrs}
          onChangeCrs={onChangeCrs}
        />

        {/* Dynamic View Area with 3D Spatial Page Transitions */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0E17]/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, z: -40, scale: 0.98 }}
              animate={{ opacity: 1, z: 0, scale: 1 }}
              exit={{ opacity: 0, z: 40, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
