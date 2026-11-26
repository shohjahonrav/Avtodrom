import type { DiagonalParkingAreaConfig, UVPoint } from '@/features/autodrom/mapTypes';

const pt = (u: number, v: number): UVPoint => ({ u, v });

const STALL_BASES_U = [
  0.116, 0.150, 0.184, 0.219, 0.253, 0.287, 0.323, 0.356, 0.391, 0.425, 0.461,
];

export const AUTODROM_PARKING_AREAS: DiagonalParkingAreaConfig[] = [
  {
    id: 'parking-south-west-diagonal',
    region: 'south_west_parking',
    lineWidthMeters: 0.15,
    boundaryLoopUV: [
      pt(0.110, 0.775),
      pt(0.490, 0.775),
      pt(0.490, 0.884),
      pt(0.110, 0.884),
      pt(0.075, 0.870),
      pt(0.062, 0.830),
      pt(0.075, 0.790),
    ],
    curbArcUV: [
      pt(0.130, 0.775),
      pt(0.100, 0.778),
      pt(0.078, 0.792),
      pt(0.065, 0.816),
      pt(0.065, 0.844),
      pt(0.078, 0.868),
      pt(0.100, 0.882),
      pt(0.130, 0.884),
    ],
    stallLinesUV: STALL_BASES_U.map((uBot) => ({
      start: pt(uBot, 0.876),
      end: pt(uBot + 0.022, 0.814),
    })),
  },
];
