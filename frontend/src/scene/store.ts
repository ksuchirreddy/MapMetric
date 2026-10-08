import { checkKillSwitch } from '../lib/tokens';

export type PerformanceTier = 'high' | 'mid' | 'low' | 'minimal' | 'off';
export type SceneMode = 'full' | 'calm' | 'off';

export interface SceneStoreState {
  scrollProgress: number;
  activeSection: string;
  hoveredId: string | null;
  selectedId: string | null;
  pointer: { x: number; y: number };
  tier: PerformanceTier;
  sceneMode: SceneMode;
  isKillSwitchActive: boolean;
}

class SceneStore {
  private listeners: Set<() => void> = new Set();
  private state: SceneStoreState = {
    scrollProgress: 0,
    activeSection: 'dashboard',
    hoveredId: null,
    selectedId: null,
    pointer: { x: 0, y: 0 },
    tier: 'high',
    sceneMode: checkKillSwitch() ? 'off' : 'full',
    isKillSwitchActive: checkKillSwitch(),
  };

  getState(): SceneStoreState {
    return this.state;
  }

  setState(partial: Partial<SceneStoreState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const sceneStore = new SceneStore();
