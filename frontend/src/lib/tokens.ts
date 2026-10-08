export const COLOR_TOKENS = {
  void: '#06070B',
  ink: '#0B0E17',
  slate: '#141A2B',
  slate2: '#1C2438',
  line: 'rgba(236,232,223,0.10)',

  paper: '#ECE8DF',
  paperDim: '#A9A8A0',
  paperFaint: '#6F7280',

  brass: '#D6A24A',
  brassHi: '#F0C879',
  brassLo: '#8A6428',

  glass: '#8EDCEB',
  nebulaPlum: '#3B2A5C',
  deepIndigo: '#121A38',

  status: {
    nominal: '#5FE0B0',
    degraded: '#F2C14E',
    critical: '#FF5C4D',
    unknown: '#8FA8FF',
  },
};

export function checkKillSwitch(): boolean {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('scene') === 'off') {
    localStorage.setItem('mapmetric_scene_mode', 'off');
    return true;
  }
  return localStorage.getItem('mapmetric_scene_mode') === 'off';
}
