// Must match dark theme token values in src/index.css — update when tokens change
export const CANVAS_FALLBACKS = {
  border: 'oklch(0.38 0.02 260)',
  textPrimary: 'oklch(0.93 0.01 260)',
  textSecondary: 'oklch(0.72 0.02 260)',
  textMuted: 'oklch(0.57 0.02 260)',
  accent: 'oklch(0.7 0.2 230)',
  statusNominal: 'oklch(0.7 0.19 155)',
  statusCaution: 'oklch(0.75 0.18 65)',
  statusCritical: 'oklch(0.6 0.24 25)',
  imuSky: 'oklch(0.5 0.14 230)',
  imuGround: 'oklch(0.35 0.1 65)',
  surfaceBase: 'oklch(0.09 0.02 260)',
} satisfies Record<string, string>;
