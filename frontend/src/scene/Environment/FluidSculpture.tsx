import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FluidSculpture: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // High resolution plane geometry for organic fluid sculpting
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(40, 26, 128, 128);
  }, []);

  // Multi-frequency organic wave surface displacement over time
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * 0.35;
    const positionAttribute = geometry.attributes.position;

    const mouseX = state.pointer.x * 1.2;
    const mouseY = state.pointer.y * 1.2;

    for (let i = 0; i < positionAttribute.count; i++) {
      const u = positionAttribute.getX(i);
      const v = positionAttribute.getY(i);

      // Layered trigonometric organic folds (liquid metal fabric)
      const wave1 = Math.sin(u * 0.22 + time) * Math.cos(v * 0.22 + time * 0.7) * 2.8;
      const wave2 = Math.sin(u * 0.45 - time * 0.9) * Math.cos(v * 0.35 + time * 1.1) * 1.4;
      const wave3 = Math.sin((u * 0.15 + v * 0.25) + time * 0.4) * 1.8;

      const z = wave1 + wave2 + wave3;
      positionAttribute.setZ(i, z);
    }

    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();

    // Smooth camera/object parallax responding to cursor
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -0.35 + mouseY * 0.06, 0.04);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mouseX * 0.06, 0.04);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, -0.12 + mouseX * 0.02, 0.04);
  });

  return (
    <group position={[0, -0.5, -6]}>
      {/* Warm Burnt Amber / Copper Key Light */}
      <directionalLight position={[-14, 10, 12]} intensity={4.2} color="#E57238" />
      
      {/* Deep Navy / Cyan Secondary Fill Light */}
      <directionalLight position={[14, -10, 10]} intensity={3.2} color="#2563EB" />
      
      {/* Top Specular Rim Light */}
      <pointLight position={[0, 16, 6]} intensity={5.0} color="#F59E0B" distance={45} />

      <mesh ref={meshRef} geometry={geometry} rotation={[-0.35, 0, -0.12]}>
        <meshPhysicalMaterial
          ref={materialRef}
          color="#060913"
          roughness={0.12}
          metalness={0.92}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
          reflectivity={0.98}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
