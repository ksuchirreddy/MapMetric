import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const coreVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;
    float n = noise(position * 2.0 + vec3(uTime * 0.8));
    pos += normal * (n * 0.12);
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const coreFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;

  void main() {
    vec3 brassHi = vec3(0.94, 0.78, 0.47); // #F0C879
    vec3 brass = vec3(0.84, 0.64, 0.29);   // #D6A24A
    vec3 brassLo = vec3(0.54, 0.39, 0.16); // #8A6428

    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    vec3 col = mix(brass, brassHi, intensity + sin(uTime * 2.0) * 0.1);

    gl_FragColor = vec4(col, 0.9);
  }
`;

export const Core: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      meshRef.current.rotation.y = t * 0.15;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2.0 + Math.sin(t * 1.5) * 0.3;
    }
  });

  return (
    <group>
      {/* Central Liquid Core Mesh */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.1, 48, 48]} />
        <shaderMaterial
          vertexShader={coreVertexShader}
          fragmentShader={coreFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>

      {/* Core Point Light Breathing Pulse */}
      <pointLight ref={lightRef} color="#F0C879" intensity={2.0} distance={15} />

      {/* Brass Corona Halo Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.35, 64]} />
        <meshBasicMaterial color="#F0C879" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
