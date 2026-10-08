import { FileRecordItem } from '../../services/api';
import { COLOR_TOKENS } from '../../lib/tokens';

export interface OrreryBody {
  id: string;
  filename: string;
  radius: number;
  angle: number;
  size: number;
  color: string;
  status: string;
  featureCount: number;
  processingTimeMs: number | null;
}

export function adaptFilesToOrreryBodies(files: FileRecordItem[]): OrreryBody[] {
  const radii = [3.0, 4.6, 6.4, 8.5, 11.0];

  if (files.length === 0) {
    // Illustrative default sample body when DB is empty
    return [
      {
        id: 'sample-1',
        filename: 'Illustrative Sample KML',
        radius: 3.0,
        angle: 0,
        size: 0.3,
        color: COLOR_TOKENS.status.nominal,
        status: 'COMPLETED',
        featureCount: 5,
        processingTimeMs: 25,
      },
    ];
  }

  return files.slice(0, 15).map((f, idx) => {
    const ringIndex = idx % radii.length;
    const radius = radii[ringIndex];
    const angle = ((idx * 2 * Math.PI) / Math.min(15, files.length)) + (ringIndex * 0.4);
    const size = Math.max(0.2, Math.min(0.45, 0.2 + (f.feature_count || 1) * 0.04));

    let color = COLOR_TOKENS.status.nominal;
    if (f.status === 'FAILED') color = COLOR_TOKENS.status.critical;
    else if (f.status === 'PROCESSING' || f.status === 'PENDING') color = COLOR_TOKENS.status.degraded;

    return {
      id: f.id,
      filename: f.filename,
      radius,
      angle,
      size,
      color,
      status: f.status,
      featureCount: f.feature_count,
      processingTimeMs: f.processing_time_ms,
    };
  });
}
