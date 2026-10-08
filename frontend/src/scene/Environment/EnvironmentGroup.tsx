import React from 'react';
import { Nebula } from './Nebula';
import { Stars } from './Stars';
import { Meridians } from './Meridians';
import { Oculus } from './Oculus';
import { Floor } from './Floor';
import { Dust } from './Dust';
import { PerformanceTier } from '../store';

interface EnvironmentGroupProps {
  tier: PerformanceTier;
}

export const EnvironmentGroup: React.FC<EnvironmentGroupProps> = ({ tier }) => {
  const starCount = tier === 'high' ? 8000 : tier === 'mid' ? 5000 : 2500;
  const dustCount = tier === 'high' ? 800 : tier === 'mid' ? 400 : 200;

  return (
    <group>
      <Nebula />
      <Stars count={starCount} />
      <Meridians />
      <Oculus />
      <Floor />
      <Dust count={dustCount} />
    </group>
  );
};
