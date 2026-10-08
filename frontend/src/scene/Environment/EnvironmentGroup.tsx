import React from 'react';
import { Nebula } from './Nebula';
import { Stars } from './Stars';
import { Meridians } from './Meridians';
import { Oculus } from './Oculus';
import { Floor } from './Floor';
import { Dust } from './Dust';
import { FluidSculpture } from './FluidSculpture';
import { PerformanceTier } from '../store';

interface EnvironmentGroupProps {
  tier: PerformanceTier;
}

export const EnvironmentGroup: React.FC<EnvironmentGroupProps> = ({ tier }) => {
  const starCount = tier === 'high' ? 6000 : tier === 'mid' ? 4000 : 2000;
  const dustCount = tier === 'high' ? 600 : tier === 'mid' ? 300 : 150;

  return (
    <group>
      {/* 3D Flowing Fluid Sculpture Foundation */}
      <FluidSculpture />
      <Nebula />
      <Stars count={starCount} />
      <Meridians />
      <Oculus />
      <Floor />
      <Dust count={dustCount} />
    </group>
  );
};
